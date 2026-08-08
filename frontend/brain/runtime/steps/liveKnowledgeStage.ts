import { BrainState } from "../../brainState";
import { Intent } from "../../intent";
import { searchWeb } from "../../websearch";
import { BaseStage } from "./baseStage";

/**
 * LiveKnowledgeStage
 *
 * Performs external web retrieval only when the
 * detected intent requires current information.
 *
 * Search results are stored in BrainState so later
 * stages can consume them without calling the
 * search provider directly.
 */
export class LiveKnowledgeStage extends BaseStage {
  readonly name = "LiveKnowledge";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.intent !==
      Intent.LIVE_SEARCH
    ) {
      return state;
    }

    const results =
      await searchWeb(
        state.userMessage
      );

    state.liveKnowledge =
      results.map(
        (result) =>
          `Title: ${result.title}\nURL: ${result.url}\nSummary: ${result.snippet}`
      );

    return state;
  }
}