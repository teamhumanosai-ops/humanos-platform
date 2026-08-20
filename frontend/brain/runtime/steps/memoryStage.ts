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
 * Build the memory retrieval query from the current request, bounded
 * conversation continuity, and the request-scoped life-domain signal.
 *
 * Life-domain context is intentionally a routing hint rather than a
 * durable user attribute. The current user message remains the strongest
 * retrieval signal.
 */
function buildMemoryQuery(
  state: BrainState
): string {
  const currentMessage =
    state.userMessage.trim();

  const continuity =
    state.conversationContinuity.trim();

  const primaryDomain =
    state.primaryLifeDomain;

  const domainContext =
    primaryDomain &&
    primaryDomain !== "general"
      ? `\n\nRequest life domain: ${primaryDomain}`
      : "";

  const continuityContext =
    continuity
      ? `\n\nConversation continuity:\n${continuity}`
      : "";

  return `${currentMessage}${domainContext}${continuityContext}`
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
