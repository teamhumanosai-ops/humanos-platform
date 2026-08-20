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
  authorizeAndCreateActionDispatch,
} from "../../actionRouting";

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
      `External integration execution verification failed: ${message}`
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
    results: [],
    searchedAt:
      new Date().toISOString(),
    provenance: {
      observedProviders: [
        "tavily",
        "firecrawl",
      ],
      requiredProviders: [
        "tavily",
        "firecrawl",
      ],
      dualProviderResultCount: 0,
      dualProviderCoverage: 1,
    },
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
  aiService: async (
    _systemContext: string,
    messages: Array<{
      role: "user" | "assistant";
      message: string;
    }>
  ) =>
    `Cognitive result: ${messages[0]?.message ?? ""}`,
} as RuntimeServices;

const state =
  createBrainState(
    "external-integration-test",
    [],
    "Search for Human OS"
  );

const plan =
  createPlanFromMessage(
    "Search for Human OS"
  );

const decision = {
  id: "decision-external-integration",
  title: "Execute external search",
  description: "Execute the validated web search.",
  selectedAction: "Search for Human OS",
  alternatives: [],
  reason: "External integration execution verification.",
  confidence: 0.9,
  createdAt: new Date(),
};

saveDecision(decision);

state.currentPlanId = plan.id;
state.currentGoal = plan.goal;
state.currentDecisionId = decision.id;
state.actionRoute = {
  id: "route-external-integration",
  kind: "provider",
  action: decision.selectedAction,
  target: "web-search",
  confidence: 0.9,
  executable: true,
};

const {
  authorization,
  dispatch,
} = authorizeAndCreateActionDispatch(
  state
);

state.actionAuthorization =
  authorization;
state.actionDispatch =
  dispatch;

assert(
  dispatch !== null,
  "external provider routes must produce an authorized dispatch"
);

clearExecutions();

await new ExecutionStage(
  services
).execute(
  state
);

const execution =
  getAllExecutions()[0];

assert(
  execution?.result?.status ===
    "completed",
  "external provider execution must complete successfully"
);

assert(
  execution?.result?.metadata.integrationProviders ===
    "tavily,firecrawl",
  "execution result must preserve declared integration providers"
);

assert(
  execution?.result?.metadata.integrationOperations ===
    "tavily:search,firecrawl:search",
  "execution result must preserve provider operations"
);

assert(
  execution?.result?.metadata.executionPolicy ===
    "deduplicate-concurrent",
  "external integrations must use concurrent duplicate protection"
);

assert(
  state.execution?.includes(
    "Integration: tavily:search,firecrawl:search"
  ) === true,
  "BrainState execution presentation must preserve integration provenance"
);

assert(
  state.execution?.includes(
    "Execution policy: deduplicate-concurrent"
  ) === true,
  "BrainState execution presentation must preserve the integration safety policy"
);
