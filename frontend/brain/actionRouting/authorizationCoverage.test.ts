import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
  evaluateActionAuthorization,
} from "./authorization";

import {
  createBrainState,
} from "../brainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization coverage verification failed: ${message}`
    );
  }
}

function buildState(
  kind: "provider" | "tool" | "internal",
  target: "web-search" | "web-content" | "tool" | "cognitive"
) {
  const state =
    createBrainState(
      "conversation",
      [],
      "Execute action"
    );

  state.actionRoute = {
    id: `${kind}-${target}`,
    kind,
    action: "Execute action",
    target,
    confidence: 0.9,
    executable: true,
  };

  return state;
}

for (const target of [
  "web-search",
  "web-content",
] as const) {
  const authorization =
    evaluateActionAuthorization(
      buildState(
        "provider",
        target
      )
    );

  assert(
    authorization.status ===
      "allowed",
    `${target} provider execution must remain allowed by the current ATR policy`
  );

  assert(
    authorization.policyVersion ===
      ACTION_AUTHORIZATION_POLICY_VERSION,
    `${target} authorization must retain the canonical policy version`
  );
}

const toolAuthorization =
  evaluateActionAuthorization(
    buildState(
      "tool",
      "tool"
    )
  );

assert(
  toolAuthorization.status ===
    "requires_confirmation",
  "registered tool execution must remain confirmation-gated"
);

const cognitiveAuthorization =
  evaluateActionAuthorization(
    buildState(
      "internal",
      "cognitive"
    )
  );

assert(
  cognitiveAuthorization.status ===
    "allowed",
  "internal cognitive execution must remain allowed"
);

const noRouteState =
  createBrainState(
    "conversation",
    [],
    "Execute action"
  );

const blockedAuthorization =
  evaluateActionAuthorization(
    noRouteState
  );

assert(
  blockedAuthorization.status ===
    "blocked",
  "authorization must block execution when no route exists"
);

assert(
  blockedAuthorization.target ===
    "unresolved",
  "missing-route authorization must preserve the unresolved target"
);

console.log(
  "ATR authorization coverage verification passed."
);
