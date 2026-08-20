import type {
  BrainState,
} from "../brainState";

import type {
  MultimodalInput,
} from "./multimodalContracts";

import {
  runMultimodalInput,
} from "./multimodalService";

export type MultimodalStateResult = {
  response: string;
  modalities: Array<
    "text" | "image" | "audio"
  >;
};

export function summarizeMultimodalInput(
  input: MultimodalInput
): MultimodalStateResult["modalities"] {
  const modalities: MultimodalStateResult["modalities"] = [];

  if (input.text?.trim()) {
    modalities.push("text");
  }

  if (input.image) {
    modalities.push("image");
  }

  if (input.audio) {
    modalities.push("audio");
  }

  if (modalities.length === 0) {
    throw new Error(
      "Multimodal runtime input requires text, image, or audio content."
    );
  }

  return modalities;
}

function createMultimodalContext(
  modalities: MultimodalStateResult["modalities"]
): string {
  return `Multimodal input received: ${modalities.join(", ")}.`;
}

/**
 * Executes the existing multimodal provider service and materializes its
 * response into the canonical BrainState lifecycle without creating a second
 * BrainState or runtime owner.
 */
export async function applyMultimodalInput(
  state: BrainState,
  input: MultimodalInput,
  systemContext = ""
): Promise<BrainState> {
  const modalities =
    summarizeMultimodalInput(input);

  const response =
    await runMultimodalInput(
      input,
      systemContext
    );

  const userMessage =
    input.text?.trim() ??
    `[${modalities.join(" + ")} input]`;

  return {
    ...state,
    userMessage,
    messages: [
      ...state.messages,
      {
        role: "user",
        message: userMessage,
      },
      {
        role: "assistant",
        message: response,
      },
    ],
    response,
    context: createMultimodalContext(
      modalities
    ),
    updatedAt: new Date(),
  };
}
