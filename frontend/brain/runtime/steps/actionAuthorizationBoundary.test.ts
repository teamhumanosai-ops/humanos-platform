import {
  createBrainState,
} from "../../brainState";

import {
  ActionDispatchStage,
} from "./actionDispatchStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization boundary verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Run a registered tool"
  );

state.actionRoute = {
  id: "route-tool-confirmation",
  kind: "tool",
  action: "Run registered tool",
  target: "tool",
  confidence: 0.95,
  executable: true,
};

const stage =
  new ActionDispatchStage();

await stage.execute(
  state
);

assert(
  state.actionAuthorization?.status ===
    "requires_confirmation",
  "tool dispatch must record the confirmation requirement"
);

assert(
  state.actionAuthorization?.routeId ===
    "route-tool-confirmation",
  "authorization must preserve the route identity"
);

assert(
  state.actionAuthorization?.policyVersion ===
    "atr-authorization-v1",
  "authorization must expose the active policy version"
);

assert(
  state.actionDispatch === null,
  "unauthorized tool execution must not create a dispatch descriptor"
);

assert(
  state.runtimeStatus ===
    "blocked",
  "confirmation-gated execution must block the runtime"
);

assert(
  state.errors.some(
    (error) =>
      error.includes(
        "requires explicit user confirmation"
      )
  ),
  "authorization reason must remain auditable"
);

const readOnlyState =
  createBrainState(
    "conversation",
    [],
    "Search for status"
  );

readOnlyState.actionRoute = {
  id: "route-read-only",
  kind: "provider",
  action: "Search for status",
  target: "web-search",
  confidence: 0.9,
  executable: true,
};

await new ActionDispatchStage().execute(
  readOnlyState
);

assert(
  readOnlyState.actionAuthorization?.status ===
    "allowed",
  "read-only provider actions must be authorized"
);

assert(
  readOnlyState.actionDispatch?.routeId ===
    "route-read-only",
  "authorized dispatch must preserve route identity"
);

assert(
  readOnlyState.actionDispatch?.authorizationStatus ===
    "allowed",
  "authorized dispatch must preserve the allowed authorization status"
);

assert(
  readOnlyState.actionDispatch?.authorizationPolicyVersion ===
    readOnlyState.actionAuthorization?.policyVersion,
  "dispatch must preserve the authorization policy version"
);

assert(
  readOnlyState.errors.length ===
    0,
  "authorized read-only actions must dispatch without errors"
);

console.log(
  "ATR authorization dispatch boundary verification passed."
);
