import { initializeBrain } from "../bootstrap";

import { CognitiveRuntime } from "../runtime/pipeline";
import { createRuntimeBrainState } from "../runtime/createBrainState";
import { runtimeServices } from "../runtime/runtimeServices";

import type { ConversationMessage } from "../brainState";

/**
 * Human OS Orchestrator
 *
 * Thin entry point for the cognitive runtime.
 *
 * Responsibilities:
 * 1. Initialize the brain (one-time setup)
 * 2. Create the BrainState from the conversation
 * 3. Invoke the Cognitive Runtime pipeline
 * 4. Return the final response
 *
 * All business logic lives in the runtime stages.
 */
export async function orchestrate(
  messages: ConversationMessage[]
): Promise<string> {
  await initializeBrain();

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUserMessage) {
    return "How can I help you?";
  }

  const runtime = new CognitiveRuntime(
    runtimeServices
  );

  const brainState =
    createRuntimeBrainState(messages);

  await runtime.execute(brainState);

  console.debug(
    "[Human OS Runtime]",
    brainState
  );

  return (
    brainState.response ??
    "I couldn't generate a response."
  );
}
