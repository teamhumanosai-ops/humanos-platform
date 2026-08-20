export type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export type MultimodalInput = {
  image?: {
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

export function createImageInput(
  mimeType: string,
  dataBase64: string
): MultimodalInput {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  const normalizedData = dataBase64.trim();

  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(normalizedMimeType)) {
    throw new Error(`Unsupported image MIME type: ${normalizedMimeType || "unknown"}.`);
  }

  if (!normalizedData) {
    throw new Error("Image input requires base64 data.");
  }

  if (normalizedData.length > MAX_BASE64_LENGTH) {
    throw new Error("Image input exceeds the 8 MB size limit.");
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedData) || normalizedData.length % 4 !== 0) {
    throw new Error("Image input contains invalid base64 data.");
  }

  return {
    image: {
      mimeType: normalizedMimeType,
      dataBase64: normalizedData,
    },
  };
}
