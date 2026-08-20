import {
  createBrainState,
} from "../brainState";

import {
  authorizeAndCreateActionDispatch,
  getActionCapability,
} from "./index";

import {
  confirmActionAuthorization,
} from "./authorization";

import {
  clearActionTools,
  registerActionTool,
} from "./toolCapabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorized tool execution integration verification failed: ${message}`
    );
  }
}

clearActionTools();

registerActionTool({
  id: "integration-tool",
  async execute(action) {
    return {
      summary: `executed:${action}`,
      metadata: {
        provider: "integration-tool",
      },
    };
  },
});

const state =
  createBrainState(
    "conversation",
    [],
    "Run integration task"
  );

state.actionRoute = {
  id: "tool-integration-route",
  kind: "tool",
  action: "tool:integration-tool:Run integration task",
  target: "tool",
  confidence: 0.99,
  executable: true,
};

const blocked =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  blocked.authorization.status ===
    "requires_confirmation",
  "side-effecting tool execution must not dispatch before confirmation"
);

assert(
  blocked.dispatch ===
    null,
  "unconfirmed tool execution must not produce an executable dispatch"
);

const confirmed =
  confirmActionAuthorization(
    state
  );

assert(
  confirmed.status ===
    "allowed",
  "explicit confirmation must authorize the exact tool route"
);

const authorized =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  authorized.authorization.status ===
    "allowed",
  "confirmed tool routes must remain authorized at the dispatch boundary"
);

assert(
  authorized.dispatch?.target ===
    "tool",
  "confirmed tool routes must produce a tool dispatch"
);

assert(
  authorized.dispatch?.routeId ===
    "tool-integration-route",
  "dispatch must retain the exact authorized route identity"
);

const capability =
  getActionCapability("tool");

assert(
  capability !== null,
  "the registered tool capability must be executable"
);

if (capability && authorized.dispatch) {
  const result =
    await capability.execute(
      authorized.dispatch.action,
      {} as never
    );

  assert(
    result.summary ===
      "executed:Run integration task",
    "authorized tool execution must invoke the registered tool and preserve its real result"
  );

  assert(
    result.metadata?.toolId ===
      "integration-tool",
    "real tool execution must retain registered-tool provenance"
  );
}

clearActionTools();

console.log(
  "ATR authorized tool execution integration verification passed."
);
