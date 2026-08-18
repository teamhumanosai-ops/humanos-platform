import { BrainState } from "../../brainState";
import { Intent } from "../../intent";

import {
  analyzeContentSources,
} from "../../contentIntelligence";

import {
  buildCitationSources,
} from "../../websearch/citations";

import type {
  RuntimeServices,
} from "../runtimeServices";

import { BaseStage } from "./baseStage";

export class LiveKnowledgeStage
  extends BaseStage {
  readonly name =
    "LiveKnowledge";

  constructor(
    private readonly services:
      RuntimeServices
  ) {
    super();
  }

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.intent !==
      Intent.LIVE_SEARCH
    ) {
      return state;
    }

    try {
      const search =
        await this.services.searchWeb(
          state.userMessage
        );

      state.citations =
        buildCitationSources(
          search.results
        );

      state.contentIntelligence =
        analyzeContentSources(
          state.citations
        );

      const evidence =
        search.results.map(
          (result, index) =>
            `[${index + 1}]
Title: ${result.title}
URL: ${result.url}
Published: ${
              result.publishedDate ??
              "unknown"
            }
Evidence: ${result.snippet}`
        );

      state.liveKnowledge = [
        [
          "LIVE WEB SEARCH EXECUTED.",

          `Search time: ${search.searchedAt}`,

          `Search query: ${search.query}`,

          search.answer
            ? `Search synthesis:\n${search.answer}`
            : "No search synthesis was returned.",

          evidence.length > 0
            ? `Evidence:\n\n${evidence.join(
                "\n\n"
              )}`
            : "No usable evidence was returned.",
        ].join("\n\n"),
      ];

      return state;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      state.citations = [];

      state.contentIntelligence =
        null;

      state.liveKnowledge = [];

      state.errors.push(
        `LiveKnowledge: ${message}`
      );

      state.response =
        "I couldn't retrieve current web information for that request. Please try again in a moment.";

      return state;
    }
  }
}