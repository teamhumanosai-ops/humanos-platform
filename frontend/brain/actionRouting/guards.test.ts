import {
  isExecutableActionRoute,
} from "./guards";

import type {
  ActionRoute,
} from "./types";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 guard verification failed: ${message}`
    );
  }
}

const validRoute: ActionRoute = {
  id: "route-valid",
  kind: "provider",
  action: "Search for the latest status",
  target: "web-search",
  confidence: 0.9,
  executable: true,
};

assert(
  isExecutableActionRoute(validRoute),
  "valid provider routes must pass safety validation"
);

assert(
  !isExecutableActionRoute({
    ...validRoute,
    target: "tool",
  }),
  "provider routes cannot target the tool boundary"
);

assert(
  !isExecutableActionRoute({
    ...validRoute,
    confidence: 1.2,
  }),
  "confidence above one must invalidate a route"
);

assert(
  !isExecutableActionRoute({
    ...validRoute,
    action: "   ",
  }),
  "empty actions must invalidate a route"
);

assert(
  !isExecutableActionRoute({
    ...validRoute,
    executable: false,
  }),
  "non-executable routes must fail safety validation"
);

assert(
  !isExecutableActionRoute(null),
  "missing routes must fail safety validation"
);
