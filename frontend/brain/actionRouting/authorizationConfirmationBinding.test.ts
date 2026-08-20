import {
  createBrainState,
} from "../brainState";

import {
  confirmActionAuthorization,
  evaluateActionAuthorization,
} from "./authorization";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization confirmation binding verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Run tool task"
  );

state.actionRoute = {
  id: "confirmed-route",
  kind: "tool",
  action: "tool:example:Run task",
  target: "tool",
  confidence: 0.99,
  executable: true,
};

const firstConfirmation =
  confirmActionAuthorization(
    state
  );

assert(
  firstConfirmation.status ===
    "allowed",
  "the initial executable tool route must be confirmable"
);

state.actionRoute = {
  id: "different-route",
  kind: "tool",
  action: "tool:example:Different task",
  target: "tool",
  confidence: 0.99,
  executable: true,
};

const changedRouteAuthorization =
  evaluateActionAuthorization(
    state
  );

assert(
  changedRouteAuthorization.status ===
    "requires_confirmation",
  "a confirmation for one route must never authorize a different route"
);

assert(
  changedRouteAuthorization.confirmedAt ===
    null,
  "a route mismatch must not preserve confirmation provenance"
);

state.actionRoute = {
  id: "confirmed-route",
  kind: "tool",
  action: "tool:example:Run task",
  target: "tool",
  confidence: 0.99,
  executable: true,
};

const restoredRouteAuthorization =
  evaluateActionAuthorization(
    state
  );

assert(
  restoredRouteAuthorization.status ===
    "requires_confirmation",
  "confirmation must not be reusable after the route binding was invalidated"
);

console.log(
  "ATR authorization confirmation binding verification passed."
);
