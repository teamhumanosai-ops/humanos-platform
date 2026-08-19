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
  setExecutionResult,
  getExecution,
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
 *
 * An existing execution on the BrainState is treated as authoritative
 * so re-entering this stage cannot execute the same external action twice.
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

    if (
      state.currentExecutionId
    ) {
      const existingExecution =
        getExecution(
          state.currentExecutionId
        );

      if (
        existingExecution &&
        existingExecution.status !==
          "pending"
      ) {
        state.execution = [
          `Execution: ${existingExecution.title}`,
          `Action: ${existingExecution.action}`,
          `Route: ${existingExecution.route?.target ?? "unknown"}`,
          `Status: ${existingExecution.status}`,
          `Plan ID: ${existingExecution.planId}`,
          `Execution ID: ${existingExecution.id}`,
          existingExecution.result
            ? `Result: ${existingExecution.result.summary}`
            : "Result: not yet recorded",
        ].join("\n");

        return state;
      }
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

    const startedAt =
      started.startedAt?.getTime() ??
      Date.now();

    try {
      const result =
        await capability.execute(
          decision.selectedAction,
          this.services
        );

      const completedAt =
        new Date();

      const durationMs =
        Math.max(
          0,
          completedAt.getTime() -
            startedAt
        );

      const recorded =
        setExecutionResult(
          execution.id,
          {
            status:
              "completed",
            summary:
              result.summary,
            metadata: {
              ...(result.metadata ?? {}),
              route:
                actionRoute.target,
              durationMs:
                String(durationMs),
              startedAt:
                new Date(
                  startedAt
                ).toISOString(),
              completedAt:
                completedAt.toISOString(),
            },
            error:
              null,
          }
        );

      if (!recorded) {
        throw new Error(
          "execution result could not be persisted"
        );
      }

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
        `Duration: ${durationMs} ms`,
        `Result: ${result.summary}`,
      ].join("\n");

      if (
        result.metadata?.query
      ) {
        state.liveKnowledge = [
          "ACTION EXECUTION COMPLETED.",
          `Route: ${actionRoute.target}`,
          `Search query: ${result.metadata.query}`,
          `Providers: ${result.metadata.providers ?? "unknown"}`,
          `Dual-provider coverage: ${result.metadata.dualProviderCoverage ?? "0"}`,
          `Search time: ${result.metadata.searchedAt ?? "unknown"}`,
          result.summary,
        ];
      }

      return state;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      const failedAt =
        new Date();

      const durationMs =
        Math.max(
          0,
          failedAt.getTime() -
            startedAt
        );

      setExecutionResult(
        execution.id,
        {
          status:
            "blocked",
          summary:
            "Action execution failed.",
          metadata: {
            route:
              actionRoute.target,
            durationMs:
              String(durationMs),
            startedAt:
              new Date(
                startedAt
              ).toISOString(),
            failedAt:
              failedAt.toISOString(),
          },
          error:
            message,
        }
      );

      blockExecution(
        execution.id
      );

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
        `Duration: ${durationMs} ms`,
        `Error: ${message}`,
      ].join("\n");

      return state;
    }
  }
}
