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

state.actionDispatch = {
  routeId: "stale-route",
  kind: "provider",
  action: "Search stale evidence",
  target: "web-search",
};

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
  state.actionRoute?.target ===
    "web-search",
  "stage must preserve the canonical provider target"
);

assert(
  state.actionRoute?.executable ===
    true,
  "recognized routes must remain executable candidates"
);

assert(
  state.errors.length ===
    0,
  "safe routes must not create runtime errors"
);

assert(
  state.actionDispatch ===
    null,
  "rerouting must invalidate any stale dispatch descriptor"
);

assert(
  state.executedStages.includes(
    "ActionRouting"
  ),
  "stage execution must be recorded"
);

const blockedState =
  createBrainState(
    "conversation",
    [],
    "Do something ambiguous"
  );

const blockedDecision: Decision = {
  ...decision,
  id: "decision-atr-unknown",
  selectedAction: "Do something ambiguous",
};

saveDecision(
  blockedDecision
);

blockedState.currentDecisionId =
  blockedDecision.id;

blockedState.actionDispatch = {
  routeId: "stale-blocked-route",
  kind: "provider",
  action: "Search stale evidence",
  target: "web-search",
};

await stage.execute(
  blockedState
);

assert(
  blockedState.actionRoute?.target ===
    "unresolved",
  "ambiguous actions must remain unresolved"
);

assert(
  blockedState.actionDispatch ===
    null,
  "unsafe rerouting must clear stale dispatch descriptors"
);

assert(
  blockedState.errors.some(
    (error) =>
      error.includes(
        "safe executable route"
      )
  ),
  "unsafe route resolution must produce a runtime safety error"
);
