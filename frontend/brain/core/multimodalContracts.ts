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

const MAX_MEDIA_BYTES =
  8 * 1024 * 1024;

const MAX_BASE64_LENGTH =
  Math.ceil(
    MAX_MEDIA_BYTES / 3
  ) * 4;

const ALLOWED_IMAGE_MIME_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

const ALLOWED_AUDIO_MIME_TYPES =
  new Set([
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/aac",
  ]);

function validateMedia(
  kind: "image" | "audio",
  media: {
    mimeType: string;
    dataBase64: string;
  }
): void {
  const mimeType =
    media.mimeType.trim().toLowerCase();
  const dataBase64 =
    media.dataBase64.trim();

  if (!mimeType) {
    throw new Error(
      `Multimodal ${kind} input requires a MIME type.`
    );
  }

  const allowedTypes =
    kind === "image"
      ? ALLOWED_IMAGE_MIME_TYPES
      : ALLOWED_AUDIO_MIME_TYPES;

  if (!allowedTypes.has(mimeType)) {
    throw new Error(
      `Unsupported multimodal ${kind} MIME type: ${mimeType}.`
    );
  }

  if (!dataBase64) {
    throw new Error(
      `Multimodal ${kind} input requires base64 data.`
    );
  }

  if (
    dataBase64.length >
    MAX_BASE64_LENGTH
  ) {
    throw new Error(
      `Multimodal ${kind} input exceeds the 8 MB size limit.`
    );
  }

  if (
    !/^[A-Za-z0-9+/]*={0,2}$/.test(
      dataBase64
    ) ||
    dataBase64.length % 4 !== 0
  ) {
    throw new Error(
      `Multimodal ${kind} input contains invalid base64 data.`
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
        input.image.mimeType.trim().toLowerCase(),
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
        input.audio.mimeType.trim().toLowerCase(),
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
