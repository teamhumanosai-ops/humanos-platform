import {
  createBrainState,
} from "../../brainState";

import {
  evaluateActionAuthorization,
} from "../../actionRouting/authorization";

import {
  createActionDispatch,
} from "../../actionRouting";

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
      `ATR-001 execution route-binding verification failed: ${message}`
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

clearExecutions();

const state =
  createBrainState(
    "conversation",
    [],
    "Search the latest status"
  );

const plan =
  createPlanFromMessage(
    "Search the latest status"
  );

const decision = {
  id: "decision-route-binding",
  title: "Search the latest status",
  description: "Verify route and authorization binding.",
  selectedAction: "Search the latest status",
  alternatives: [],
  reason: "ATR-001 provenance regression coverage.",
  confidence: 0.95,
  createdAt: new Date(),
};

saveDecision(decision);

state.currentPlanId =
  plan.id;
state.currentGoal =
  plan.goal;
state.currentDecisionId =
  decision.id;

state.actionRoute = {
  id: "route-original",
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
    state.actionAuthorization.policyVersion
  );

assert(
  state.actionAuthorization.routeId ===
    "route-original",
  "authorization must bind to the original route"
);

assert(
  state.actionDispatch?.routeId ===
    "route-original",
  "dispatch must bind to the original route"
);

state.actionRoute = {
  ...state.actionRoute,
  id: "route-replaced",
  action: "Search a different source",
};

await new ExecutionStage(
  services
).execute(state);

assert(
  state.currentExecutionId ===
    null,
  "execution must not start when the route changes after dispatch"
);

assert(
  state.errors.some(
    (error) =>
      error.includes(
        "does not match action route"
      )
  ),
  "route replacement must remain auditable"
);

assert(
  getAllExecutions().length ===
    0,
  "stale dispatch provenance must prevent creation of an execution artifact"
);

clearExecutions();

console.log(
  "ATR-001 execution route-binding verification passed."
);
