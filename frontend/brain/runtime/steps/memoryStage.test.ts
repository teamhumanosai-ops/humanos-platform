import {
  createBrainState,
} from "../../brainState";

import {
  MemoryStage,
} from "./memoryStage";

async function verifyLifeDomainMemoryContext(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Help me plan my budget"
    );

  state.primaryLifeDomain =
    "finance";

  const result =
    await new MemoryStage().execute(
      state
    );

  if (
    !result.memories
  ) {
    throw new Error(
      "memory stage must preserve the memory collection"
    );
  }
}

void verifyLifeDomainMemoryContext();
