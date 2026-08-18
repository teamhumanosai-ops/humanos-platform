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

async function verifyMissingRouteBlocksExecution(): Promise<void> {
  clearExecutions();

  const state =
    createBrainState(
      "conversation",
      [],
      "Execute the next action"
    );

  const plan =
    createPlanFromMessage(
      "Execute the next action"
    );

  const decision =
    createDecision(
      "decision-missing-route",
      "Create the requested task"
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

  const state =
    createBrainState(
      "conversation",
      [],
      "Search for the latest status"
    );

  const plan =
    createPlanFromMessage(
      "Search for the latest status"
    );

  const decision =
    createDecision(
      "decision-resolved-route",
      "Search for the latest status"
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
}

await verifyMissingRouteBlocksExecution();
await verifyResolvedRouteCreatesExecution();
