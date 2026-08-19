import {
  createBrainState,
} from "../brainState";

import {
  evaluateActionAuthorization,
} from "./authorization";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization verification failed: ${message}`
    );
  }
}

const webState =
  createBrainState(
    "conversation",
    [],
    "Find the latest status"
  );

webState.actionRoute = {
  id: "route-web",
  kind: "provider",
  action: "Search latest status",
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

const webAuthorization =
  evaluateActionAuthorization(
    webState
  );

assert(
  webAuthorization.status ===
    "allowed",
  "read-only web search must be allowed"
);

const toolState =
  createBrainState(
    "conversation",
    [],
    "Run my registered tool"
  );

toolState.actionRoute = {
  id: "route-tool",
  kind: "tool",
  action: "Run registered tool",
  target: "tool",
  confidence: 0.9,
  executable: true,
};

const toolAuthorization =
  evaluateActionAuthorization(
    toolState
  );

assert(
  toolAuthorization.status ===
    "requires_confirmation",
  "tool execution must require explicit confirmation"
);

const unresolvedState =
  createBrainState(
    "conversation",
    [],
    "Unknown action"
  );

const unresolvedAuthorization =
  evaluateActionAuthorization(
    unresolvedState
  );

assert(
  unresolvedAuthorization.status ===
    "blocked",
  "missing action routes must be blocked"
);

console.log(
  "ATR authorization policy verification passed."
);
