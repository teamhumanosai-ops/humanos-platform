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
 * ActionAuthorizationStage
 *
 * Evaluates the resolved action route against the centralized
 * authorization policy before dispatch can create an executable
 * capability binding.
 *
 * This stage never executes a provider or tool. It records the
 * authorization decision on BrainState so dispatch and execution
 * can enforce the same policy boundary.
 */
export class ActionAuthorizationStage
  extends BaseStage {
  readonly name =
    "ActionAuthorization";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const authorization =
      evaluateActionAuthorization(
        state
      );

    state.actionAuthorization =
      authorization;

    if (
      authorization.status ===
      "allowed"
    ) {
      return state;
    }

    state.actionDispatch =
      null;

    state.errors.push(
      `ActionAuthorization: ${authorization.reason}`
    );

    state.runtimeStatus =
      authorization.status ===
      "requires_confirmation"
        ? "blocked"
        : state.runtimeStatus;

    return state;
  }
}
