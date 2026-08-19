import {
  createBrainState,
} from "../../brainState";

import {
  ActionDispatchStage,
} from "./actionDispatchStage";

import {
  saveDecision,
} from "../../decision";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 dispatch authorization binding verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Search the latest status"
  );

saveDecision({
  id: "decision-dispatch-binding",
  title: "Search the latest status",
  description: "Verify dispatch authorization binding.",
  selectedAction: "Search the latest status",
  alternatives: [],
  reason: "ATR-001 dispatch boundary regression coverage.",
  confidence: 0.95,
  createdAt: new Date(),
});

state.currentDecisionId =
  "decision-dispatch-binding";

state.actionRoute = {
  id: "route-dispatch-binding",
  kind: "provider",
  action: "Search the latest status",
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

state.actionDispatch = {
  routeId: "stale-dispatch",
  kind: "provider",
  action: "Search stale action",
  target: "web-search",
  authorizationStatus: "allowed",
  authorizationPolicyVersion: "atr-authorization-v1",
  authorizationRouteId: "stale-dispatch",
};

await new ActionDispatchStage().execute(
  state
);

assert(
  state.errors.length ===
    0,
  "a fresh dispatch evaluation must replace stale dispatch state without errors"
);

assert(
  state.actionAuthorization?.status ===
    "allowed",
  "read-only provider routes must receive a fresh authorization decision"
);

assert(
  state.actionAuthorization?.routeId ===
    "route-dispatch-binding",
  "authorization must bind to the current route"
);

assert(
  state.actionDispatch?.routeId ===
    "route-dispatch-binding",
  "dispatch must bind to the current route"
);

assert(
  state.actionDispatch?.authorizationRouteId ===
    "route-dispatch-binding",
  "dispatch authorization provenance must bind to the current route"
);

assert(
  state.actionDispatch?.authorizationPolicyVersion ===
    state.actionAuthorization?.policyVersion,
  "dispatch must preserve the current authorization policy version"
);

assert(
  state.execution?.includes(
    "Authorization: allowed/atr-authorization-v1"
  ) === true,
  "dispatch execution evidence must record authorization provenance"
);

console.log(
  "ATR-001 dispatch authorization binding verification passed."
);
