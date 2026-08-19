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
      `ATR authorized dispatch integration verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Open the source"
  );

state.actionRoute = {
  id: "route-integration-content",
  kind: "provider",
  action: "Open https://example.com/source",
  target: "web-content",
  confidence: 0.94,
  executable: true,
};

const result =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  result.authorization.status ===
    "allowed",
  "web-content must be authorized before dispatch"
);

assert(
  result.authorization.routeId ===
    "route-integration-content",
  "authorization must preserve the route identity"
);

assert(
  result.dispatch !== null,
  "authorized web-content must produce a dispatch"
);

assert(
  result.dispatch?.authorizationStatus ===
    "allowed",
  "dispatch must record the allowed authorization status"
);

assert(
  result.dispatch?.authorizationRouteId ===
    result.authorization.routeId,
  "dispatch authorization route identity must match the evaluated authorization"
);

assert(
  result.dispatch?.target ===
    result.authorization.target,
  "dispatch target must match the evaluated authorization target"
);
