import {
  createBrainState,
} from "../../brainState";

import {
  saveDecision,
} from "../../decision";

import type {
  Decision,
} from "../../decision";

import {
  ActionRoutingStage,
} from "./actionRoutingStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 stage verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Find the latest status"
  );

const decision: Decision = {
  id: "decision-atr-1",
  title: "Find latest status",
  description: "Resolve the next action.",
  selectedAction: "Search for the latest status",
  alternatives: [],
  reason: "Fresh information is required.",
  confidence: 0.9,
  createdAt: new Date(),
};

saveDecision(
  decision
);

state.currentDecisionId =
  decision.id;

const stage =
  new ActionRoutingStage();

await stage.execute(
  state
);

assert(
  state.actionRoute !==
    null,
  "stage must persist the routed action"
);

assert(
  state.actionRoute?.kind ===
    "provider",
  "stage must preserve the router classification"
);

assert(
  state.actionRoute?.executable ===
    true,
  "recognized routes must remain executable candidates"
);

assert(
  state.executedStages.includes(
    "ActionRouting"
  ),
  "stage execution must be recorded"
);
