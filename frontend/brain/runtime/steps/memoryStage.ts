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

const MAX_MEMORY_QUERY_LENGTH = 4200;

/**
 * Build the memory retrieval query from the current request and the
 * bounded conversation continuity artifact.
 *
 * The current user message remains the strongest and most immediate
 * retrieval signal. Continuity is appended only when older conversation
 * exists, allowing durable memories relevant to earlier turns to re-enter
 * the current cognitive state without loading the entire conversation.
 */
function buildMemoryQuery(
  state: BrainState
): string {
  const currentMessage =
    state.userMessage.trim();

  const continuity =
    state.conversationContinuity.trim();

  if (!continuity) {
    return currentMessage;
  }

  return `${currentMessage}\n\nConversation continuity:\n${continuity}`
    .slice(
      0,
      MAX_MEMORY_QUERY_LENGTH
    );
}

export class MemoryStage
  extends BaseStage {
  readonly name =
    "Memory";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const query =
      buildMemoryQuery(
        state
      );

    const memories =
      await retrieveRelevantMemories(
        query,
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
