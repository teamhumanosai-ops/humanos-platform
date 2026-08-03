import { BrainState } from "../../brainState";

/**
 * Every cognitive step in the runtime pipeline
 * must implement this interface.
 */
export interface Stage {
  /**
   * Human-readable name of the stage.
   */
  readonly name: string;

  /**
   * Process the BrainState and return
   * the updated BrainState.
   */
  execute(
    state: BrainState
  ): Promise<BrainState>;
}