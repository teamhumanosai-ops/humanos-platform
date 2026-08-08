import { BrainState } from "../../brainState";
import { buildContext } from "../../context";
import { Intent } from "../../intent";

import { BaseStage } from "./baseStage";

/**
 * ContextStage
 *
 * Composes the already-hydrated BrainState
 * into the context consumed by ResponseStage.
 */
export class ContextStage
  extends BaseStage {
  readonly name =
    "Context";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (state.response) {
      return state;
    }

    let context =
      buildContext(state);

    if (
      state.intent ===
      Intent.LIVE_SEARCH
    ) {
      context += `

LIVE KNOWLEDGE POLICY:

This request requires current information.

LIVE WEB EVIDENCE IS AUTHORITATIVE FOR THIS REQUEST.

Use the live web evidence supplied below as the primary factual basis for the answer.

Do NOT say that you lack real-time access when live web evidence is present.

Do NOT replace current web evidence with your training-memory knowledge.

If sources disagree, explicitly say that they disagree and identify the disagreement.

When giving factual claims derived from the web, include source links from the supplied evidence.

If the supplied live evidence does not contain enough information to answer confidently, say that the available sources were insufficient instead of guessing.
`;
    }

    state.context =
      context;

    return state;
  }
}