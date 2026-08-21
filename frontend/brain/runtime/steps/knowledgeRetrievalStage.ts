import {
  retrieveKnowledgeResults,
} from "../../knowledge/retriever";

import {
  BrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

const MAX_KNOWLEDGE_RESULTS = 5;
const MAX_KNOWLEDGE_QUERY_LENGTH = 4200;

function buildKnowledgeQuery(
  state: BrainState
): string {
  const currentMessage =
    state.userMessage.trim();

  const continuity =
    state.conversationContinuity.trim();

  const domain =
    state.primaryLifeDomain;

  const domainContext =
    domain && domain !== "general"
      ? `\n\nRequest life domain: ${domain}`
      : "";

  const continuityContext =
    continuity
      ? `\n\nConversation continuity:\n${continuity}`
      : "";

  return `${currentMessage}${domainContext}${continuityContext}`
    .slice(
      0,
      MAX_KNOWLEDGE_QUERY_LENGTH
    );
}

export class KnowledgeRetrievalStage
  extends BaseStage {
  readonly name =
    "KnowledgeRetrieval";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const query =
      buildKnowledgeQuery(state);

    if (!query) {
      state.knowledge = [];
      return state;
    }

    const results =
      await retrieveKnowledgeResults(
        query
      );

    state.knowledge =
      results
        .slice(
          0,
          MAX_KNOWLEDGE_RESULTS
        )
        .map((result) => ({
          source:
            result.source,
          text:
            result.text,
          score:
            result.score,
        }));

    return state;
  }
}
