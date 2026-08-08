import { BrainState } from "../brainState";

import {
  RuntimeServices,
} from "./runtimeServices";

import {
  InputStage,
} from "./steps/inputStage";

import {
  MemoryStage,
} from "./steps/memoryStage";

import {
  IntentStage,
} from "./steps/intentStage";

import {
  BrainStateStage,
} from "./steps/brainStateStage";

import {
  ContextStage,
} from "./steps/contextStage";

import {
  ReasoningStage,
} from "./steps/reasoningStage";

import {
  PlanningStage,
} from "./steps/planningStage";

import {
  DecisionStage,
} from "./steps/decisionStage";

import {
  ExecutionStage,
} from "./steps/executionStage";

import {
  ResponseStage,
} from "./steps/responseStage";

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
    this.register(
      new InputStage()
    );

    this.register(
      new MemoryStage()
    );

    this.register(
      new IntentStage()
    );

    this.register(
      new BrainStateStage()
    );

    this.register(
      new ContextStage()
    );

    this.register(
      new ReasoningStage()
    );

    this.register(
      new PlanningStage()
    );

    this.register(
      new DecisionStage()
    );

    this.register(
      new ExecutionStage()
    );

    this.register(
      new ResponseStage(
        this.services
      )
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
    let current = state;

    for (
      const stage of
      this.stages
    ) {
      current =
        await stage.execute(
          current
        );
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