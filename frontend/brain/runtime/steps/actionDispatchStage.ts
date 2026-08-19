import {
  createActionDispatch,
  getActionCapability,
} from "../../actionRouting";

import {
  evaluateActionAuthorization,
} from "../../actionRouting/authorization";

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
 *
 * The resolved dispatch descriptor is also preserved on BrainState
 * so Execution can verify that the capability binding it executes
 * is exactly the one produced by the dispatch boundary.
 *
 * Authorization is evaluated at this boundary so no capability can
 * be dispatched unless the centralized action policy permits it.
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

      state.actionDispatch =
        null;

      return state;
    }

    const authorization =
      evaluateActionAuthorization(
        state
      );

    state.actionAuthorization =
      authorization;

    if (
      authorization.status !==
      "allowed"
    ) {
      state.errors.push(
        `ActionDispatch: ${authorization.reason}`
      );

      state.actionDispatch =
        null;

      if (
        authorization.status ===
        "requires_confirmation"
      ) {
        state.runtimeStatus =
          "blocked";
      }

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

      state.actionDispatch =
        null;

      return state;
    }

    if (
      capability.target !==
      dispatch.target
    ) {
      state.errors.push(
        `ActionDispatch: capability binding mismatch for target "${dispatch.target}".`
      );

      state.actionDispatch =
        null;

      return state;
    }

    state.actionDispatch =
      dispatch;

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
        `Authorization: ${authorization.status}/${authorization.policyVersion}`,
        `Action: ${dispatch.action}`,
      ].join("\n");

    return state;
  }
}
