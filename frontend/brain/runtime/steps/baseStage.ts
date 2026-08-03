import { BrainState } from "../../brainState";
import { Stage } from "./stage";

/**
 * Base implementation for all cognitive stages.
 *
 * Future stages (Memory, Reflection, Learning, etc.)
 * should extend this class.
 */
export abstract class BaseStage implements Stage {
  abstract readonly name: string;

  async execute(
    state: BrainState
  ): Promise<BrainState> {
    state.updatedAt = new Date();

    return this.process(state);
  }

  protected abstract process(
    state: BrainState
  ): Promise<BrainState>;
}