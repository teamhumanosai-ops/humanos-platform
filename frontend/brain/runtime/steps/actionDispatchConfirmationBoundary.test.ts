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
      `ATR-001 confirmation-boundary verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Create a task"
  );

state.actionRoute = {
  id: "route-confirmation-boundary",
  kind: "tool",
  action: "task-create:Buy groceries",
  target: "tool",
  confidence: 0.95,
  executable: true,
};

await new ActionDispatchStage().execute(
  state
);

assert(
  state.actionAuthorization?.status ===
    "requires_confirmation",
  "confirmation-required tools must not be treated as silently authorized"
);

assert(
  state.actionDispatch ===
    null,
  "confirmation-required actions must not produce a dispatch descriptor"
);

assert(
  state.runtimeStatus ===
    "blocked",
  "confirmation-required actions must block the runtime"
);

assert(
  state.errors.some(
    (error) =>
      error.includes(
        "confirmation"
      )
  ),
  "the dispatch boundary must expose the confirmation reason"
);
