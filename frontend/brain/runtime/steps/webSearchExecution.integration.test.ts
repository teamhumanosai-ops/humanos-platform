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
      `ATR-001 web execution verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer:
      `Live web answer for ${query}`,
    results: [
      {
        title: "Result",
        url: "https://example.com/result",
        snippet: "Example evidence",
        providers: [
          "tavily",
        ],
      },
    ],
    searchedAt:
      new Date().toISOString(),
  }),
  aiService:
    {} as RuntimeServices["aiService"],
} as RuntimeServices;

clearExecutions();

const state =
  createBrainState(
    "conversation",
    [],
    "Find the latest Human OS status"
  );

const plan =
  createPlanFromMessage(
    "Find the latest Human OS status"
  );

const decision = {
  id: "decision-web-execution",
  title: "Search the web",
  description:
    "Execute a live web search for current information.",
  selectedAction:
    "Find the latest Human OS status",
  alternatives: [],
  reason:
    "Current information requires live web intelligence.",
  confidence: 0.95,
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
  id: "route-web-execution",
  kind: "provider",
  action:
    decision.selectedAction,
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

await new ExecutionStage(
  services
).execute(state);

assert(
  state.errors.length === 0,
  "registered web-search capability must execute without errors"
);

assert(
  state.execution?.includes(
    "Status: completed"
  ) === true,
  "web-search execution must complete"
);

assert(
  state.execution?.includes(
    "Live web answer"
  ) === true,
  "web provider result must propagate into execution state"
);

assert(
  state.liveKnowledge.some(
    (item) =>
      item.includes(
        "ACTION EXECUTION COMPLETED"
      )
  ),
  "web execution must propagate observable knowledge into BrainState"
);

const execution =
  getAllExecutions()[0];

assert(
  execution?.route?.target ===
    "web-search",
  "execution must retain its action route"
);

assert(
  execution?.result?.status ===
    "completed",
  "web execution result must be normalized as completed"
);

assert(
  execution?.result?.metadata.query ===
    decision.selectedAction,
  "web execution metadata must preserve the search query"
);

clearExecutions();