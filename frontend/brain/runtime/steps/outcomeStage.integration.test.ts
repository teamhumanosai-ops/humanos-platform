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
  getExecution,
} from "../../execution";

import {
  clearActionTools,
  registerActionTool,
} from "../../actionRouting";

import {
  ExecutionStage,
} from "./executionStage";

import {
  OutcomeStage,
} from "./outcomeStage";

import type {
  RuntimeServices,
} from "../runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-002 outcome integration verification failed: ${message}`
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
    searchedAt:
      new Date().toISOString(),
  }),
  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Test source",
    text: "Fetched source content",
    status: 200,
    contentType: "text/html",
    fetchedAt:
      new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    text: "Firecrawl execution content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl raw source",
    markdown: "Firecrawl raw content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
  aiService:
    {} as RuntimeServices["aiService"],
} as RuntimeServices;

clearExecutions();
clearActionTools();

registerActionTool({
  id: "task-create",
  async execute(action) {
    return {
      summary:
        `Created task: ${action}`,
      metadata: {
        toolId:
          "task-create",
      },
    };
  },
});

const state =
  createBrainState(
    "conversation",
    [],
    "Create a task"
  );

const plan =
  createPlanFromMessage(
    "Create a task"
  );

const decision = {
  id:
    "decision-outcome-integration",
  title:
    "Create task",
  description:
    "Execute and finalize the requested task.",
  selectedAction:
    "task-create:Buy groceries",
  alternatives: [],
  reason:
    "Explicit execution-to-outcome verification.",
  confidence: 0.95,
  createdAt:
    new Date(),
};

saveDecision(decision);

state.currentPlanId =
  plan.id;
state.currentGoal =
  plan.goal;
state.currentDecisionId =
  decision.id;
state.actionRoute = {
  id:
    "route-outcome-integration",
  kind: "tool",
  action:
    decision.selectedAction,
  target: "tool",
  confidence: 0.95,
  executable: true,
};

await new ExecutionStage(
  services
).execute(state);

assert(
  state.errors.length === 0,
  "execution must complete before outcome finalization"
);

const execution =
  state.currentExecutionId
    ? getExecution(
        state.currentExecutionId
      )
    : undefined;

assert(
  execution?.status ===
    "completed",
  "execution artifact must be completed"
);

assert(
  execution?.result?.metadata.toolId ===
    "task-create",
  "execution metadata must survive into the outcome boundary"
);

await new OutcomeStage().execute(
  state
);

assert(
  state.outcome?.status ===
    "completed",
  "successful execution must produce a completed runtime outcome"
);

assert(
  state.runtimeStatus ===
    "completed",
  "runtime status must become completed after outcome finalization"
);

assert(
  state.outcome?.result?.includes(
    "Created task: Buy groceries"
  ) === true,
  "actual execution result must become the runtime outcome result"
);

assert(
  state.outcome?.metadata.executionResult?.metadata.toolId ===
    "task-create",
  "execution provider/tool metadata must survive outcome normalization"
);

assert(
  state.outcome?.metadata.executionId ===
    state.currentExecutionId,
  "outcome must preserve execution identity"
);

assert(
  state.outcome?.metadata.planId ===
    state.currentPlanId,
  "outcome must preserve plan identity"
);

clearActionTools();
clearExecutions();

console.log(
  "ATR-002 execution-to-outcome integration verification passed."
);
