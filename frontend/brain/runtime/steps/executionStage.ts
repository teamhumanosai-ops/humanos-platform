import {
  BrainState,
} from "../../brainState";

import {
  getDecision,
} from "../../decision";

import {
  createExecutionFromDecision,
} from "../../execution";

import {
  getPlan,
} from "../../planning";

import {
  BaseStage,
} from "./baseStage";

/**
 * ExecutionStage
 *
 * Integrates the existing Execution Engine
 * into the Cognitive Runtime.
 *
 * The stage creates a pending execution from
 * the active decision and stores the execution
 * information in BrainState.
 *
 * It does not start or complete the execution.
 * Actual execution lifecycle operations remain
 * owned by the Execution Engine.
 *
 * Safety:
 * Execution creation is blocked when an earlier
 * runtime stage has already recorded an error.
 */
export class ExecutionStage
  extends BaseStage {
  readonly name =
    "Execution";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Existing response
    |--------------------------------------------------------------------------
    |
    | A local skill or earlier stage has already
    | produced the final response. There is no
    | additional execution work to create.
    |
    */

    if (
      state.response
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Runtime safety gate
    |--------------------------------------------------------------------------
    |
    | ValidationStage and other upstream stages may
    | have recorded errors. Never create an execution
    | from an invalid cognitive state.
    |
    */

    if (
      state.errors.length > 0
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Required runtime identifiers
    |--------------------------------------------------------------------------
    */

    if (
      !state.currentDecisionId ||
      !state.currentPlanId
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve active decision
    |--------------------------------------------------------------------------
    */

    const decision =
      getDecision(
        state.currentDecisionId
      );

    if (
      !decision
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve active plan
    |--------------------------------------------------------------------------
    */

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (
      !plan
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Create pending execution
    |--------------------------------------------------------------------------
    |
    | Execution lifecycle remains owned by the
    | Execution Engine.
    |
    */

    const execution =
      createExecutionFromDecision(
        decision,
        plan.id
      );

    /*
    |--------------------------------------------------------------------------
    | Store execution identity
    |--------------------------------------------------------------------------
    */

    state.currentExecutionId =
      execution.id;

    /*
    |--------------------------------------------------------------------------
    | Store human-readable execution state
    |--------------------------------------------------------------------------
    */

    state.execution =
      [
        `Execution: ${execution.title}`,

        `Action: ${execution.action}`,

        `Status: ${execution.status}`,

        `Plan ID: ${execution.planId}`,

        `Execution ID: ${execution.id}`,
      ].join("\n");

    return state;
  }
}