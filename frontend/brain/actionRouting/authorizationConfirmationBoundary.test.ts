import {
  createBrainState,
} from "../brainState";

import {
  ActionDispatchStage,
} from "../runtime/steps/actionDispatchStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization confirmation boundary verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Send the message"
  );

state.actionRoute = {
  id: "route-confirmation-required",
  kind: "tool",
  action: "tool:message:Send the message",
  target: "tool",
  confidence: 0.99,
  executable: true,
};

await new ActionDispatchStage().execute(
  state
);

assert(
  state.actionAuthorization?.status ===
    "requires_confirmation",
  "side-effecting tool routes must require confirmation before dispatch"
);

assert(
  state.actionAuthorization?.routeId ===
    "route-confirmation-required",
  "confirmation authorization must remain bound to the exact route"
);

assert(
  state.actionDispatch ===
    null,
  "confirmation-required routes must never receive an executable dispatch descriptor"
);

assert(
  state.errors.some(
    (error) =>
      error.includes(
        "requires explicit user confirmation"
      )
  ),
  "the dispatch boundary must expose the confirmation requirement"
);

assert(
  state.runtimeStatus ===
    "blocked",
  "confirmation-required execution must remain blocked until an explicit confirmation path exists"
);

console.log(
  "ATR authorization confirmation boundary verification passed."
);
