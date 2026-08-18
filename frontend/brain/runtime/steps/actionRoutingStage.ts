import {
  getDecision,
} from "../../decision";

import {
  isExecutableActionRoute,
  routeDecisionAction,
} from "../../actionRouting";

import {
  BrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

/**
 * ActionRoutingStage
 *
 * Converts the validated cognitive decision into a
 * bounded action route descriptor.
 *
 * This stage never executes a tool or provider call.
 * Execution remains owned by the existing Execution
 * Engine and downstream action controls.
 */
export class ActionRoutingStage
  extends BaseStage {
  readonly name =
    "ActionRouting";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.errors.length > 0
    ) {
      return state;
    }

    if (
      !state.currentDecisionId
    ) {
      return state;
    }

    const decision =
      getDecision(
        state.currentDecisionId
      );

    if (
      !decision
    ) {
      return state;
    }

    const route =
      routeDecisionAction(
        decision
      );

    if (!isExecutableActionRoute(route)) {
      state.actionRoute = route;
      state.errors.push(
        "ActionRouting: decision could not be resolved to a safe executable route."
      );

      return state;
    }

    state.actionRoute =
      route;

    return state;
  }
}
