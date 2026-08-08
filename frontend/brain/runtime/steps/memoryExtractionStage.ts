import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import { extractSimpleMemory } from "../../memory";

/**
 * MemoryExtractionStage
 *
 * Extracts implicit memories from the user's message
 * and persists them for future conversations.
 *
 * This is a side-effect stage — it does not enrich
 * the current BrainState directly. Extracted memories
 * will be available in subsequent executions.
 */
export class MemoryExtractionStage extends BaseStage {
  readonly name = "MemoryExtraction";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    await extractSimpleMemory(state.userMessage);

    return state;
  }
}
