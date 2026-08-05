import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";

export class MemoryStage extends BaseStage {
  readonly name = "Memory";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /**
     * Human OS Alpha
     *
     * This stage is responsible for memory processing.
     *
     * Future responsibilities:
     * - Retrieve memories
     * - Store memories
     * - Rank memories
     * - Episodic memory
     * - Semantic memory
     */

    state.executedStages.push(this.name);

    state.memory.push(
      "Memory stage executed."
    );

    state.updatedAt = new Date();

    return state;
  }
}