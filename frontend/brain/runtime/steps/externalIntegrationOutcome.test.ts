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

import {
  OutcomeStage,
} from "./outcomeStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `External integration outcome verification failed: ${message}`
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
  fetchWebContent: async (url: string) => ({
    url,
    title: "Test source",
    text: "Test source content",
    status: 200,
    contentType: "text/html",
    fetchedAt: new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async (url: string) => ({
    url,
    title: "Firecrawl source",
    text: "Firecrawl source content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  scrapeFirecrawl: async (url: string) => ({
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
  ) => `Cognitive result: ${messages[0]?.message ?? ""}`,
} as RuntimeServices;

const state =
  createBrainState(
    "external-integration-outcome-test",
    [],
    "Search for Human OS"
  );

const plan =
  createPlanFromMessage(
    "Search for Human OS"
  );

const decision = {
  id: "decision-external-integration-outcome",
  title: "Execute external search",
  description: "Execute the validated web search.",
  selectedAction: "Search for Human OS",
  alternatives: [],
  reason: "External integration outcome verification.",
  confidence: 0.9,
  createdAt: new Date(),
};

saveDecision(decision);

state.currentPlanId = plan.id;
state.currentGoal = plan.goal;
state.currentDecisionId = decision.id;
state.actionRoute = {
  id: "route-external-integration-outcome",
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

state.actionAuthorization = authorization;
state.actionDispatch = dispatch;

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

assert(
  getAllExecutions().length === 1,
  "execution must produce one provider-backed execution artifact"
);

await new OutcomeStage().execute(
  state
);

const execution =
  getAllExecutions()[0];

assert(
  state.outcome?.executionResult?.metadata
    .integrationOperations ===
    "tavily:search,firecrawl:search",
  "terminal outcome must retain provider operation provenance"
);

assert(
  state.outcome?.executionResult?.metadata
    .executionPolicy ===
    "deduplicate-concurrent",
  "terminal outcome must retain the integration safety policy"
);

assert(
  state.execution?.includes(
    "Integration: tavily:search,firecrawl:search"
  ) === true,
  "terminal BrainState execution must retain integration provenance"
);

assert(
  state.execution?.includes(
    "Execution Policy: deduplicate-concurrent"
  ) === true,
  "terminal BrainState execution must retain the integration execution policy"
);

assert(
  state.runtimeStatus ===
    "completed",
  "successful external integration outcome must complete the runtime"
);

assert(
  execution?.result?.metadata.integrationProviders ===
    "tavily,firecrawl",
  "execution artifact must remain the canonical provenance source"
);
