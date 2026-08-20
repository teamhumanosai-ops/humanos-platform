export type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export type MultimodalInput = {
  image?: {
    mimeType: string;
    dataBase64: string;
  };
  audio?: {
    mimeType: string;
    dataBase64: string;
  };
};

export type ChatRequest = {
  messages: ChatMessage[];
  multimodal?: MultimodalInput;
};

export type ChatResponse = {
  message: string;
  citations: unknown[];
  recommendations: unknown[];
};

const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil(MAX_MEDIA_BYTES / 3) * 4;
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AUDIO_MIME_TYPES = ["audio/m4a", "audio/mp4", "audio/mpeg", "audio/webm", "audio/wav", "audio/x-m4a"];

function validateBase64(dataBase64: string, label: string): string {
  const normalizedData = dataBase64.trim();

  if (!normalizedData) {
    throw new Error(`${label} input requires base64 data.`);
  }

  if (normalizedData.length > MAX_BASE64_LENGTH) {
    throw new Error(`${label} input exceeds the 8 MB size limit.`);
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedData) || normalizedData.length % 4 !== 0) {
    throw new Error(`${label} input contains invalid base64 data.`);
  }

  return normalizedData;
}

export function createImageInput(
  mimeType: string,
  dataBase64: string
): MultimodalInput {
  const normalizedMimeType = mimeType.trim().toLowerCase();

  if (!IMAGE_MIME_TYPES.includes(normalizedMimeType)) {
    throw new Error(`Unsupported image MIME type: ${normalizedMimeType || "unknown"}.`);
  }

  return {
    image: {
      mimeType: normalizedMimeType,
      dataBase64: validateBase64(dataBase64, "Image"),
    },
  };
}

export function createAudioInput(
  mimeType: string,
  dataBase64: string
): MultimodalInput {
  const normalizedMimeType = mimeType.trim().toLowerCase();

  if (!AUDIO_MIME_TYPES.includes(normalizedMimeType)) {
    throw new Error(`Unsupported audio MIME type: ${normalizedMimeType || "unknown"}.`);
  }

  return {
    audio: {
      mimeType: normalizedMimeType,
      dataBase64: validateBase64(dataBase64, "Audio"),
    },
  };
}
