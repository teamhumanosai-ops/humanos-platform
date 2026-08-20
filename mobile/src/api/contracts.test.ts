import { createAudioInput, createImageInput } from "./contracts";

const validBase64 = "SGVsbG8=";

function expectThrow(action: () => unknown, message: string): void {
  let thrown = false;
  try {
    action();
  } catch (error) {
    thrown = true;
    if (!(error instanceof Error) || !error.message.includes(message)) {
      throw new Error(`Expected error containing "${message}".`);
    }
  }

  if (!thrown) {
    throw new Error(`Expected action to throw: ${message}`);
  }
}

export function runMultimodalContractAssertions(): void {
  const image = createImageInput(" IMAGE/PNG ", validBase64);
  if (image.image?.mimeType !== "image/png" || image.image.dataBase64 !== validBase64) {
    throw new Error("Image MIME normalization assertion failed.");
  }

  expectThrow(
    () => createImageInput("image/svg+xml", validBase64),
    "Unsupported image MIME type"
  );
  expectThrow(
    () => createImageInput("image/jpeg", "not-base64!"),
    "invalid base64"
  );

  const audio = createAudioInput(" AUDIO/WEBM ", validBase64);
  if (audio.audio?.mimeType !== "audio/webm" || audio.audio.dataBase64 !== validBase64) {
    throw new Error("Audio MIME normalization assertion failed.");
  }

  expectThrow(
    () => createAudioInput("audio/ogg", validBase64),
    "Unsupported audio MIME type"
  );
}
