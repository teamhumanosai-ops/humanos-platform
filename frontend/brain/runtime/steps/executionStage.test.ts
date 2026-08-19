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

import {
  createActionDispatch,
} from "../../actionRouting";

import type {
  Decision,
} from "../../decision";

import type {
  RuntimeServices,
} from "../runtimeServices";

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

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer:
      `Search result for ${query}`,
    results: [
      {
        title:
          "Test result",
        url:
          "https://example.com/result",
        snippet:
          "Test evidence",
      },
    ],
    searchedAt:
      new Date().toISOString(),
  }),

  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title:
      "Test source",
    text:
      "Test source content",
    status:
      200,
    contentType:
      "text/html",
    fetchedAt:
      new Date().toISOString(),
  }),

  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title:
      "Firecrawl test source",
    text:
      "Firecrawl test source content",
    status:
      200,
    contentType:
      "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),

  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title:
      "Firecrawl test source",
    markdown:
      "Firecrawl test source content",
    status:
      200,
    contentType:
      "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),

  aiService: async (
    _systemContext: string,
    messages: Array<{
      role:
        "user" | "assistant";
      message: string;
    }>
  ) =>
    `Cognitive result: ${messages[0]?.message ?? ""}`,
} as RuntimeServices;

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

function attachDispatch(
  state: ReturnType<typeof createBrainState>
): void {
  state.actionDispatch =
    createActionDispatch(
      state.actionRoute
    );
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

  await new ExecutionStage(
    services
  ).execute(
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

async function verifyMissingDispatchBlocksExecution(): Promise<void> {
  clearExecutions();

  const {
    state,
    decision,
  } = prepareDecisionState(
    "conversation-dispatch-boundary",
    "Search for the latest status",
    "decision-missing-dispatch"
  );

  state.actionRoute = {
    id: `route-${decision.id}`,
    kind: "provider",
    action: decision.selectedAction,
    target: "web-search",
    confidence: 0.9,
    executable: true,
  };

  await new ExecutionStage(
    services
  ).execute(
    state
  );

  assert(
    state.currentExecutionId ===
      null,
    "execution must not start without dispatch provenance"
  );

  assert(
    state.errors.some(
      (error) =>
        error.includes(
          "has no dispatch descriptor"
        )
    ),
    "missing dispatch provenance must produce an execution safety error"
  );

  assert(
    getAllExecutions().length ===
      0,
    "missing dispatch provenance must not create execution records"
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

  attachDispatch(
    state
  );

  assert(
    state.actionDispatch !==
      null,
    "resolved routes must produce dispatch provenance before execution"
  );

  await new ExecutionStage(
    services
  ).execute(
    state
  );

  assert(
    state.currentExecutionId !==
      null,
    "resolved executable routes must create an execution"
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
    executions[0]?.result?.status ===
      "completed",
    "real provider execution must persist completed evidence"
  );

  assert(
    executions[0]?.result?.metadata.routeId ===
      state.actionRoute.id,
    "execution result must preserve route provenance"
  );

  assert(
    executions[0]?.result?.metadata.dispatchRouteId ===
      state.actionDispatch?.routeId,
    "execution result must preserve dispatch provenance"
  );

  assert(
    executions[0]?.result?.metadata.dispatchTarget ===
      state.actionDispatch?.target,
    "execution result must preserve dispatch target"
  );

  assert(
    executions[0]?.result?.metadata.routeKind ===
      "provider",
    "execution result must preserve route kind"
  );

  assert(
    executions[0]?.result?.metadata.routeConfidence ===
      "0.9",
    "execution result must preserve route confidence"
  );

  assert(
    executions[0]?.planId ===
      plan.id,
    "execution record must preserve the plan identity"
  );
}

async function verifyMismatchedDispatchBlocksExecution(): Promise<void> {
  clearExecutions();

  const {
    state,
    decision,
  } = prepareDecisionState(
    "conversation-dispatch-mismatch",
    "Search for the latest status",
    "decision-dispatch-mismatch"
  );

  state.actionRoute = {
    id: `route-${decision.id}`,
    kind: "provider",
    action: decision.selectedAction,
    target: "web-search",
    confidence: 0.9,
    executable: true,
  };

  state.actionDispatch = {
    routeId: "route-stale",
    kind: "provider",
    action: decision.selectedAction,
    target: "web-search",
  };

  await new ExecutionStage(
    services
  ).execute(
    state
  );

  assert(
    state.currentExecutionId ===
      null,
    "mismatched dispatch provenance must block execution"
  );

  assert(
    state.errors.some(
      (error) =>
        error.includes(
          "does not match action route"
        )
    ),
    "mismatched dispatch provenance must produce a safety error"
  );

  assert(
    getAllExecutions().length ===
      0,
    "mismatched dispatch provenance must not create execution records"
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

  state.actionDispatch =
    createActionDispatch(
      actionRoute
    );

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
    new ExecutionStage(
      services
    );

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
await verifyMissingDispatchBlocksExecution();
await verifyResolvedRouteCreatesExecution();
await verifyMismatchedDispatchBlocksExecution();
await verifyPendingExecutionIsNotReExecuted();
