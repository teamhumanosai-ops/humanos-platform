import {
  BrainState,
} from "../../brainState";

import {
  isExecutableActionRoute,
  getActionCapability,
  integrationMetadata,
  executeWithIntegrationSafety,
} from "../../actionRouting";

import {
  evaluateActionAuthorization,
} from "../../actionRouting/authorization";

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

    const authorization =
      state.actionAuthorization;

    if (
      authorization?.status !==
      "allowed"
    ) {
      state.errors.push(
        "Execution: action execution is not authorized by the current action policy."
      );
      state.runtimeStatus =
        "blocked";
      return state;
    }

    const currentAuthorization =
      evaluateActionAuthorization(
        state
      );

    if (
      currentAuthorization.status !==
      "allowed"
    ) {
      state.errors.push(
        "Execution: current action authorization is no longer allowed for the resolved route."
      );
      state.runtimeStatus =
        "blocked";
      return state;
    }

    if (
      currentAuthorization.routeId !==
      actionRoute.id ||
      currentAuthorization.target !==
      actionRoute.target ||
      currentAuthorization.policyVersion !==
      authorization.policyVersion ||
      currentAuthorization.confirmedAt?.getTime() !==
      authorization.confirmedAt?.getTime()
    ) {
      state.errors.push(
        "Execution: stored authorization is stale or no longer matches the current authorization binding."
      );
      state.runtimeStatus =
        "blocked";
      return state;
    }

    if (
      authorization.routeId !==
      actionRoute.id ||
      authorization.target !==
      actionRoute.target
    ) {
      state.errors.push(
        "Execution: authorization binding does not match the validated action route."
      );
      state.runtimeStatus =
        "blocked";
      return state;
    }

    if (
      actionDispatch.authorizationStatus !==
      "allowed"
    ) {
      state.errors.push(
        "Execution: dispatch descriptor does not contain an allowed authorization decision."
      );
      state.runtimeStatus =
        "blocked";
      return state;
    }

    if (
      actionDispatch.authorizationPolicyVersion !==
      authorization.policyVersion
    ) {
      state.errors.push(
        "Execution: dispatch authorization policy version does not match the current authorization decision."
      );
      state.runtimeStatus =
        "blocked";
      return state;
    }

    if (
      actionDispatch.authorizationRouteId !==
      authorization.routeId ||
      actionDispatch.target !==
      authorization.target
    ) {
      state.errors.push(
        "Execution: dispatch authorization provenance does not match the current authorization binding."
      );
      state.runtimeStatus =
        "blocked";
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

    const executionPolicy =
      capability.integrations.length > 0
        ? "deduplicate-concurrent" as const
        : "allow-duplicate" as const;

    const integrationProvenance =
      integrationMetadata(
        capability.integrations
      );

    try {
      const result =
        await executeWithIntegrationSafety(
          execution.id,
          executionPolicy,
          () =>
            capability.execute(
              executionAction,
              this.services
            )
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
              ...integrationProvenance,
              executionPolicy,
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
              authorizationStatus:
                actionDispatch.authorizationStatus,
              authorizationPolicyVersion:
                actionDispatch.authorizationPolicyVersion,
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
          `Integration: ${integrationProvenance.integrationOperations || "internal"}`,
          `Execution policy: ${executionPolicy}`,
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
            ...integrationProvenance,
            executionPolicy,
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
            authorizationStatus:
              actionDispatch.authorizationStatus,
            authorizationPolicyVersion:
              actionDispatch.authorizationPolicyVersion,
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
          `Integration: ${integrationProvenance.integrationOperations || "internal"}`,
          `Execution policy: ${executionPolicy}`,
          "Status: blocked",
          `Duration: ${durationMs} ms`,
          `Error: ${message}`
        );

      return state;
    }
  }

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
