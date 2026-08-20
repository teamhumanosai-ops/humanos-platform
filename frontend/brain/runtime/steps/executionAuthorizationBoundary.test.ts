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

import {
  createActionDispatch,
} from "../../actionRouting";

import {
  evaluateActionAuthorization,
} from "../../actionRouting/authorization";

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
      `ATR execution authorization verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer: `Search result for ${query}`,
    results: [],
    searchedAt: new Date().toISOString(),
  }),
  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Test source",
    text: "Test source content",
    status: 200,
    contentType: "text/html",
    fetchedAt: new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    text: "Firecrawl source content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    markdown: "Firecrawl source content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  aiService: {} as RuntimeServices["aiService"],
} as RuntimeServices;

function prepareState(
  id: string
): ReturnType<typeof createBrainState> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Search for status"
    );

  const plan =
    createPlanFromMessage(
      "Search for status"
    );

  const decision = {
    id,
    title: "Search for status",
    description: "Execute the requested read-only search.",
    selectedAction: "Search for status",
    alternatives: [],
    reason: "Authorization boundary test.",
    confidence: 0.95,
    createdAt: new Date(),
  };

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
    id: `route-${id}`,
    kind: "provider",
    action: decision.selectedAction,
    target: "web-search",
    confidence: 0.95,
    executable: true,
  };

  return state;
}

async function verifyMissingAuthorizationBlocksExecution(): Promise<void> {
  clearExecutions();

  const state =
    prepareState(
      "missing-authorization"
    );

  state.actionDispatch =
    createActionDispatch(
      state.actionRoute
    );

  await new ExecutionStage(
    services
  ).execute(state);

  assert(
    state.currentExecutionId ===
      null,
    "execution must not start without an authorization decision"
  );

  assert(
    state.runtimeStatus ===
      "blocked",
    "missing authorization must block execution"
  );

  assert(
    state.errors.some(
      (error) =>
        error.includes(
          "not authorized by the current action policy"
        )
    ),
    "missing authorization must remain auditable"
  );

  assert(
    getAllExecutions().length ===
      0,
    "missing authorization must not create an execution artifact"
  );
}

async function verifyPolicyMismatchBlocksExecution(): Promise<void> {
  clearExecutions();

  const state =
    prepareState(
      "policy-mismatch"
    );

  state.actionAuthorization =
    evaluateActionAuthorization(
      state
    );

  state.actionDispatch =
    createActionDispatch(
      state.actionRoute,
      "atr-authorization-v0"
    );

  await new ExecutionStage(
    services
  ).execute(state);

  assert(
    state.currentExecutionId ===
      null,
    "policy-version mismatches must prevent execution"
  );

  assert(
    state.errors.some(
      (error) =>
        error.includes(
          "policy version does not match"
        )
    ),
    "policy-version mismatches must remain auditable"
  );

  assert(
    getAllExecutions().length ===
      0,
    "policy-version mismatches must not create execution artifacts"
  );
}

async function verifyAuthorizedExecutionSucceeds(): Promise<void> {
  clearExecutions();

  const state =
    prepareState(
      "authorized-execution"
    );

  state.actionAuthorization =
    evaluateActionAuthorization(
      state
    );

  state.actionDispatch =
    createActionDispatch(
      state.actionRoute,
      state.actionAuthorization.policyVersion
    );

  await new ExecutionStage(
    services
  ).execute(state);

  assert(
    state.errors.length ===
      0,
    "matching authorization provenance must allow execution"
  );

  assert(
    state.currentExecutionId !==
      null,
    "authorized execution must create an execution artifact"
  );

  const execution =
    getAllExecutions()[0];

  assert(
    execution?.result?.status ===
      "completed",
    "authorized execution must complete successfully"
  );

  assert(
    execution?.result?.metadata.authorizationStatus ===
      "allowed",
    "execution result must persist authorization status"
  );

  assert(
    execution?.result?.metadata.authorizationPolicyVersion ===
      state.actionAuthorization.policyVersion,
    "execution result must persist the authorization policy version"
  );
}

await verifyMissingAuthorizationBlocksExecution();
await verifyPolicyMismatchBlocksExecution();
await verifyAuthorizedExecutionSucceeds();

console.log(
  "ATR execution authorization verification passed."
);
