import {
  createBrainState,
} from "../../brainState";

import {
  createPlanFromMessage,
} from "../../planning";

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

const plan =
  createPlanFromMessage(
    "Find the latest status"
  );

if (!plan) {
  throw new Error(
    "ATR-001 stage verification fixture could not create a plan"
  );
}

state.currentPlanId =
  plan.id;
state.currentGoal =
  plan.goal;

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

state.actionAuthorization = {
  status: "allowed",
  target: "web-search",
  routeId: "stale-route",
  reason: "Stale authorization fixture",
  policyVersion: "atr-authorization-v1",
  evaluatedAt: new Date(),
  confirmedAt: null,
};

state.actionDispatch = {
  routeId: "stale-route",
  kind: "provider",
  action: "Search stale evidence",
  target: "web-search",
  authorizationStatus: "allowed",
  authorizationPolicyVersion: "atr-authorization-v1",
  authorizationRouteId: "stale-route",
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
  state.actionAuthorization ===
    null,
  "rerouting must invalidate any stale authorization decision"
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

blockedState.currentPlanId =
  plan.id;
blockedState.currentGoal =
  plan.goal;

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

blockedState.actionAuthorization = {
  status: "allowed",
  target: "web-search",
  routeId: "stale-blocked-route",
  reason: "Stale authorization fixture",
  policyVersion: "atr-authorization-v1",
  evaluatedAt: new Date(),
  confirmedAt: null,
};

blockedState.actionDispatch = {
  routeId: "stale-blocked-route",
  kind: "provider",
  action: "Search stale evidence",
  target: "web-search",
  authorizationStatus: "allowed",
  authorizationPolicyVersion: "atr-authorization-v1",
  authorizationRouteId: "stale-blocked-route",
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
  blockedState.actionAuthorization ===
    null,
  "unsafe rerouting must clear stale authorization decisions"
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
