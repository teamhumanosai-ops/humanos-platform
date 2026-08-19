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
      `ATR dispatch safety verification failed: ${message}`
    );
  }
}

const invalidConfidenceState =
  createBrainState(
    "conversation",
    [],
    "Search"
  );

invalidConfidenceState.actionRoute = {
  id: "route-invalid-confidence",
  kind: "provider",
  action: "Search",
  target: "web-search",
  confidence: 2,
  executable: true,
};

const invalidConfidenceResult =
  authorizeAndCreateActionDispatch(
    invalidConfidenceState
  );

assert(
  invalidConfidenceResult.authorization.status ===
    "blocked",
  "invalid confidence must block authorization"
);

assert(
  invalidConfidenceResult.dispatch ===
    null,
  "invalid confidence must prevent dispatch"
);

const nonExecutableState =
  createBrainState(
    "conversation",
    [],
    "Search"
  );

nonExecutableState.actionRoute = {
  id: "route-not-executable",
  kind: "provider",
  action: "Search",
  target: "web-search",
  confidence: 0.9,
  executable: false,
};

const nonExecutableResult =
  authorizeAndCreateActionDispatch(
    nonExecutableState
  );

assert(
  nonExecutableResult.authorization.status ===
    "blocked",
  "non-executable routes must block authorization"
);

assert(
  nonExecutableResult.dispatch ===
    null,
  "non-executable routes must prevent dispatch"
);
