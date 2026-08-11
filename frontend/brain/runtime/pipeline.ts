import {
  BrainState,
} from "../brainState";

import {
  RuntimeServices,
} from "./runtimeServices";

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
  ReasoningGraphStage,
} from "./steps/reasoningGraphStage";

import {
  PredictionStage,
} from "./steps/predictionStage";

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
    | Reasoning Graph
    |--------------------------------------------------------------------------
    */

    this.register(
      new ReasoningGraphStage()
    );

    /*
    |--------------------------------------------------------------------------
    | Prediction Intelligence
    |--------------------------------------------------------------------------
    */

    this.register(
      new PredictionStage()
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
    | Cognitive Inference
    |--------------------------------------------------------------------------
    |
    | Inference consumes the structured reasoning
    | evidence produced immediately above.
    |
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

  register(
    stage: Stage
  ): void {
    this.stages.push(
      stage
    );
  }

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
        | BaseStage already records the error and
        | diagnostic information. The runtime stops
        | downstream cognitive processing so that
        | later stages cannot operate on invalid state.
        |--------------------------------------------------------------------------
        */

        break;
      }

      current.updatedAt =
        new Date();
    }

    /*
    |--------------------------------------------------------------------------
    | Outcome finalization
    |--------------------------------------------------------------------------
    */

    if (
      !current.outcome
    ) {
      const outcomeStage =
        this.stages.find(
          (stage) =>
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
        } catch {
          /*
          |--------------------------------------------------------------------------
          | Outcome failure should not hide the
          | original runtime failure.
          |--------------------------------------------------------------------------
          */
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Reflection finalization
    |--------------------------------------------------------------------------
    */

    const reflectionStage =
      this.stages.find(
        (stage) =>
          stage.name ===
          "Reflection"
      );

    const reflectionExecuted =
      current.executedStages.includes(
        "Reflection"
      );

    const runtimeFailed =
      current.errors.length > 0;

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