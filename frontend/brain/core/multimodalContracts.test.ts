import {
  createMultimodalUserMessage,
} from "./multimodalContracts";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Multimodal contract verification failed: ${message}`
    );
  }
}

const textOnly =
  createMultimodalUserMessage({
    text: "Describe this request.",
  });

assert(
  textOnly.role ===
    "user",
  "normalized multimodal messages must be user messages"
);

assert(
  textOnly.parts.length ===
    1 &&
    textOnly.parts[0]?.type ===
      "text",
  "text input must become one text part"
);

const imageInput =
  createMultimodalUserMessage({
    text: "Describe this image.",
    image: {
      mimeType:
        "image/png",
      dataBase64:
        "aW1hZ2U=",
    },
  });

assert(
  imageInput.parts.length ===
    2,
  "text plus image input must preserve both parts"
);

assert(
  imageInput.parts[1]?.type ===
    "image" &&
    imageInput.parts[1].mimeType ===
      "image/png",
  "image MIME type must be preserved"
);

const audioInput =
  createMultimodalUserMessage({
    audio: {
      mimeType:
        "audio/wav",
      dataBase64:
        "YXVkaW8=",
    },
  });

assert(
  audioInput.parts.length ===
    1 &&
    audioInput.parts[0]?.type ===
      "audio",
  "audio input must become one audio part"
);

let emptyRejected =
  false;

try {
  createMultimodalUserMessage({});
} catch {
  emptyRejected =
    true;
}

assert(
  emptyRejected,
  "empty multimodal input must be rejected"
);

let invalidImageRejected =
  false;

try {
  createMultimodalUserMessage({
    image: {
      mimeType: "",
      dataBase64:
        "aW1hZ2U=",
    },
  });
} catch {
  invalidImageRejected =
    true;
}

assert(
  invalidImageRejected,
  "image input without MIME type must be rejected"
);

let invalidAudioRejected =
  false;

try {
  createMultimodalUserMessage({
    audio: {
      mimeType:
        "audio/wav",
      dataBase64: "",
    },
  });
} catch {
  invalidAudioRejected =
    true;
}

assert(
  invalidAudioRejected,
  "audio input without data must be rejected"
);

let unsupportedImageRejected =
  false;

try {
  createMultimodalUserMessage({
    image: {
      mimeType:
        "image/svg+xml",
      dataBase64:
        "aW1hZ2U=",
    },
  });
} catch {
  unsupportedImageRejected =
    true;
}

assert(
  unsupportedImageRejected,
  "unsupported image MIME types must be rejected"
);

let unsupportedAudioRejected =
  false;

try {
  createMultimodalUserMessage({
    audio: {
      mimeType:
        "video/mp4",
      dataBase64:
        "YXVkaW8=",
    },
  });
} catch {
  unsupportedAudioRejected =
    true;
}

assert(
  unsupportedAudioRejected,
  "non-audio MIME types must be rejected for audio input"
);

let invalidBase64Rejected =
  false;

try {
  createMultimodalUserMessage({
    image: {
      mimeType:
        "image/png",
      dataBase64:
        "not valid base64!",
    },
  });
} catch {
  invalidBase64Rejected =
    true;
}

assert(
  invalidBase64Rejected,
  "invalid base64 media payloads must be rejected"
);

let oversizedRejected =
  false;

try {
  createMultimodalUserMessage({
    audio: {
      mimeType:
        "audio/wav",
      dataBase64:
        "A".repeat(
          11_184_812
        ),
    },
  });
} catch {
  oversizedRejected =
    true;
}

assert(
  oversizedRejected,
  "oversized media payloads must be rejected"
);
