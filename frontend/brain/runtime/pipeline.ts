import {
  BrainState,
} from "../brainState";

import {
  RuntimeServices,
} from "./runtimeServices";

import {
  createRuntimeOutcome,
} from "./outcome";

import {
  InputStage,
} from "./steps/inputStage";
import {
  IntentStage,
} from "./steps/intentStage";
import {
  LiveKnowledgeStage,
} from "./steps/liveKnowledgeStage";
import {
  MemoryExtractionStage,
} from "./steps/memoryExtractionStage";
import {
  TimelineExtractionStage,
} from "./steps/timelineExtractionStage";
import {
  MemoryStage,
} from "./steps/memoryStage";
import {
  BrainStateStage,
} from "./steps/brainStateStage";
import {
  ProfileStage,
} from "./steps/profileStage";
import {
  ReasoningGraphStage,
} from "./steps/reasoningGraphStage";
import {
  PredictionStage,
} from "./steps/predictionStage";
import {
  PredictionHistoryStage,
} from "./steps/predictionHistoryStage";
import {
  PredictionMemoryStage,
} from "./steps/predictionMemoryStage";
import {
  PredictionConsolidationStage,
} from "./steps/predictionConsolidationStage";
import {
  PredictionConfidenceStage,
} from "./steps/predictionConfidenceStage";
import {
  SkillStage,
} from "./steps/skillStage";
import {
  ContextStage,
} from "./steps/contextStage";
import {
  RecommendationStage,
} from "./steps/recommendationStage";
import {
  ReasoningStage,
} from "./steps/reasoningStage";
import {
  InferenceStage,
} from "./steps/inferenceStage";
import {
  PlanningStage,
} from "./steps/planningStage";
import {
  DecisionStage,
} from "./steps/decisionStage";
import {
  ValidationStage,
} from "./steps/validationStage";
import {
  ActionRoutingStage,
} from "./steps/actionRoutingStage";
import {
  ActionDispatchStage,
} from "./steps/actionDispatchStage";
import {
  ExecutionStage,
} from "./steps/executionStage";
import {
  ResponseStage,
} from "./steps/responseStage";
import {
  ResponseValidationStage,
} from "./steps/responseValidationStage";
import {
  ReflectionStage,
} from "./steps/reflectionStage";
import {
  AutonomyStage,
} from "./steps/autonomyStage";
import {
  OutcomeStage,
} from "./steps/outcomeStage";
import {
  Stage,
} from "./steps/stage";

/**
 * CognitiveRuntime
 *
 * Owns the canonical Human OS cognitive lifecycle.
 * BrainState remains the shared cognitive state while
 * domain services own actual provider/tool operations.
 *
 * Outcome is deliberately terminal: reflection and autonomy
 * enrich the completed cognitive cycle before the final runtime
 * artifact is materialized.
 */
export class CognitiveRuntime {
  private readonly stages:
    Stage[] = [];

  constructor(
    public readonly services:
      RuntimeServices
  ) {
    this.register(new InputStage());
    this.register(new IntentStage());
    this.register(new LiveKnowledgeStage(this.services));
    this.register(new MemoryExtractionStage());
    this.register(new TimelineExtractionStage());
    this.register(new MemoryStage());
    this.register(new BrainStateStage());
    this.register(new ProfileStage());
    this.register(new ReasoningGraphStage());
    this.register(new PredictionStage());
    this.register(new PredictionHistoryStage());
    this.register(new PredictionMemoryStage());
    this.register(new PredictionConsolidationStage());
    this.register(new PredictionConfidenceStage());
    this.register(new SkillStage());
    this.register(new ContextStage());
    this.register(new RecommendationStage());
    this.register(new ReasoningStage());
    this.register(new InferenceStage());
    this.register(new PlanningStage());
    this.register(new DecisionStage());
    this.register(new ValidationStage());
    this.register(new ActionRoutingStage());
    this.register(new ActionDispatchStage());
    this.register(new ExecutionStage(this.services));
    this.register(new ResponseStage());
    this.register(new ResponseValidationStage());
    this.register(new ReflectionStage());
    this.register(new AutonomyStage());
    this.register(new OutcomeStage());
  }

  register(
    stage: Stage
  ): void {
    const stageName =
      stage.name.trim();

    if (!stageName) {
      throw new Error(
        "CognitiveRuntime cannot register a stage without a name."
      );
    }

    if (
      this.stages.some(
        (registeredStage) =>
          registeredStage.name === stageName
      )
    ) {
      throw new Error(
        `CognitiveRuntime cannot register duplicate stage "${stageName}".`
      );
    }

    this.stages.push(stage);
  }

  async execute(
    state: BrainState
  ): Promise<BrainState> {
    let current = state;

    for (const stage of this.stages) {
      try {
        current =
          await stage.execute(current);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        current.errors.push(
          `${stage.name}: ${message}`
        );

        current.runtimeStatus =
          "failed";
        break;
      }

      current.updatedAt =
        new Date();
    }

    if (!current.outcome) {
      const outcomeStage =
        this.stages.find(
          (stage) =>
            stage.name === "Outcome"
        );

      if (outcomeStage) {
        try {
          current =
            await outcomeStage.execute(
              current
            );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : String(error);

          current.errors.push(
            `Outcome: ${message}`
          );
          current.runtimeStatus =
            "failed";
        }
      }
    }

    const reflectionStage =
      this.stages.find(
        (stage) =>
          stage.name === "Reflection"
      );

    const reflectionExecuted =
      current.executedStages.includes(
        "Reflection"
      );

    if (
      reflectionStage &&
      !reflectionExecuted &&
      current.errors.length === 0
    ) {
      try {
        current =
          await reflectionStage.execute(
            current
          );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        current.errors.push(
          `Reflection: ${message}`
        );

        current.outcome =
          createRuntimeOutcome({
            result:
              current.response,
            errors:
              current.errors,
            executionId:
              current.currentExecutionId,
            executionStatus:
              current.outcome?.metadata
                .executionStatus ?? null,
            executionResult:
              current.outcome?.metadata
                .executionResult ?? null,
            planId:
              current.currentPlanId,
            decisionId:
              current.currentDecisionId,
            stagesExecuted:
              current.executedStages,
          });

        current.runtimeStatus =
          "failed";
      }
    }

    current.updatedAt =
      new Date();

    return current;
  }

  getStages():
    readonly Stage[] {
    return this.stages;
  }
}
