import {
  createActionDispatch,
  getActionCapability,
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
 * dispatch descriptor and verifies that a concrete
 * execution capability exists before downstream execution.
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

    const capability =
      getActionCapability(
        dispatch.target
      );

    if (!capability) {
      state.errors.push(
        `ActionDispatch: no registered execution capability exists for target "${dispatch.target}".`
      );

      return state;
    }

    state.execution =
      [
        state.execution ??
          `Action: ${dispatch.action}`,
        `Dispatch: ${dispatch.kind}/${dispatch.target}`,
        `Route ID: ${dispatch.routeId}`,
        `Capability: ${capability.target}`,
      ].join("\n");

    return state;
  }
}
