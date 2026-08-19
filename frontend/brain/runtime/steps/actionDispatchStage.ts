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
 * Converts the validated ActionRoute into a bounded dispatch
 * descriptor and verifies that a concrete execution capability
 * exists before downstream execution.
 *
 * Dispatch is metadata preparation, not external execution.
 * Re-entering the stage with the same route is therefore a safe
 * no-op rather than a second mutation of the execution descriptor.
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

    if (
      capability.target !==
      dispatch.target
    ) {
      state.errors.push(
        `ActionDispatch: capability binding mismatch for target "${dispatch.target}".`
      );

      return state;
    }

    const routeMarker =
      `Route ID: ${dispatch.routeId}`;

    if (
      state.execution?.includes(
        routeMarker
      )
    ) {
      return state;
    }

    state.execution =
      [
        state.execution ??
          `Action: ${dispatch.action}`,
        `Dispatch: ${dispatch.kind}/${dispatch.target}`,
        routeMarker,
        `Capability: ${capability.target}`,
        `Action: ${dispatch.action}`,
      ].join("\n");

    return state;
  }
}
