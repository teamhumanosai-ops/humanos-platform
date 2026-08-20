import {
  authorizeAndCreateActionDispatch,
} from "./authorizedDispatch";

import {
  createBrainState,
} from "../brainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorized dispatch verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Search the web"
  );

state.actionRoute = {
  id: "route-authorized-search",
  kind: "provider",
  action: "Search the web",
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

const result =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  result.authorization.status ===
    "allowed",
  "allowed routes must retain the authorization decision"
);

assert(
  result.dispatch !== null,
  "allowed routes must produce a dispatch"
);

assert(
  result.dispatch?.routeId ===
    "route-authorized-search",
  "dispatch must remain bound to the authorized route"
);

assert(
  result.dispatch?.authorizationPolicyVersion ===
    result.authorization.policyVersion,
  "dispatch must preserve the authorization policy version"
);

const toolState =
  createBrainState(
    "conversation",
    [],
    "Run a tool"
  );

toolState.actionRoute = {
  id: "route-tool-confirmation",
  kind: "tool",
  action: "Run a tool",
  target: "tool",
  confidence: 0.95,
  executable: true,
};

const toolResult =
  authorizeAndCreateActionDispatch(
    toolState
  );

assert(
  toolResult.authorization.status ===
    "requires_confirmation",
  "tool routes must require confirmation"
);

assert(
  toolResult.dispatch === null,
  "confirmation-required tool routes must not produce dispatches"
);

const blockedState =
  createBrainState(
    "conversation",
    [],
    "Unknown action"
  );

blockedState.actionRoute = {
  id: "route-unresolved",
  kind: "unknown",
  action: "Unknown action",
  target: "unresolved",
  confidence: 0,
  executable: false,
};

const blockedResult =
  authorizeAndCreateActionDispatch(
    blockedState
  );

assert(
  blockedResult.authorization.status ===
    "blocked",
  "invalid routes must be blocked before dispatch"
);

assert(
  blockedResult.dispatch === null,
  "blocked routes must never produce dispatches"
);
