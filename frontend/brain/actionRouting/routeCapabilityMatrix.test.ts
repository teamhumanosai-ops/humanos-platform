import {
  isExecutableActionRoute,
} from "./guards";

import {
  getActionCapability,
} from "./capabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR route capability matrix verification failed: ${message}`
    );
  }
}

const routes = [
  {
    id: "provider-search",
    kind: "provider" as const,
    target: "web-search" as const,
  },
  {
    id: "provider-content",
    kind: "provider" as const,
    target: "web-content" as const,
  },
  {
    id: "tool-action",
    kind: "tool" as const,
    target: "tool" as const,
  },
  {
    id: "internal-cognitive",
    kind: "internal" as const,
    target: "cognitive" as const,
  },
];

for (const route of routes) {
  const executable =
    isExecutableActionRoute({
      ...route,
      action: `Execute ${route.id}`,
      confidence: 0.9,
      executable: true,
    });

  assert(
    executable,
    `${route.id} must pass the executable-route guard`
  );

  const capability =
    getActionCapability(
      route.target
    );

  assert(
    capability !== null,
    `${route.id} must resolve to a concrete capability`
  );

  assert(
    capability?.target ===
      route.target,
    `${route.id} route target must equal its capability target`
  );
}

const invalidPairs = [
  ["provider", "tool"],
  ["provider", "cognitive"],
  ["tool", "web-search"],
  ["internal", "web-content"],
] as const;

for (const [kind, target] of invalidPairs) {
  assert(
    !isExecutableActionRoute({
      id: `invalid-${kind}-${target}`,
      kind,
      action: "Invalid target mapping",
      target,
      confidence: 0.9,
      executable: true,
    }),
    `${kind} routes must not execute against ${target}`
  );
}

console.log(
  "ATR route capability matrix verification passed."
);
