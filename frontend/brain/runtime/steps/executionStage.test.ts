import {
  createBrainState,
} from "../../brainState";

import {
  saveDecision,
} from "../../decision";

import {
  createPlanFromMessage,
} from "../../planning";

import {
  clearExecutions,
  getAllExecutions,
  createExecutionFromDecision,
  startExecution,
} from "../../execution";

import type {
  Decision,
} from "../../decision";

import {
  ExecutionStage,
} from "./executionStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 execution verification failed: ${message}`
    );
  }
}

function createDecision(
  id: string,
  action: string
): Decision {
  return {
    id,
    title: "Execute next action",
    description: "Validate and route the selected action.",
    selectedAction: action,
    alternatives: [],
    reason: "The decision was selected by the cognitive runtime.",
    confidence: 0.9,
    createdAt: new Date(),
  };
}

function prepareDecisionState(
  conversation: string,
  message: string,
  decisionId: string
): {
  state: ReturnType<typeof createBrainState>;
  plan: ReturnType<typeof createPlanFromMessage>;
  decision: Decision;
} {
  const state =
    createBrainState(
      conversation,
      [],
      message
    );

  const plan =
    createPlanFromMessage(
      message
    );

  const decision =
    createDecision(
      decisionId,
      message
    );

  saveDecision(
    decision
  );

  state.currentPlanId =
    plan.id;

  state.currentGoal =
    plan.goal;

  state.currentDecisionId =
    decision.id;

  return {
    state,
    plan,
    decision,
  };
}

async function verifyMissingRouteBlocksExecution(): Promise<void> {
  clearExecutions();

  const {
    state,
  } = prepareDecisionState(
    "conversation",
    "Execute the next action",
    "decision-missing-route"
  );

  await new ExecutionStage().execute(
    state
  );

  assert(
    state.currentExecutionId ===
      null,
    "execution must not be created without a resolved route"
  );

  assert(
    state.errors.some(
      (error) =>
        error.includes(
          "action route is missing"
        )
    ),
    "missing routes must produce an execution safety error"
  );

  assert(
    getAllExecutions().length ===
      0,
    "missing routes must not create execution records"
  );
}

async function verifyResolvedRouteCreatesExecution(): Promise<void> {
  clearExecutions();

  const {
    state,
    plan,
    decision,
  } = prepareDecisionState(
    "conversation",
    "Search for the latest status",
    "decision-resolved-route"
  );

  state.actionRoute = {
    id: `route-${decision.id}`,
    kind: "provider",
    action: decision.selectedAction,
    target: "web-search",
    confidence: 0.9,
    executable: true,
  };

  await new ExecutionStage().execute(
    state
  );

  assert(
    state.currentExecutionId !==
      null,
    "resolved executable routes must create pending execution"
  );

  assert(
    state.execution?.includes(
      "Route: web-search"
    ) === true,
    "execution state must preserve the resolved route target"
  );

  const executions =
    getAllExecutions();

  assert(
    executions.length ===
      1,
    "resolved routes must create exactly one execution record"
  );

  assert(
    executions[0]?.route?.id ===
      state.actionRoute.id,
    "execution record must preserve the route identity"
  );

  assert(
    executions[0]?.route?.target ===
      "web-search",
    "execution record must preserve the route target"
  );

  assert(
    executions[0]?.planId ===
      plan.id,
    "execution record must preserve the plan identity"
  );

  assert(
    executions[0]?.result ===
      null,
    "the execution fixture must remain pending when no provider capability is available"
  );
}

async function verifyPendingExecutionIsNotReExecuted(): Promise<void> {
  clearExecutions();

  const {
    state,
    plan,
    decision,
  } = prepareDecisionState(
    "conversation-idempotency",
    "Search for the latest status",
    "decision-pending-idempotency"
  );

  const actionRoute = {
    id: `route-${decision.id}`,
    kind: "provider" as const,
    action: decision.selectedAction,
    target: "web-search",
    confidence: 0.9,
    executable: true,
  };

  state.actionRoute =
    actionRoute;

  const existingExecution =
    createExecutionFromDecision(
      decision,
      plan.id,
      actionRoute
    );

  const started =
    startExecution(
      existingExecution.id
    );

  assert(
    started !== null,
    "fixture execution must enter the in-progress state"
  );

  state.currentExecutionId =
    existingExecution.id;

  const stage =
    new ExecutionStage();

  await stage.execute(
    state
  );

  assert(
    getAllExecutions().length ===
      1,
    "re-entry must not create a second execution record"
  );

  assert(
    getAllExecutions()[0]?.id ===
      existingExecution.id,
    "re-entry must preserve the existing execution identity"
  );

  assert(
    getAllExecutions()[0]?.status ===
      "in_progress",
    "re-entry must preserve the existing in-progress state"
  );

  await stage.execute(
    state
  );

  assert(
    getAllExecutions().length ===
      1,
    "repeated re-entry must remain idempotent"
  );

  assert(
    state.runtimeStatus ===
      "in_progress",
    "pending execution re-entry must remain observable as in progress"
  );
}

await verifyMissingRouteBlocksExecution();
await verifyResolvedRouteCreatesExecution();
await verifyPendingExecutionIsNotReExecuted();
