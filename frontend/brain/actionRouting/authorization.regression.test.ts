import {
  createBrainState,
} from "../brainState";

import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
  clearActionAuthorizationConfirmation,
  confirmActionAuthorization,
  evaluateActionAuthorization,
} from "./authorization";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ACL authorization regression failed: ${message}`
    );
  }
}

function createToolState(
  routeId: string = "route-tool"
) {
  const state = createBrainState(
    "conversation",
    [],
    "Run my registered tool"
  );

  state.actionRoute = {
    id: routeId,
    kind: "tool",
    action: "Run registered tool",
    target: "tool",
    confidence: 0.9,
    executable: true,
  };

  return state;
}

const state = createToolState();

const initial = evaluateActionAuthorization(state);
assert(
  initial.status === "requires_confirmation",
  "registered tools must require explicit confirmation"
);
assert(
  initial.policyVersion === ACTION_AUTHORIZATION_POLICY_VERSION,
  "authorization must expose the canonical policy version"
);

const confirmed = confirmActionAuthorization(state);
assert(
  confirmed.status === "allowed",
  "explicit confirmation must allow the exact tool route"
);
assert(
  confirmed.confirmedAt !== null,
  "allowed tool authorization must retain confirmation provenance"
);

const reEvaluated = evaluateActionAuthorization(state);
assert(
  reEvaluated.status === "allowed",
  "exact confirmed route must remain authorized"
);

state.actionRoute = {
  ...state.actionRoute!,
  id: "route-tool-changed",
};

const changedRoute = evaluateActionAuthorization(state);
assert(
  changedRoute.status === "requires_confirmation",
  "confirmation must not survive a route identity change"
);

clearActionAuthorizationConfirmation(state);

const cleared = evaluateActionAuthorization(state);
assert(
  cleared.status === "requires_confirmation",
  "clearing confirmation must require authorization again"
);

console.log(
  "ACL authorization confirmation regression verification passed."
);
