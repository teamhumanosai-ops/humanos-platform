import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";

import { loadMemories } from "../../memory";

export class MemoryStage extends BaseStage {
  readonly name = "Memory";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const memories = await loadMemories();

    state.memories = memories;

    state.memory = memories.map(
      (memory) => memory.value
    );

    return state;
  }
}