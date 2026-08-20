import {
  summarizeMultimodalInput,
} from "./multimodalRuntime";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Multimodal runtime verification failed: ${message}`
    );
  }
}

const text =
  summarizeMultimodalInput({
    text: "Hello Human OS",
  });

assert(
  text.length === 1 &&
    text[0] === "text",
  "text input must retain text modality"
);

const image =
  summarizeMultimodalInput({
    text: "Describe this",
    image: {
      mimeType: "image/png",
      dataBase64: "aW1hZ2U=",
    },
  });

assert(
  image.length === 2 &&
    image[0] === "text" &&
    image[1] === "image",
  "text plus image must preserve modality order"
);

const audio =
  summarizeMultimodalInput({
    audio: {
      mimeType: "audio/wav",
      dataBase64: "YXVkaW8=",
    },
  });

assert(
  audio.length === 1 &&
    audio[0] === "audio",
  "audio input must retain audio modality"
);

const combined =
  summarizeMultimodalInput({
    text: "Analyze both",
    image: {
      mimeType: "image/png",
      dataBase64: "aW1hZ2U=",
    },
    audio: {
      mimeType: "audio/wav",
      dataBase64: "YXVkaW8=",
    },
  });

assert(
  combined.join(",") ===
    "text,image,audio",
  "combined multimodal input must preserve all modalities"
);

let emptyRejected =
  false;

try {
  summarizeMultimodalInput({});
} catch {
  emptyRejected =
    true;
}

assert(
  emptyRejected,
  "empty runtime input must be rejected"
);
