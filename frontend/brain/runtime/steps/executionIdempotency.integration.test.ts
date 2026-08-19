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
  registerActionTool,
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
      `ATR-002 execution idempotency verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer: null,
    results: [],
    searchedAt:
      new Date().toISOString(),
  }),

  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Test source",
    text: "Fetched source",
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
    text: "Fetched source",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),

  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    markdown: "Fetched source",
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

let invocationCount =
  0;

registerActionTool({
  id: "idempotent-test",

  async execute(
    action
  ) {
    invocationCount +=
      1;

    return {
      summary:
        `Executed once: ${action}`,
      metadata: {},
    };
  },
});

const state =
  createBrainState(
    "conversation",
    [],
    "Run the test action"
  );

const plan =
  createPlanFromMessage(
    "Run the test action"
  );

const decision = {
  id:
    "decision-execution-idempotency",
  title:
    "Run test action",
  description:
    "Verify repeated stage entry does not execute twice.",
  selectedAction:
    "idempotent-test:once",
  alternatives: [],
  reason:
    "Execution idempotency regression test.",
  confidence: 0.99,
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
    "route-execution-idempotency",
  kind: "tool",
  action:
    decision.selectedAction,
  target: "tool",
  confidence: 0.99,
  executable: true,
};

const stage =
  new ExecutionStage(
    services
  );

await stage.execute(
  state
);
await stage.execute(
  state
);

assert(
  state.errors.length ===
    0,
  "re-entering execution must not create a runtime error"
);

assert(
  invocationCount ===
    1,
  "the registered tool must execute exactly once"
);

assert(
  getAllExecutions().length ===
    1,
  "re-entering execution must not create a second execution artifact"
);

assert(
  state.execution?.includes(
    "Status: completed"
  ) === true,
  "the existing completed execution must remain visible"
);

clearActionTools();
clearExecutions();

console.log(
  "ATR-002 execution idempotency verification passed."
);
