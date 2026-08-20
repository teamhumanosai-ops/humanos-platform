import {
  BrainState,
  ConversationMessage,
} from "../brainState";

import type {
  MultimodalInput,
} from "../core/multimodalContracts";

import { CognitiveRuntime } from "./pipeline";
import { createRuntimeBrainState } from "./createBrainState";
import { runtimeServices } from "./runtimeServices";
import {
  assertRuntimeStateIntegrity,
} from "./runtimeStateIntegrity";

/**
 * Executes the Human OS Cognitive Runtime.
 *
 * Multimodal input is carried by the canonical BrainState into the runtime.
 * Provider execution remains owned by ResponseStage so the request follows
 * the same diagnostics, stage ordering, reflection, autonomy, and Outcome
 * lifecycle as text requests.
 */
export async function executeRuntime(
  messages: ConversationMessage[],
  multimodalInput:
    MultimodalInput
    | null = null
): Promise<BrainState> {
  const runtime =
    new CognitiveRuntime(
      runtimeServices
    );

  const state =
    createRuntimeBrainState(
      messages,
      multimodalInput
    );

  const result =
    await runtime.execute(
      state
    );

  return assertRuntimeStateIntegrity(
    result
  );
}
