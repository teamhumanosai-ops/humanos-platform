import {
  BrainState,
} from "../../brainState";

import {
  buildContext,
} from "../../context";

import {
  analyzeContentSources,
} from "../../contentIntelligence";

import {
  getLifeDomain,
} from "../../lifeDomains";

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
 * Content Intelligence analyzes source structure,
 * freshness, completeness, and provider agreement
 * without treating metadata as proof of truth.
 *
 * Conversation continuity is included when older
 * messages fall outside the short-term window.
 *
 * The persisted Human Profile is included when
 * ProfileStage has hydrated it into BrainState.
 *
 * Life Domain Intelligence is included as a bounded
 * request-routing signal and is not treated as a
 * permanent user attribute.
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

    state.contentIntelligence =
      analyzeContentSources(
        state.citations
      );

    let prompt =
      structuredContext.prompt;

    const primaryDomain =
      getLifeDomain(
        state.primaryLifeDomain
      );

    prompt +=
      [
        "",
        "LIFE DOMAIN CONTEXT:",
        `Primary domain: ${primaryDomain.label} (${primaryDomain.id})`,
        `Domain description: ${primaryDomain.description}`,
        `Detected domains: ${state.lifeDomains
          .map(
            (match) =>
              `${match.domain}=${match.score}`
          )
          .join(", ")}`,
        "Treat domain detection as a routing signal for this request, not as a permanent user attribute.",
      ].join("\n");

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

    if (
      state.contentIntelligence
        .sourceCount >
      0
    ) {
      const content =
        state.contentIntelligence;

      prompt +=
        [
          "",
          "CONTENT INTELLIGENCE:",
          `Sources: ${content.sourceCount}`,
          `Unique domains: ${content.uniqueDomainCount}`,
          `Providers represented: ${content.providerCount}`,
          `Cross-provider agreement: ${content.crossProviderAgreementCount}`,
          `Average freshness: ${content.averageFreshness.toFixed(2)}`,
          `Average completeness: ${content.averageCompleteness.toFixed(2)}`,
          "",
          "Cross-provider agreement is an evidence-strength signal, not proof of factual correctness.",
          "Source metadata describes retrieval structure and completeness; it does not establish factual truth.",
        ].join("\n");
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
                ) => {
                  const providers =
                    citation.providers?.join(
                      ", "
                    ) ??
                    "unknown";

                  return `[${citation.index}] ${citation.title} — ${citation.url} — Providers: ${providers}`;
                }
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
