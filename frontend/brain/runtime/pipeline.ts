import { BrainState } from "../brainState";
import { MemoryStage } from "./steps/memoryStage";
import { Stage } from "./steps/stage";

export class CognitiveRuntime {
  private readonly stages: Stage[] = [];

  constructor() {
    // Default cognitive pipeline
    this.register(new MemoryStage());
  }

  /**
   * Register a cognitive stage.
   */
  register(stage: Stage): void {
    this.stages.push(stage);
  }

  /**
   * Execute every registered stage.
   */
  async execute(
    state: BrainState
  ): Promise<BrainState> {
    let current = state;

    for (const stage of this.stages) {
      current = await stage.execute(current);
    }

    current.updatedAt = new Date();

    return current;
  }

  /**
   * Return the currently registered stages.
   */
  getStages(): readonly Stage[] {
    return this.stages;
  }
}