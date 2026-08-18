import {
  BrainState,
} from "../../brainState";

import {
  buildContext,
} from "../../context";

import {
  Intent,
} from "../../intent";

import {
  BaseStage,
} from "./baseStage";

/**
 * ContextStage
 *
 * Consumes the cognitive information already
 * hydrated into BrainState and composes the
 * context consumed by downstream reasoning
 * and response stages.
 *
 * Live web evidence is explicitly included
 * when LiveKnowledgeStage has executed.
 *
 * Conversation continuity is included when older
 * messages fall outside the short-term window.
 *
 * The persisted Human Profile is included when
 * ProfileStage has hydrated it into BrainState.
 */
export class ContextStage
  extends BaseStage {
  readonly name =
    "Context";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.response
    ) {
      return state;
    }

    const structuredContext =
      await buildContext(
        state
      );

    let prompt =
      structuredContext.prompt;

    if (
      state.profile
    ) {
      prompt +=
        `\n\nHUMAN PROFILE:\n\n${JSON.stringify(
          state.profile
        )}\n\nUse the profile as persistent user context. Do not treat missing fields as known facts.`;
    }

    if (
      state.conversationContinuity
    ) {
      prompt +=
        `\n\nCONVERSATION CONTINUITY:\n\n${state.conversationContinuity}\n\nThe continuity above represents older conversation turns that are outside the active short-term message window. Use it only as historical conversational context and do not treat clipped content as a complete transcript.`;
    }

    switch (
      state.intent
    ) {
      case Intent.STARTUP_PLANNING:
        prompt +=
          "\n\nThe user wants startup advice. Think like an experienced startup founder and advisor.";
        break;

      case Intent.LIVE_SEARCH:
        prompt +=
          "\n\nThe user needs current information. Ground current factual claims in the live web evidence below.";

        if (
          state.liveKnowledge.length >
          0
        ) {
          prompt +=
            `\n\nLIVE WEB EVIDENCE:\n\n${state.liveKnowledge.join(
              "\n\n"
            )}`;
        } else {
          prompt +=
            "\n\nNo live web evidence was retrieved.";
        }

        if (
          state.citations.length >
          0
        ) {
          prompt +=
            "\n\nLIVE WEB SOURCES:\n\n" +
            state.citations
              .map(
                (
                  citation
                ) =>
                  `[${citation.index}] ${citation.title} — ${citation.url}`
              )
              .join(
                "\n"
              );
        }

        break;

      default:
        break;
    }

    state.context =
      prompt;

    state.knowledge =
      structuredContext.knowledge;

    return state;
  }
}
