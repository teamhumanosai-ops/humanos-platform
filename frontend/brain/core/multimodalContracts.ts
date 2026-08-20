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

export type MultimodalUserMessage = {
  role: "user";
  parts: Array<
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
};

function validateMedia(
  kind: "image" | "audio",
  media: {
    mimeType: string;
    dataBase64: string;
  }
): void {
  if (!media.mimeType.trim()) {
    throw new Error(
      `Multimodal ${kind} input requires a MIME type.`
    );
  }

  if (!media.dataBase64.trim()) {
    throw new Error(
      `Multimodal ${kind} input requires base64 data.`
    );
  }
}

export function createMultimodalUserMessage(
  input: MultimodalInput
): MultimodalUserMessage {
  const parts:
    MultimodalUserMessage["parts"] = [];

  if (input.text?.trim()) {
    parts.push({
      type: "text",
      text: input.text.trim(),
    });
  }

  if (input.image) {
    validateMedia(
      "image",
      input.image
    );

    parts.push({
      type: "image",
      mimeType:
        input.image.mimeType.trim(),
      dataBase64:
        input.image.dataBase64.trim(),
    });
  }

  if (input.audio) {
    validateMedia(
      "audio",
      input.audio
    );

    parts.push({
      type: "audio",
      mimeType:
        input.audio.mimeType.trim(),
      dataBase64:
        input.audio.dataBase64.trim(),
    });
  }

  if (parts.length === 0) {
    throw new Error(
      "Multimodal input requires text, image, or audio content."
    );
  }

  return {
    role: "user",
    parts,
  };
}
