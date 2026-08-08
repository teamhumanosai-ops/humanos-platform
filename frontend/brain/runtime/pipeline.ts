import { BrainState } from "../brainState";

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
    this.register(new InputStage());

    this.register(new IntentStage());

    this.register(
      new MemoryExtractionStage()
    );

    this.register(
      new TimelineExtractionStage()
    );

    this.register(new MemoryStage());

    this.register(
      new BrainStateStage()
    );

    this.register(new SkillStage());

    this.register(new ContextStage());

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
      current =
        await stage.execute(current);
    }

    current.updatedAt = new Date();

    return current;
  }

  getStages(): readonly Stage[] {
    return this.stages;
  }
}