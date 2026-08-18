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
  SkillStage,
} from "./steps/skillStage";

import {
  ContextStage,
} from "./steps/contextStage";

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
  ExecutionStage,
} from "./steps/executionStage";

import {
  ResponseStage,
} from "./steps/responseStage";

import {
  ResponseValidationStage,
} from "./steps/responseValidationStage";

import {
  OutcomeStage,
} from "./steps/outcomeStage";

import {
  ReflectionStage,
} from "./steps/reflectionStage";

import {
  Stage,
} from "./steps/stage";

/**
 * CognitiveRuntime
 *
 * Owns the canonical Human OS cognitive lifecycle.
 *
 * The runtime is responsible for:
 *
 * - Stage registration
 * - Deterministic stage ordering
 * - Stage execution
 * - Failure propagation
 * - Outcome finalization
 * - Reflection finalization
 *
 * BrainState remains the shared cognitive state.
 *
 * Domain engines remain responsible for
 * domain-specific behavior.
 */
export class CognitiveRuntime {
  private readonly stages:
    Stage[] = [];

  constructor(
    public readonly services:
      RuntimeServices
  ) {
    /*
    |--------------------------------------------------------------------------
    | Input
    |--------------------------------------------------------------------------
    */

    this.register(
      new InputStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Intent
    |--------------------------------------------------------------------------
    */

    this.register(
      new IntentStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Live Knowledge
    |--------------------------------------------------------------------------
    */

    this.register(
      new LiveKnowledgeStage(
        this.services
      )
    );

    /*
    |--------------------------------------------------------------------------
    | Memory Extraction
    |--------------------------------------------------------------------------
    */

    this.register(
      new MemoryExtractionStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Timeline Extraction
    |--------------------------------------------------------------------------
    */

    this.register(
      new TimelineExtractionStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Memory Retrieval
    |--------------------------------------------------------------------------
    */

    this.register(
      new MemoryStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Unified BrainState
    |--------------------------------------------------------------------------
    */

    this.register(
      new BrainStateStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Human Profile
    |--------------------------------------------------------------------------
    */

    this.register(
      new ProfileStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Reasoning Graph
    |--------------------------------------------------------------------------
    */

    this.register(
      new ReasoningGraphStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Prediction
    |--------------------------------------------------------------------------
    */

    this.register(
      new PredictionStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Prediction History
    |--------------------------------------------------------------------------
    */

    this.register(
      new PredictionHistoryStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Prediction Memory
    |--------------------------------------------------------------------------
    */

    this.register(
      new PredictionMemoryStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Local Skills
    |--------------------------------------------------------------------------
    */

    this.register(
      new SkillStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Context
    |--------------------------------------------------------------------------
    */

    this.register(
      new ContextStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Reasoning
    |--------------------------------------------------------------------------
    */

    this.register(
      new ReasoningStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Inference
    |--------------------------------------------------------------------------
    */

    this.register(
      new InferenceStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Planning
    |--------------------------------------------------------------------------
    */

    this.register(
      new PlanningStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Decision
    |--------------------------------------------------------------------------
    */

    this.register(
      new DecisionStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    this.register(
      new ValidationStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Execution
    |--------------------------------------------------------------------------
    */

    this.register(
      new ExecutionStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    this.register(
      new ResponseStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Response Validation
    |--------------------------------------------------------------------------
    */

    this.register(
      new ResponseValidationStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Outcome
    |--------------------------------------------------------------------------
    */

    this.register(
      new OutcomeStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Reflection
    |--------------------------------------------------------------------------
    */

    this.register(
      new ReflectionStage()
    );
  }

  /**
   * Register a cognitive stage.
   *
   * Every stage must have one canonical runtime owner.
   */
  register(
    stage: Stage
  ): void {
    const stageName =
      stage.name.trim();

    if (
      !stageName
    ) {
      throw new Error(
        "CognitiveRuntime cannot register a stage without a name."
      );
    }

    const duplicate =
      this.stages.some(
        (
          registeredStage
        ) =>
          registeredStage.name ===
          stageName
      );

    if (
      duplicate
    ) {
      throw new Error(
        `CognitiveRuntime cannot register duplicate stage "${stageName}".`
      );
    }

    this.stages.push(
      stage
    );
  }

  /**
   * Execute the canonical cognitive lifecycle.
   */
  async execute(
    state: BrainState
  ): Promise<BrainState> {
    let current =
      state;

    for (
      const stage of
      this.stages
    ) {
      try {
        current =
          await stage.execute(
            current
          );
      } catch {
        /*
        |--------------------------------------------------------------------------
        | Stage failure
        |--------------------------------------------------------------------------
        |
        | BaseStage already records:
        |
        | - executed stage
        | - error
        | - diagnostic
        |
        | Stop downstream cognitive processing so later
        | stages cannot operate on invalid state.
        |
        */

        current.runtimeStatus =
          "failed";

        break;
      }

      current.updatedAt =
        new Date();
    }

    /*
    |--------------------------------------------------------------------------
    | Outcome finalization
    |--------------------------------------------------------------------------
    |
    | If a stage failed before Outcome, execute the canonical
    | OutcomeStage once so the cognitive cycle still receives
    | a durable outcome artifact.
    |
    */

    if (
      !current.outcome
    ) {
      const outcomeStage =
        this.stages.find(
          (
            stage
          ) =>
            stage.name ===
            "Outcome"
        );

      if (
        outcomeStage
      ) {
        try {
          current =
            await outcomeStage.execute(
              current
            );
        } catch (
          error
        ) {
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

    /*
    |--------------------------------------------------------------------------
    | Reflection finalization
    |--------------------------------------------------------------------------
    |
    | Reflection is a post-processing feedback operation.
    |
    | It must not run after a failed cognitive cycle.
    |
    */

    const reflectionStage =
      this.stages.find(
        (
          stage
        ) =>
          stage.name ===
          "Reflection"
      );

    const reflectionExecuted =
      current.executedStages.includes(
        "Reflection"
      );

    const runtimeFailed =
      current.errors.length >
      0;

    if (
      reflectionStage &&
      !reflectionExecuted &&
      !runtimeFailed
    ) {
      try {
        current =
          await reflectionStage.execute(
            current
          );
      } catch (
        error
      ) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        current.errors.push(
          `Reflection: ${message}`
        );

        /*
        |--------------------------------------------------------------------------
        | Outcome synchronization
        |--------------------------------------------------------------------------
        |
        | Outcome was finalized before Reflection.
        | If Reflection fails, synchronize the outcome
        | with the final runtime failure.
        |
        */

        current.outcome =
          createRuntimeOutcome({
            result:
              current.response,

            errors:
              current.errors,

            executionId:
              current.currentExecutionId,

            executionStatus:
              current.outcome
                ?.metadata
                .executionStatus ??
              null,

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

    /*
    |--------------------------------------------------------------------------
    | Runtime timestamp
    |--------------------------------------------------------------------------
    */

    current.updatedAt =
      new Date();

    return current;
  }

  /**
   * Return the canonical runtime stage list.
   */
  getStages():
    readonly Stage[] {
    return this.stages;
  }
}