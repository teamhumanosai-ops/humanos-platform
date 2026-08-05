import { BrainState } from "../../brainState";

export interface Stage {
  /**
   * Human-readable stage name.
   */
  readonly name: string;

  /**
   * Execute the stage.
   */
  execute(
    state: BrainState
  ): Promise<BrainState>;
}