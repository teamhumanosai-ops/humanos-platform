import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import {
  extractConversationMemories,
} from "../../memory";

/**
 * MemoryExtractionStage
 *
 * Extracts explicit durable memories from the user's conversation
 * and persists them for future conversations.
 *
 * This is a side-effect stage — it does not enrich
 * the current BrainState directly. Extracted memories
 * will be available in subsequent executions.
 *
 * Only user-authored messages are eligible for durable memory
 * extraction. Assistant messages are intentionally excluded so
 * model-generated text cannot become personal memory by itself.
 */
export class MemoryExtractionStage extends BaseStage {
  readonly name = "MemoryExtraction";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    await extractConversationMemories(
      state.messages
    );

    return state;
  }
}
