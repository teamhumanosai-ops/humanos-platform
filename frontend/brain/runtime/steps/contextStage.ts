import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import { buildContext } from "../../context";
import { Intent } from "../../intent";

/**
 * ContextStage
 *
 * Builds the runtime context consumed by
 * the response stage.
 *
 * If a local skill has already produced a
 * response, context generation is skipped.
 */
export class ContextStage extends BaseStage {
  readonly name = "Context";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (state.response) {
      return state;
    }

    let context = await buildContext(
      state.userMessage
    );

    switch (state.intent) {
      case Intent.STARTUP_PLANNING:
        context +=
          "\n\nThe user wants startup advice. Think like an experienced startup founder and advisor.";
        break;

      case Intent.LIVE_SEARCH:
        context +=
          "\n\nThe user needs current information. Use live search when appropriate.";
        break;

      default:
        break;
    }

    state.context = context;

    return state;
  }
}