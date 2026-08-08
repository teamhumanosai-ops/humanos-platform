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
 * Composes structured cognitive context
 * and enriches BrainState with both:
 *
 * 1. The final prompt consumed by ResponseStage
 * 2. Structured knowledge available to
 *    future reasoning/planning/agent stages
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
        state.userMessage
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