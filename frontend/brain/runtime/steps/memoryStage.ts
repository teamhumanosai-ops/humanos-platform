import {
  retrieveRelevantMemories,
} from "../../memory";

import {
  BrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

const MAX_RELEVANT_MEMORIES = 10;

export class MemoryStage
  extends BaseStage {
  readonly name =
    "Memory";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const memories =
      await retrieveRelevantMemories(
        state.userMessage,
        MAX_RELEVANT_MEMORIES
      );

    state.memories =
      memories;

    state.memory =
      memories.map(
        (memory) =>
          memory.value
      );

    return state;
  }
}
