import {
  BrainState,
  ConversationMessage,
} from "../brainState";

import type {
  MultimodalInput,
} from "../core/multimodalContracts";

import {
  applyMultimodalInput,
} from "../core/multimodalRuntime";

import { CognitiveRuntime } from "./pipeline";
import { createRuntimeBrainState } from "./createBrainState";
import { runtimeServices } from "./runtimeServices";
import {
  assertRuntimeStateIntegrity,
} from "./runtimeStateIntegrity";

/**
 * Executes the Human OS Cognitive Runtime.
 *
 * Optional multimodal input is normalized into the same BrainState before
 * entering the canonical runtime. This keeps voice/image/audio processing
 * inside the existing runtime owner instead of creating a parallel lifecycle.
 */
export async function executeRuntime(
  messages: ConversationMessage[],
  multimodalInput?: MultimodalInput
): Promise<BrainState> {
  const runtime =
    new CognitiveRuntime(
      runtimeServices
    );

  let state =
    createRuntimeBrainState(
      messages
    );

  if (multimodalInput) {
    state =
      await applyMultimodalInput(
        state,
        multimodalInput
      );
  }

  const result =
    await runtime.execute(
      state
    );

  return assertRuntimeStateIntegrity(
    result
  );
}
