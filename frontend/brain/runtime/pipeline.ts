import { BrainState } from "../brainState";

import {
  createStageDiagnostic,
} from "./diagnostics";

import { RuntimeServices } from "./runtimeServices";

import { InputStage } from "./steps/inputStage";
import { IntentStage } from "./steps/intentStage";
import { MemoryExtractionStage } from "./steps/memoryExtractionStage";
import { TimelineExtractionStage } from "./steps/timelineExtractionStage";
import { MemoryStage } from "./steps/memoryStage";
import { BrainStateStage } from "./steps/brainStateStage";
import { SkillStage } from "./steps/skillStage";
import { ContextStage } from "./steps/contextStage";
import { ResponseStage } from "./steps/responseStage";
import { Stage } from "./steps/stage";

export class CognitiveRuntime {
  private readonly stages: Stage[] = [];

  constructor(
    public readonly services: RuntimeServices
  ) {
    this.register(
      new InputStage()
    );

    this.register(
      new IntentStage()
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
      new SkillStage()
    );

    this.register(
      new ContextStage()
    );

    this.register(
      new ResponseStage(
        this.services
      )
    );
  }

  register(stage: Stage): void {
    this.stages.push(stage);
  }

  async execute(
    state: BrainState
  ): Promise<BrainState> {
    let current = state;

    for (const stage of this.stages) {
      const startedAt =
        new Date();

      try {
        current =
          await stage.execute(
            current
          );

        const completedAt =
          new Date();

        current.executedStages.push(
          stage.name
        );

        current.diagnostics.push(
          createStageDiagnostic(
            stage.name,
            startedAt,
            completedAt
          )
        );
      } catch (error) {
        const completedAt =
          new Date();

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        current.executedStages.push(
          stage.name
        );

        current.errors.push(
          message
        );

        current.diagnostics.push(
          createStageDiagnostic(
            stage.name,
            startedAt,
            completedAt,
            message
          )
        );

        current.updatedAt =
          completedAt;

        throw error;
      }
    }

    current.updatedAt =
      new Date();

    return current;
  }

  getStages(): readonly Stage[] {
    return this.stages;
  }
}