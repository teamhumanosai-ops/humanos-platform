import {
  createBrainState,
} from "../../brainState";

import {
  ActionDispatchStage,
} from "./actionDispatchStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization boundary verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Run a registered tool"
  );

state.actionRoute = {
  id: "route-tool-confirmation",
  kind: "tool",
  action: "Run registered tool",
  target: "tool",
  confidence: 0.95,
  executable: true,
};

const stage =
  new ActionDispatchStage();

await stage.execute(
  state
);

assert(
  state.actionAuthorization?.status ===
    "requires_confirmation",
  "tool dispatch must record the confirmation requirement"
);

assert(
  state.actionDispatch === null,
  "unauthorized tool execution must not create a dispatch descriptor"
);

assert(
  state.runtimeStatus ===
    "blocked",
  "confirmation-gated execution must block the runtime"
);

assert(
  state.errors.some(
    (error) =>
      error.includes(
        "requires explicit user confirmation"
      )
  ),
  "authorization reason must remain auditable"
);

console.log(
  "ATR authorization dispatch boundary verification passed."
);
