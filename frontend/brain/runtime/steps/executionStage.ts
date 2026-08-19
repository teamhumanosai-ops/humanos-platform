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
 * Executes a validated action through the dispatch descriptor
 * produced by ActionDispatchStage and an explicitly registered
 * capability. Arbitrary action strings are never evaluated as code.
 *
 * An existing execution on BrainState is authoritative. Re-entering
 * this stage therefore never starts a second external execution for
 * the same runtime execution record, including when the existing
 * record is still pending.
 *
 * ActionDispatch is mandatory at this boundary. Execution must never
 * fall back to a raw ActionRoute because the dispatch descriptor is
 * the runtime's final capability-binding provenance artifact.
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
      return this.resumeExistingExecution(
        state
      );
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

    const actionDispatch =
      state.actionDispatch;

    if (!actionDispatch) {
      state.errors.push(
        `Execution: action route "${actionRoute.id}" has no dispatch descriptor.`
      );
      return state;
    }

    if (
      actionDispatch.routeId !==
      actionRoute.id
    ) {
      state.errors.push(
        `Execution: dispatch route "${actionDispatch.routeId}" does not match action route "${actionRoute.id}".`
      );
      return state;
    }

    if (
      actionDispatch.target !==
      actionRoute.target ||
      actionDispatch.kind !==
      actionRoute.kind ||
      actionDispatch.action !==
      actionRoute.action
    ) {
      state.errors.push(
        `Execution: dispatch descriptor does not match validated action route "${actionRoute.id}".`
      );
      return state;
    }

    const executionTarget =
      actionDispatch.target;

    const executionAction =
      actionDispatch.action;

    const capability =
      getActionCapability(
        executionTarget
      );

    if (!capability) {
      state.errors.push(
        `Execution: no registered capability exists for target "${executionTarget}".`
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
          executionAction,
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
              routeId:
                actionRoute.id,
              routeKind:
                actionRoute.kind,
              routeConfidence:
                String(actionRoute.confidence),
              dispatchRouteId:
                actionDispatch.routeId,
              dispatchTarget:
                actionDispatch.target,
              dispatchKind:
                actionDispatch.kind,
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

      state.execution =
        this.formatExecution(
          completed,
          actionRoute.target,
          `Duration: ${durationMs} ms`,
          `Result: ${result.summary}`
        );

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
            routeId:
              actionRoute.id,
            routeKind:
              actionRoute.kind,
            routeConfidence:
              String(actionRoute.confidence),
            dispatchRouteId:
              actionDispatch.routeId,
            dispatchTarget:
              actionDispatch.target,
            dispatchKind:
              actionDispatch.kind,
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

      state.execution =
        this.formatExecution(
          execution,
          actionRoute.target,
          "Status: blocked",
          `Duration: ${durationMs} ms`,
          `Error: ${message}`
        );

      return state;
    }
  }

  /**
   * Resume state from an already-created execution record.
   *
   * Pending executions are deliberately not executed again. The
   * runtime exposes the pending state to Outcome so the cycle can
   * remain observable without risking duplicate external work.
   */
  private resumeExistingExecution(
    state: BrainState
  ): Promise<BrainState> {
    const execution =
      getExecution(
        state.currentExecutionId as string
      );

    if (!execution) {
      state.errors.push(
        `Execution: existing execution ${state.currentExecutionId} could not be resolved.`
      );

      return Promise.resolve(
        state
      );
    }

    const target =
      execution.route?.target ??
      state.actionRoute?.target ??
      "unknown";

    state.execution =
      this.formatExecution(
        execution,
        target,
        execution.result
          ? `Result: ${execution.result.summary}`
          : "Result: not yet recorded"
      );

    if (
      execution.status ===
      "pending" ||
      execution.status ===
      "in_progress"
    ) {
      state.runtimeStatus =
        "in_progress";
    }

    return Promise.resolve(
      state
    );
  }

  /**
   * Keep execution presentation consistent across first execution,
   * successful re-entry, and terminal re-entry paths.
   */
  private formatExecution(
    execution: {
      title: string;
      action: string;
      status: string;
      planId: string;
      id: string;
      result?: {
        summary: string;
      } | null;
    },
    target: string,
    ...details: string[]
  ): string {
    return [
      `Execution: ${execution.title}`,
      `Action: ${execution.action}`,
      `Route: ${target}`,
      `Status: ${execution.status}`,
      `Plan ID: ${execution.planId}`,
      `Execution ID: ${execution.id}`,
      ...details,
    ].join("\n");
  }
}
