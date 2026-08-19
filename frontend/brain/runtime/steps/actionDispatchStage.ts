import {
  createActionDispatch,
} from "../../actionRouting";

import {
  BrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

/**
 * ActionDispatchStage
 *
 * Converts the validated ActionRoute into a bounded
 * dispatch descriptor. It deliberately does not invoke
 * providers or tools; those remain downstream execution
 * responsibilities.
 */
export class ActionDispatchStage
  extends BaseStage {
  readonly name =
    "ActionDispatch";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.errors.length > 0
    ) {
      return state;
    }

    const dispatch =
      createActionDispatch(
        state.actionRoute
      );

    if (!dispatch) {
      state.errors.push(
        "ActionDispatch: action route could not produce a safe dispatch descriptor."
      );

      return state;
    }

    state.execution =
      [
        state.execution ??
          `Action: ${dispatch.action}`,
        `Dispatch: ${dispatch.kind}/${dispatch.target}`,
        `Route ID: ${dispatch.routeId}`,
      ].join("\n");

    return state;
  }
}
