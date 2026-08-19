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
  clearActionTools,
  createActionDispatch,
  registerActionTool,
  unregisterActionTool,
} from "../../actionRouting";

import {
  ExecutionStage,
} from "./executionStage";

import type {
  RuntimeServices,
} from "../runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-002 execution provenance verification failed: ${message}`
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
      "Firecrawl raw test source",
    markdown:
      "Firecrawl raw test source content",
    status:
      200,
    contentType:
      "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
  aiService:
    {} as RuntimeServices["aiService"],
} as RuntimeServices;

clearExecutions();
clearActionTools();

registerActionTool({
  id: "provenance-tool",
  async execute(action) {
    return {
      summary:
        `Executed: ${action}`,
      metadata: {
        toolId:
          "provenance-tool",
      },
    };
  },
});

const state =
  createBrainState(
    "conversation",
    [],
    "Run provenance tool"
  );

const plan =
  createPlanFromMessage(
    "Run provenance tool"
  );

const decision = {
  id:
    "decision-provenance-tool",
  title:
    "Run provenance tool",
  description:
    "Verify capability and dispatch provenance.",
  selectedAction:
    "provenance-tool:verify",
  alternatives: [],
  reason:
    "Execution provenance regression coverage.",
  confidence:
    0.95,
  createdAt:
    new Date(),
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
  id:
    "route-provenance-tool",
  kind:
    "tool",
  action:
    decision.selectedAction,
  target:
    "tool",
  confidence:
    0.95,
  executable:
    true,
};
state.actionDispatch =
  createActionDispatch(
    state.actionRoute
  );

assert(
  state.actionDispatch !== null,
  "dispatch provenance must exist before execution"
);

await new ExecutionStage(
  services
).execute(state);

assert(
  state.errors.length === 0,
  "provenance tool execution must complete without errors"
);

const execution =
  getAllExecutions().find(
    (candidate) =>
      candidate.id ===
      state.currentExecutionId
  );

assert(
  execution?.status ===
    "completed",
  "execution artifact must be completed"
);

assert(
  execution?.route?.id ===
    state.actionRoute?.id,
  "execution must retain the selected route identity"
);

assert(
  execution?.result?.metadata.capabilityTarget ===
    "tool",
  "execution result must preserve the capability boundary"
);

assert(
  execution?.result?.metadata.executionType ===
    "registered-tool",
  "execution result must preserve the registered-tool execution type"
);

assert(
  execution?.result?.metadata.toolId ===
    "provenance-tool",
  "execution result must preserve tool identity"
);

assert(
  execution?.result?.metadata.dispatchRouteId ===
    state.actionDispatch?.routeId,
  "execution result must preserve dispatch route provenance"
);

assert(
  execution?.result?.metadata.dispatchTarget ===
    "tool",
  "execution result must preserve dispatch target"
);

const executionId =
  execution?.id;

assert(
  unregisterActionTool(
    "provenance-tool"
  ),
  "the test tool must be removable after execution"
);

const persistedAfterToolRemoval =
  executionId
    ? getAllExecutions().find(
        (candidate) =>
          candidate.id ===
          executionId
      )
    : undefined;

assert(
  persistedAfterToolRemoval?.result?.metadata.toolId ===
    "provenance-tool",
  "removing a tool must not erase historical execution provenance"
);

clearActionTools();
clearExecutions();

console.log(
  "ATR-002 execution capability provenance verification passed."
);
