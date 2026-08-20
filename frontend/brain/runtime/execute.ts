import {
  BrainState,
  ConversationMessage,
} from "../brainState";

import { CognitiveRuntime } from "./pipeline";
import { createRuntimeBrainState } from "./createBrainState";
import { runtimeServices } from "./runtimeServices";

/**
 * Executes the Human OS Cognitive Runtime.
 */
export async function executeRuntime(
  messages: ConversationMessage[]
): Promise<BrainState> {
  const runtime =
    new CognitiveRuntime(
      runtimeServices
    );

  const state =
    createRuntimeBrainState(
      messages
    );

  return runtime.execute(
    state
  );
}
