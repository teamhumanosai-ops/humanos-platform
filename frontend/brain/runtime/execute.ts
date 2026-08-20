import {
  BrainState,
  ConversationMessage,
} from "../brainState";

import { CognitiveRuntime } from "./pipeline";
import { createRuntimeBrainState } from "./createBrainState";
import { runtimeServices } from "./runtimeServices";
import {
  DEFAULT_RUNTIME_EXECUTION_TIMEOUT_MS,
  withRuntimeExecutionTimeout,
} from "./executionTimeout";

/**
 * Executes the Human OS Cognitive Runtime.
 *
 * The timeout is applied at the public runtime entry boundary so a
 * caller cannot remain indefinitely blocked by a stalled cognitive
 * cycle. The canonical CognitiveRuntime remains responsible for
 * stage-level failure recovery and terminal Outcome materialization.
 */
export async function executeRuntime(
  messages: ConversationMessage[],
  timeoutMs =
    DEFAULT_RUNTIME_EXECUTION_TIMEOUT_MS
): Promise<BrainState> {
  const runtime =
    new CognitiveRuntime(
      runtimeServices
    );

  const state =
    createRuntimeBrainState(
      messages
    );

  return withRuntimeExecutionTimeout(
    runtime.execute(
      state
    ),
    timeoutMs
  );
}
