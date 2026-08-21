import {
  BrainState,
} from "../../brainState";

import {
  getDecision,
} from "../../decision";

import {
  getPlan,
} from "../../planning";

import {
  BaseStage,
} from "./baseStage";

/**
 * ValidationStage
 *
 * Validates the cognitive state immediately before execution.
 *
 * This stage validates decision and plan readiness. It does not own
 * authorization, confirmation, or external permission policy. The
 * centralized ActionDispatch authorization boundary evaluates the exact
 * action route and binds any allowed dispatch to the current policy version.
 * ExecutionStage repeats those provenance checks as a defense-in-depth
 * boundary immediately before external capability execution.
 */
export class ValidationStage
  extends BaseStage {
  readonly name =
    "Validation";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      !state.currentDecisionId
    ) {
      return state;
    }

    const decision =
      getDecision(
        state.currentDecisionId
      );

    if (!decision) {
      state.errors.push(
        "Validation: active decision could not be found."
      );

      return state;
    }

    if (
      !state.currentPlanId
    ) {
      state.errors.push(
        "Validation: execution requires an active plan."
      );

      return state;
    }

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!plan) {
      state.errors.push(
        "Validation: active plan could not be found."
      );

      return state;
    }

    if (
      plan.id !==
      state.currentPlanId
    ) {
      state.errors.push(
        "Validation: active plan identity is inconsistent."
      );

      return state;
    }

    const action =
      decision.selectedAction
        ?.trim();

    if (!action) {
      state.errors.push(
        "Validation: decision does not contain an executable action."
      );

      return state;
    }

    return state;
  }
}