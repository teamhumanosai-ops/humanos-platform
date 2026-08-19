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
  isExecutableActionRoute({
    ...validRoute,
    kind: "provider",
    target: "web-content",
  }),
  "provider routes must allow the web-content target"
);

assert(
  isExecutableActionRoute({
    ...validRoute,
    kind: "tool",
    target: "tool",
  }),
  "tool routes must pass when the tool boundary is explicitly selected"
);

assert(
  isExecutableActionRoute({
    ...validRoute,
    kind: "internal",
    target: "cognitive",
  }),
  "internal routes must pass when the cognitive target is explicitly selected"
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
    kind: "internal",
  }),
  "internal routes cannot target a provider capability"
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
    confidence: -0.1,
  }),
  "negative confidence must invalidate a route"
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
