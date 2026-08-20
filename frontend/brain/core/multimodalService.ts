import {
  generateAIMultimodalResponse,
} from "@/lib/aiService";

export type MultimodalInput = {
  text?: string;
  image?: {
    mimeType: string;
    dataBase64: string;
  };
  audio?: {
    mimeType: string;
    dataBase64: string;
  };
};

function requireText(
  value: string | undefined
): string {
  const text =
    value?.trim() ?? "";

  if (!text) {
    throw new Error(
      "Multimodal input requires non-empty text or media content."
    );
  }

  return text;
}

export async function runMultimodalInput(
  input: MultimodalInput,
  systemContext = ""
): Promise<string> {
  const parts = [] as Array<
    | {
        type: "text";
        text: string;
      }
    | {
        type: "image";
        mimeType: string;
        dataBase64: string;
      }
    | {
        type: "audio";
        mimeType: string;
        dataBase64: string;
      }
  >;

  if (systemContext.trim()) {
    parts.push({
      type: "text",
      text: systemContext.trim(),
    });
  }

  if (input.text?.trim()) {
    parts.push({
      type: "text",
      text: input.text.trim(),
    });
  }

  if (input.image) {
    parts.push({
      type: "image",
      mimeType:
        input.image.mimeType,
      dataBase64:
        input.image.dataBase64,
    });
  }

  if (input.audio) {
    parts.push({
      type: "audio",
      mimeType:
        input.audio.mimeType,
      dataBase64:
        input.audio.dataBase64,
    });
  }

  if (parts.length === 0) {
    throw new Error(
      "Multimodal input requires non-empty text or media content."
    );
  }

  if (
    parts.length === 1 &&
    parts[0]?.type === "text"
  ) {
    requireText(
      parts[0].text
    );
  }

  return generateAIMultimodalResponse(
    [
      {
        role: "user",
        parts,
      },
    ]
  );
}
