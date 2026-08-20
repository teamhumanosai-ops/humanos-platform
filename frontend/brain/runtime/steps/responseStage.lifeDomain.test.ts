import {
  createBrainState,
} from "../../brainState";

import {
  ResponseStage,
} from "./responseStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Life Domain response grounding verification failed: ${message}`
    );
  }
}

const originalContext =
  "User asks for guidance.";

const state =
  createBrainState(
    "conversation",
    [],
    "Help me choose a study plan"
  );

state.context =
  originalContext +
  "\n\nLIFE DOMAIN CONTEXT:\nPrimary domain: Learning (learning)\nDomain description: Learning and education.\nDetected domains: learning=0.92\nTreat domain detection as a routing signal for this request, not as a permanent user attribute.";

const originalContextLength =
  state.context.length;

const stage =
  new ResponseStage();

await stage.execute(
  state
);

assert(
  typeof state.response ===
    "string" &&
    state.response.length >
      0,
  "response generation must complete with a non-empty response"
);

assert(
  state.context.length ===
    originalContextLength,
  "response generation must not mutate the existing BrainState context"
);

assert(
  state.context.includes(
    "Primary domain: Learning (learning)"
  ),
  "the request-scoped Life Domain context must remain available to response generation"
);

assert(
  state.context.includes(
    "not as a permanent user attribute"
  ),
  "response generation must preserve the request-scoped domain boundary"
);

console.log(
  "Life Domain response grounding verification passed."
);
