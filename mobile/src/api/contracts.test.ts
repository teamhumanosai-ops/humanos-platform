import { createAudioInput, createImageInput } from "./contracts";

describe("multimodal contracts", () => {
  const validBase64 = "SGVsbG8=";

  it("normalizes supported image MIME types", () => {
    expect(createImageInput(" IMAGE/PNG ", validBase64)).toEqual({
      image: { mimeType: "image/png", dataBase64: validBase64 },
    });
  });

  it("rejects unsupported image MIME types", () => {
    expect(() => createImageInput("image/svg+xml", validBase64)).toThrow("Unsupported image MIME type");
  });

  it("rejects invalid base64", () => {
    expect(() => createImageInput("image/jpeg", "not-base64!")).toThrow("invalid base64");
  });

  it("normalizes supported audio MIME types", () => {
    expect(createAudioInput(" AUDIO/WEBM ", validBase64)).toEqual({
      audio: { mimeType: "audio/webm", dataBase64: validBase64 },
    });
  });

  it("rejects unsupported audio MIME types", () => {
    expect(() => createAudioInput("audio/ogg", validBase64)).toThrow("Unsupported audio MIME type");
  });
});
