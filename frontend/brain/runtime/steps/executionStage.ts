import { BrainState } from "../../brainState";

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
 */
export class ExecutionStage
  extends BaseStage {
  readonly name =
    "Execution";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (state.response) {
      return state;
    }

    if (
      !state.currentDecisionId ||
      !state.currentPlanId
    ) {
      return state;
    }

    const decision =
      getDecision(
        state.currentDecisionId
      );

    if (!decision) {
      return state;
    }

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!plan) {
      return state;
    }

    const execution =
      createExecutionFromDecision(
        decision,
        plan.id
      );

    state.currentExecutionId =
      execution.id;

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