import {
  BrainState,
} from "../../brainState";

import {
  isExecutableActionRoute,
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
 * Creates and executes the resolved action through the existing
 * provider/tool service boundary. The stage never evaluates an
 * arbitrary action string as code; every executable capability is
 * explicitly mapped to a supported route target.
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

    const decision =
      getDecision(
        state.currentDecisionId
      );

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!decision || !plan) {
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
      if (
        actionRoute.target ===
        "web-search"
      ) {
        const result =
          await this.services.searchWeb(
            decision.selectedAction
          );

        state.liveKnowledge = [
          "ACTION EXECUTION COMPLETED.",
          `Route: ${actionRoute.target}`,
          `Search time: ${result.searchedAt}`,
          `Search query: ${result.query}`,
          result.answer
            ? `Execution result:\n${result.answer}`
            : "Execution returned no synthesis.",
          result.results.length > 0
            ? `Evidence count: ${result.results.length}`
            : "Evidence count: 0",
        ];

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
        ].join("\n");

        return state;
      }

      if (
        actionRoute.target ===
        "web-content"
      ) {
        throw new Error(
          "web-content execution is not yet registered as a safe runtime capability."
        );
      }

      if (
        actionRoute.target ===
        "tool"
      ) {
        throw new Error(
          "tool execution requires an explicitly registered tool capability."
        );
      }

      if (
        actionRoute.target ===
        "cognitive"
      ) {
        const completed =
          completeExecution(
            execution.id
          );

        if (!completed) {
          throw new Error(
            "internal cognitive execution could not complete"
          );
        }

        state.execution = [
          `Execution: ${completed.title}`,
          `Action: ${completed.action}`,
          `Route: ${actionRoute.target}`,
          `Status: ${completed.status}`,
          `Plan ID: ${completed.planId}`,
          `Execution ID: ${completed.id}`,
        ].join("\n");

        return state;
      }

      throw new Error(
        `unsupported execution target: ${actionRoute.target}`
      );
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
