import { initializeBrain } from "../bootstrap";

import { executeRuntime } from "../runtime";

import type { ConversationMessage } from "../brainState";

/**
 * Human OS Orchestrator
 *
 * Thin application-level coordinator.
 *
 * Responsibilities:
 * 1. Initialize the brain
 * 2. Execute the cognitive runtime
 * 3. Return the final response
 *
 * All cognitive execution belongs to
 * the Cognitive Runtime and its stages.
 */
export async function orchestrate(
  messages: ConversationMessage[]
): Promise<string> {
  await initializeBrain();

  const state =
    await executeRuntime(messages);

  return (
    state.response ??
    "I couldn't generate a response."
  );
}