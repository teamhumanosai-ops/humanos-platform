import {
  createBrainState,
} from "../../brainState";

import {
  clearExecutions,
} from "../../execution";

import {
  clearActionTools,
  registerActionTool,
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
      `ATR failure reflection integration failed: ${message}`
    );
  }
}

clearExecutions();
clearActionTools();

registerActionTool({
  id: "failure-reflection-tool",
  async execute() {
    throw new Error(
      "external tool unavailable"
    );
  },
});

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer: "",
    results: [],
    searchedAt:
      new Date().toISOString(),
  }),
  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Test source",
    text: "Test source",
    status: 200,
    contentType: "text/html",
    fetchedAt:
      new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Test source",
    text: "Test source",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Test source",
    markdown: "Test source",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
  aiService: async () =>
    "Cognitive test result",
} as RuntimeServices;

const state =
  createBrainState(
    "conversation",
    [],
    "failure-reflection-tool:run"
  );

state.currentPlanId =
  "plan-failure-reflection";

state.currentDecisionId =
  "decision-failure-reflection";

state.actionRoute = {
  id: "route-failure-reflection",
  kind: "tool",
  action: "failure-reflection-tool:run",
  target: "tool",
  confidence: 0.9,
  executable: true,
};

const executionStage =
  new ExecutionStage(
    services
  );

await executionStage.execute(
  state
);

assert(
  state.errors.length > 0,
  "provider failure must reach BrainState errors"
);

await new OutcomeStage().execute(
  state
);

assert(
  state.reflections.length ===
    1,
  "failed execution must still produce a runtime reflection"
);

assert(
  state.reflections[0]?.includes(
    "external tool unavailable"
  ) === true,
  "failure reflection must preserve the provider error evidence"
);

assert(
  state.runtimeStatus ===
    "failed",
  "failed execution must remain failed after outcome reflection"
);

clearActionTools();
clearExecutions();

console.log(
  "ATR failure reflection integration verification passed."
);
