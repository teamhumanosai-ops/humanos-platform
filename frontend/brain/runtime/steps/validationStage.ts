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
 * Validates the cognitive state immediately
 * before execution.
 *
 * This stage does not execute actions.
 * It only determines whether the current
 * decision contains enough valid information
 * to enter the Execution stage.
 *
 * Permissions and external authorization are
 * intentionally not evaluated here because
 * the current architecture does not yet expose
 * a permission service.
 */
export class ValidationStage
  extends BaseStage {
  readonly name =
    "Validation";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | No decision means there is nothing to execute.
    |--------------------------------------------------------------------------
    */

    if (
      !state.currentDecisionId
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Decision must exist.
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | A plan is required for execution.
    |--------------------------------------------------------------------------
    */

    if (
      !state.currentPlanId
    ) {
      state.errors.push(
        "Validation: execution requires an active plan."
      );

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Plan must exist.
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Plan identity must remain consistent.
    |--------------------------------------------------------------------------
    */

    if (
      plan.id !==
      state.currentPlanId
    ) {
      state.errors.push(
        "Validation: active plan identity is inconsistent."
      );

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Decision must contain an executable action.
    |--------------------------------------------------------------------------
    */

    const action =
      decision.selectedAction
        ?.trim();

    if (!action) {
      state.errors.push(
        "Validation: decision does not contain an executable action."
      );

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Validation passed.
    |--------------------------------------------------------------------------
    */

    return state;
  }
}