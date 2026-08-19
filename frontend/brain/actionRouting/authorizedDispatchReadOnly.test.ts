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
      `ATR read-only dispatch verification failed: ${message}`
    );
  }
}

for (const target of [
  "web-search",
  "web-content",
] as const) {
  const state =
    createBrainState(
      "conversation",
      [],
      `Execute ${target}`
    );

  state.actionRoute = {
    id: `route-${target}`,
    kind: "provider",
    action: `Execute ${target}`,
    target,
    confidence: 0.9,
    executable: true,
  };

  const result =
    authorizeAndCreateActionDispatch(
      state
    );

  assert(
    result.authorization.status ===
      "allowed",
    `${target} must remain allowed as a read-only target`
  );

  assert(
    result.dispatch !== null,
    `${target} must produce a dispatch after authorization`
  );

  assert(
    result.dispatch?.target ===
      target,
    `${target} dispatch must preserve the capability target`
  );
}
