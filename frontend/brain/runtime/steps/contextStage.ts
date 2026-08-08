import { BrainState } from "../../brainState";

import {
  buildContext,
} from "../../context";

import {
  Intent,
} from "../../intent";

import { BaseStage } from "./baseStage";

/**
 * ContextStage
 *
 * Consumes the cognitive information already
 * hydrated into BrainState and composes the
 * final context consumed by ResponseStage.
 */
export class ContextStage
  extends BaseStage {
  readonly name = "Context";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (state.response) {
      return state;
    }

    const structuredContext =
      await buildContext(
        state
      );

    let prompt =
      structuredContext.prompt;

    switch (state.intent) {
      case Intent.STARTUP_PLANNING:
        prompt +=
          "\n\nThe user wants startup advice. Think like an experienced startup founder and advisor.";
        break;

      case Intent.LIVE_SEARCH:
        prompt +=
          "\n\nThe user needs current information. Use live search when appropriate.";
        break;

      default:
        break;
    }

    state.context =
      prompt;

    state.knowledge =
      structuredContext.knowledge;

    return state;
  }
}