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
      `ATR dispatch binding verification failed: ${message}`
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
  id: "route-binding",
  kind: "provider",
  action: "Search the web",
  target: "web-search",
  confidence: 0.9,
  executable: true,
};

const firstResult =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  firstResult.dispatch !== null,
  "the original route must produce a dispatch"
);

assert(
  firstResult.authorization.routeId ===
    state.actionRoute.id,
  "authorization must bind to the current route id"
);

assert(
  firstResult.authorization.target ===
    state.actionRoute.target,
  "authorization must bind to the current route target"
);

state.actionRoute = {
  ...state.actionRoute,
  id: "route-binding-replaced",
};

const replacedResult =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  replacedResult.authorization.status ===
    "allowed",
  "a freshly evaluated replacement route may be authorized"
);

assert(
  replacedResult.dispatch?.routeId ===
    "route-binding-replaced",
  "dispatch must bind to the replacement route rather than stale route state"
);

const noRouteState =
  createBrainState(
    "conversation",
    [],
    "No route"
  );

const noRouteResult =
  authorizeAndCreateActionDispatch(
    noRouteState
  );

assert(
  noRouteResult.authorization.status ===
    "blocked",
  "missing routes must be blocked"
);

assert(
  noRouteResult.dispatch === null,
  "missing routes must not produce dispatches"
);
