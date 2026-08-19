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
 * Canonical lifecycle:
 *
 * Input
 * -> Intent
 * -> Knowledge / Memory / Profile
 * -> Prediction
 * -> Context / Recommendation / Reasoning
 * -> Inference / Planning / Decision / Validation
 * -> ActionRouting / ActionDispatch / Execution
 * -> Response / ResponseValidation
 * -> Reflection
 * -> Autonomy
 * -> Outcome
 *
 * Outcome is deliberately terminal. Reflection and autonomy
 * therefore enrich the completed cognitive cycle before the
 * final runtime artifact is materialized.
 *
 * The runtime also owns terminal failure recovery. If a stage
 * fails before Outcome, the runtime does not pretend the cycle
 * completed successfully; it asks Outcome to materialize the
 * durable failure artifact and then stops.
 */
export class CognitiveRuntime {
  private readonly stages:
    Stage[] = [];

  constructor(
    public readonly services:
      RuntimeServices
  ) {
    this.registerCanonicalStages();
  }

  /**
   * Register every canonical stage in lifecycle order.
   *
   * The registration is intentionally grouped by responsibility
   * rather than placed in one large constructor block. This keeps
   * the lifecycle auditable while preserving the exact stage order.
   */
  private registerCanonicalStages(): void {
    this.registerInputStages();
    this.registerKnowledgeAndMemoryStages();
    this.registerPredictionStages();
    this.registerCognitiveStages();
    this.registerActionStages();
    this.registerResponseStages();
    this.registerTerminalStages();
  }

  /**
   * Input and intent establish the request boundary.
   */
  private registerInputStages(): void {
    this.register(
      new InputStage()
    );

    this.register(
      new IntentStage()
    );
  }

  /**
   * Knowledge, memory, timeline, brain state, profile, and
   * reasoning graph are assembled before prediction begins.
   */
  private registerKnowledgeAndMemoryStages(): void {
    this.register(
      new LiveKnowledgeStage(
        this.services
      )
    );

    this.register(
      new MemoryExtractionStage()
    );

    this.register(
      new TimelineExtractionStage()
    );

    this.register(
      new MemoryStage()
    );

    this.register(
      new BrainStateStage()
    );

    this.register(
      new ProfileStage()
    );

    this.register(
      new ReasoningGraphStage()
    );
  }

  /**
   * Prediction is deliberately enriched in deterministic order:
   * history, memory, consolidation, then confidence.
   */
  private registerPredictionStages(): void {
    this.register(
      new PredictionStage()
    );

    this.register(
      new PredictionHistoryStage()
    );

    this.register(
      new PredictionMemoryStage()
    );

    this.register(
      new PredictionConsolidationStage()
    );

    this.register(
      new PredictionConfidenceStage()
    );
  }

  /**
   * Cognitive interpretation consumes the enriched prediction
   * state and prepares the action decision boundary.
   */
  private registerCognitiveStages(): void {
    this.register(
      new SkillStage()
    );

    this.register(
      new ContextStage()
    );

    this.register(
      new RecommendationStage()
    );

    this.register(
      new ReasoningStage()
    );

    this.register(
      new InferenceStage()
    );

    this.register(
      new PlanningStage()
    );

    this.register(
      new DecisionStage()
    );

    this.register(
      new ValidationStage()
    );
  }

  /**
   * Action routing and dispatch are kept separate from execution.
   * This prevents a selected action from being treated as an
   * executed action merely because routing succeeded.
   */
  private registerActionStages(): void {
    this.register(
      new ActionRoutingStage()
    );

    this.register(
      new ActionDispatchStage()
    );

    this.register(
      new ExecutionStage(
        this.services
      )
    );
  }

  /**
   * Response construction and validation must complete before
   * reflection can evaluate the quality of the cognitive cycle.
   */
  private registerResponseStages(): void {
    this.register(
      new ResponseStage()
    );

    this.register(
      new ResponseValidationStage()
    );
  }

  /**
   * Reflection and autonomy enrich the cycle; Outcome is always
   * the final registered stage and therefore the final normal-path
   * execution boundary.
   */
  private registerTerminalStages(): void {
    this.register(
      new ReflectionStage()
    );

    this.register(
      new AutonomyStage()
    );

    this.register(
      new OutcomeStage()
    );

    this.assertCanonicalTerminalOrder();
  }

  /**
   * Register one stage after validating its identity.
   */
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
          registeredStage.name ===
          stageName
      )
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
   * Execute the canonical lifecycle from the current state.
   */
  async execute(
    state: BrainState
  ): Promise<BrainState> {
    let current = state;

    for (
      const stage of this.stages
    ) {
      const execution =
        await this.executeStage(
          stage,
          current
        );

      current =
        execution.state;

      if (
        execution.halted
      ) {
        current =
          await this.recoverTerminalOutcome(
            current
          );

        current.updatedAt =
          new Date();

        return current;
      }

      current.updatedAt =
        new Date();
    }

    current =
      await this.ensureTerminalOutcome(
        current
      );

    current.updatedAt =
      new Date();

    return current;
  }

  /**
   * Execute one stage and convert stage exceptions into runtime
   * failure state without throwing outside the lifecycle boundary.
   */
  private async executeStage(
    stage: Stage,
    state: BrainState
  ): Promise<{
    state: BrainState;
    halted: boolean;
  }> {
    try {
      const next =
        await stage.execute(
          state
        );

      return {
        state:
          next,
        halted:
          false,
      };
    } catch (error) {
      this.recordStageFailure(
        state,
        stage,
        error
      );

      return {
        state,
        halted:
          true,
      };
    }
  }

  /**
   * Convert an unknown thrown value into a stable runtime error.
   * BaseStage already records its own failure, so this boundary
   * only appends the error when it has not already been preserved.
   */
  private recordStageFailure(
    state: BrainState,
    stage: Stage,
    error: unknown
  ): void {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const formatted =
      `${stage.name}: ${message}`;

    const lastError =
      state.errors[
        state.errors.length - 1
      ];

    if (
      lastError !==
      formatted
    ) {
      state.errors.push(
        formatted
      );
    }

    state.runtimeStatus =
      "failed";
  }

  /**
   * When a failure happens before Outcome, ask the registered
   * Outcome stage to materialize the terminal failure artifact.
   */
  private async recoverTerminalOutcome(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.outcome
    ) {
      return state;
    }

    const outcomeStage =
      this.findStage(
        "Outcome"
      );

    if (!outcomeStage) {
      state.errors.push(
        "CognitiveRuntime: terminal Outcome stage is not registered."
      );

      state.outcome =
        createRuntimeOutcome({
          result:
            state.response ?? null,
          errors:
            state.errors,
          executionId:
            state.currentExecutionId,
          executionStatus:
            null,
          executionResult:
            null,
          planId:
            state.currentPlanId,
          decisionId:
            state.currentDecisionId,
          stagesExecuted:
            state.executedStages,
        });

      state.runtimeStatus =
        "failed";

      return state;
    }

    try {
      return await outcomeStage.execute(
        state
      );
    } catch (error) {
      this.recordStageFailure(
        state,
        outcomeStage,
        error
      );

      return state;
    }
  }

  /**
   * Normal execution should already have produced Outcome. This
   * guard exists for defensive compatibility with custom stage
   * registration or future lifecycle extensions.
   */
  private async ensureTerminalOutcome(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.outcome
    ) {
      return state;
    }

    const outcomeStage =
      this.findStage(
        "Outcome"
      );

    if (!outcomeStage) {
      state.errors.push(
        "CognitiveRuntime: terminal Outcome stage is not registered."
      );

      state.outcome =
        createRuntimeOutcome({
          result:
            state.response ?? null,
          errors:
            state.errors,
          executionId:
            state.currentExecutionId,
          executionStatus:
            null,
          executionResult:
            null,
          planId:
            state.currentPlanId,
          decisionId:
            state.currentDecisionId,
          stagesExecuted:
            state.executedStages,
        });

      state.runtimeStatus =
        "failed";

      return state;
    }

    try {
      return await outcomeStage.execute(
        state
      );
    } catch (error) {
      this.recordStageFailure(
        state,
        outcomeStage,
        error
      );

      return state;
    }
  }

  /**
   * Resolve a stage by its canonical name.
   */
  private findStage(
    name: string
  ): Stage | undefined {
    return this.stages.find(
      (stage) =>
        stage.name === name
    );
  }

  /**
   * Assert the lifecycle's terminal ordering during construction.
   * This fails early if future changes accidentally move Outcome
   * ahead of reflection or autonomy.
   */
  private assertCanonicalTerminalOrder(): void {
    const reflectionIndex =
      this.stages.findIndex(
        (stage) =>
          stage.name ===
          "Reflection"
      );

    const autonomyIndex =
      this.stages.findIndex(
        (stage) =>
          stage.name ===
          "Autonomy"
      );

    const outcomeIndex =
      this.stages.findIndex(
        (stage) =>
          stage.name ===
          "Outcome"
      );

    if (
      reflectionIndex < 0 ||
      autonomyIndex < 0 ||
      outcomeIndex < 0
    ) {
      throw new Error(
        "CognitiveRuntime requires Reflection, Autonomy, and Outcome stages."
      );
    }

    if (
      !(
        reflectionIndex <
        autonomyIndex &&
        autonomyIndex <
        outcomeIndex
      )
    ) {
      throw new Error(
        "CognitiveRuntime requires Reflection -> Autonomy -> Outcome ordering."
      );
    }

    if (
      outcomeIndex !==
      this.stages.length - 1
    ) {
      throw new Error(
        "CognitiveRuntime requires Outcome to remain the terminal registered stage."
      );
    }
  }

  /**
   * Return the complete canonical stage list for diagnostics and
   * regression tests without exposing the mutable backing array.
   */
  getStages():
    readonly Stage[] {
    return this.stages;
  }
}
