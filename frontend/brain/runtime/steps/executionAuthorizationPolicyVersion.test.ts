import {
  createBrainState,
} from "../../brainState";

import {
  createPlanFromMessage,
} from "../../planning";

import {
  saveDecision,
} from "../../decision";

import {
  createActionDispatch,
} from "../../actionRouting";

import {
  clearExecutions,
  getAllExecutions,
} from "../../execution";

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
      `ATR execution authorization policy version verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (query: string) => ({
    query,
    answer: "Must not execute",
    results: [],
    searchedAt: new Date().toISOString(),
  }),
  fetchWebContent: async (url: string) => ({
    url,
    title: "Unused",
    text: "Unused",
    status: 200,
    contentType: "text/html",
    fetchedAt: new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async (url: string) => ({
    url,
    title: "Unused",
    text: "Unused",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  scrapeFirecrawl: async (url: string) => ({
    url,
    title: "Unused",
    markdown: "Unused",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  aiService: {} as RuntimeServices["aiService"],
} as RuntimeServices;

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

const decision = {
  id: "decision-policy-version",
  title: "Search for status",
  description: "Verify policy provenance cannot become stale.",
  selectedAction: "Search for the latest status",
  alternatives: [],
  reason: "Authorization policy version regression test.",
  confidence: 0.95,
  createdAt: new Date(),
};

saveDecision(decision);

state.currentPlanId =
  plan.id;
state.currentDecisionId =
  decision.id;
state.actionRoute = {
  id: "route-policy-version",
  kind: "provider",
  action: decision.selectedAction,
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

state.actionAuthorization =
  evaluateActionAuthorization(
    state
  );

state.actionDispatch =
  createActionDispatch(
    state.actionRoute,
    "atr-authorization-stale"
  );

assert(
  state.actionAuthorization.status === "allowed",
  "fixture authorization must be valid before creating stale dispatch provenance"
);

assert(
  state.actionDispatch?.authorizationPolicyVersion ===
    "atr-authorization-stale",
  "fixture must contain the intentionally stale policy version"
);

await new ExecutionStage(
  services
).execute(state);

assert(
  state.currentExecutionId === null,
  "execution must not start with stale authorization policy provenance"
);

assert(
  getAllExecutions().length === 0,
  "stale authorization policy provenance must not create execution artifacts"
);

assert(
  state.runtimeStatus === "blocked",
  "stale authorization policy provenance must block execution"
);

assert(
  state.errors.some(
    (error) =>
      error.includes(
        "policy version does not match"
      )
  ),
  "execution must expose the authorization policy version mismatch"
);

clearExecutions();

console.log(
  "ATR execution authorization policy version verification passed."
);
