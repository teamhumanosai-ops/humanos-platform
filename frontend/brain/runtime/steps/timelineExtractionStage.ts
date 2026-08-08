import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import { extractTimelineEvent } from "../../timeline";

/**
 * TimelineExtractionStage
 *
 * Extracts timeline events from the user's message
 * and persists them for future reference.
 *
 * This is a side-effect stage — it does not enrich
 * the current BrainState directly. Extracted events
 * will appear in timeline context for subsequent
 * executions.
 */
export class TimelineExtractionStage extends BaseStage {
  readonly name = "TimelineExtraction";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    await extractTimelineEvent(state.userMessage);

    return state;
  }
}
