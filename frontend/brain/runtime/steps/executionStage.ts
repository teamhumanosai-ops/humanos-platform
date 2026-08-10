import { BrainState } from "../../brainState";

import {
  getDecision,
} from "../../decision";

import {
  createExecutionFromDecision,
  startExecution,
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
 * The stage:
 *
 * 1. Reads the active decision.
 * 2. Creates an execution through the
 *    existing Execution Engine.
 * 3. Starts the execution lifecycle.
 * 4. Stores the resulting execution state
 *    in BrainState.
 *
 * Completion is intentionally NOT performed here.
 * Completion belongs to the execution/outcome
 * phase once actual work has produced a result.
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

    const startedExecution =
      startExecution(
        execution.id
      );

    if (!startedExecution) {
      return state;
    }

    state.currentExecutionId =
      startedExecution.id;

    state.execution =
      [
        `Execution: ${startedExecution.title}`,

        `Action: ${startedExecution.action}`,

        `Status: ${startedExecution.status}`,

        `Plan ID: ${startedExecution.planId}`,

        `Execution ID: ${startedExecution.id}`,

        `Started At: ${startedExecution.startedAt?.toISOString() ?? "Unknown"}`,
      ].join("\n");

    return state;
  }
}