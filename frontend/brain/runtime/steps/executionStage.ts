import {
  BrainState,
} from "../../brainState";

import {
  isExecutableActionRoute,
  getActionCapability,
} from "../../actionRouting";

import {
  getDecision,
} from "../../decision";

import {
  createExecutionFromDecision,
  completeExecution,
  startExecution,
  blockExecution,
} from "../../execution";

import {
  getPlan,
} from "../../planning";

import type {
  RuntimeServices,
} from "../runtimeServices";

import {
  BaseStage,
} from "./baseStage";

/**
 * ExecutionStage
 *
 * Executes a validated action through an explicitly registered
 * capability. Arbitrary action strings are never evaluated as code.
 */
export class ExecutionStage
  extends BaseStage {
  readonly name =
    "Execution";

  constructor(
    private readonly services:
      RuntimeServices
  ) {
    super();
  }

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.response ||
      state.errors.length > 0 ||
      !state.currentDecisionId ||
      !state.currentPlanId
    ) {
      return state;
    }

    const actionRoute =
      state.actionRoute;

    if (!actionRoute) {
      state.errors.push(
        "Execution: action route is missing."
      );
      return state;
    }

    if (!isExecutableActionRoute(actionRoute)) {
      state.errors.push(
        `Execution: action route "${actionRoute.id}" failed safety validation.`
      );
      return state;
    }

    const capability =
      getActionCapability(
        actionRoute.target
      );

    if (!capability) {
      state.errors.push(
        `Execution: no registered capability exists for target "${actionRoute.target}".`
      );
      return state;
    }

    const decision =
      getDecision(
        state.currentDecisionId
      );

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!decision || !plan) {
      state.errors.push(
        "Execution: decision or plan could not be resolved."
      );
      return state;
    }

    const execution =
      createExecutionFromDecision(
        decision,
        plan.id,
        actionRoute
      );

    state.currentExecutionId =
      execution.id;

    const started =
      startExecution(
        execution.id
      );

    if (!started) {
      blockExecution(
        execution.id
      );
      state.errors.push(
        "Execution: execution could not enter the in-progress state."
      );
      return state;
    }

    try {
      const result =
        await capability.execute(
          decision.selectedAction,
          this.services
        );

      const completed =
        completeExecution(
          execution.id
        );

      if (!completed) {
        throw new Error(
          "execution could not enter the completed state"
        );
      }

      state.execution = [
        `Execution: ${completed.title}`,
        `Action: ${completed.action}`,
        `Route: ${actionRoute.target}`,
        `Status: ${completed.status}`,
        `Plan ID: ${completed.planId}`,
        `Execution ID: ${completed.id}`,
        `Result: ${result.summary}`,
      ].join("\n");

      if (
        result.metadata?.query
      ) {
        state.liveKnowledge = [
          "ACTION EXECUTION COMPLETED.",
          `Route: ${actionRoute.target}`,
          `Search query: ${result.metadata.query}`,
          `Search time: ${result.metadata.searchedAt ?? "unknown"}`,
          result.summary,
        ];
      }

      return state;
    } catch (error) {
      blockExecution(
        execution.id
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      state.errors.push(
        `Execution: ${message}`
      );

      state.execution = [
        `Execution: ${execution.title}`,
        `Action: ${execution.action}`,
        `Route: ${actionRoute.target}`,
        "Status: blocked",
        `Plan ID: ${execution.planId}`,
        `Execution ID: ${execution.id}`,
      ].join("\n");

      return state;
    }
  }
}
