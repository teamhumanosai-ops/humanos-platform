import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import { buildContext } from "../../context";

/**
 * ContextStage
 *
 * Builds the runtime context that will later
 * be consumed by reasoning and response stages.
 */
export class ContextStage extends BaseStage {
  readonly name = "Context";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.context = await buildContext(
      state.userMessage
    );

    return state;
  }
}