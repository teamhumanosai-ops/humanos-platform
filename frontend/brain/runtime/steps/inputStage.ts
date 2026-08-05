import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";

/**
 * First stage of every cognitive execution.
 *
 * Responsibilities:
 * - Validate BrainState
 * - Normalize input
 * - Prepare execution metadata
 *
 * Future:
 * - Attachment parsing
 * - Voice transcription
 * - Image extraction
 */
export class InputStage extends BaseStage {
  readonly name = "Input";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.updatedAt = new Date();

    return state;
  }
}