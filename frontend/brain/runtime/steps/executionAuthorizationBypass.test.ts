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
      `ATR execution authorization bypass verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer: "Should never execute",
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
  id: "decision-authorization-bypass",
  title: "Search for status",
  description: "Verify execution cannot bypass authorization.",
  selectedAction: "Search for the latest status",
  alternatives: [],
  reason: "Authorization boundary regression test.",
  confidence: 0.95,
  createdAt: new Date(),
};

saveDecision(decision);

state.currentPlanId =
  plan.id;
state.currentDecisionId =
  decision.id;

state.actionRoute = {
  id: "route-authorization-bypass",
  kind: "provider",
  action: decision.selectedAction,
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

state.actionDispatch =
  createActionDispatch(
    state.actionRoute
  );

assert(
  state.actionDispatch !== null,
  "fixture must contain dispatch provenance"
);

await new ExecutionStage(
  services
).execute(state);

assert(
  state.currentExecutionId === null,
  "execution must not start when authorization evidence is absent"
);

assert(
  getAllExecutions().length === 0,
  "authorization bypass must not create an execution artifact"
);

assert(
  state.runtimeStatus === "blocked",
  "execution must become blocked when authorization is absent"
);

assert(
  state.errors.some(
    (error) =>
      error.includes(
        "not authorized by the current action policy"
      )
  ),
  "execution must expose the authorization boundary failure"
);

clearExecutions();

console.log(
  "ATR execution authorization bypass verification passed."
);
