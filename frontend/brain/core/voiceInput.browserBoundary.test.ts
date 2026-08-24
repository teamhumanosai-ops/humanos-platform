import {
  captureVoiceInput,
  isVoiceInputAvailable,
  stopVoiceInput,
} from "./voiceInput";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Voice input browser-boundary verification failed: ${message}`
    );
  }
}

type RecognitionMode =
  | "success"
  | "error"
  | "idle"
  | "throw";

let mode: RecognitionMode =
  "success";
let instances: FakeRecognition[] = [];

class FakeRecognition {
  lang = "";
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onresult:
    ((event: unknown) => void) | null = null;
  onerror:
    ((event: Event) => void) | null = null;
  onend:
    (() => void) | null = null;
  stopped = false;

  constructor() {
    instances.push(this);
  }

  start(): void {
    if (mode === "throw") {
      throw new Error(
        "fake recognition start failed"
      );
    }

    if (mode === "error") {
      this.onerror?.(
        new Event("error")
      );
      return;
    }

    if (mode !== "success") {
      return;
    }

    this.onresult?.({
      results: {
        length: 1,
        0: {
          isFinal: true,
          0: {
            transcript:
              "  Hello Human OS  ",
          },
        },
      },
    });

    this.onend?.();
  }

  stop(): void {
    this.stopped = true;
    this.onend?.();
  }
}

async function verifyBrowserCapture(): Promise<void> {
  const previousWindow =
    (globalThis as { window?: unknown })
      .window;

  Object.defineProperty(
    globalThis,
    "window",
    {
      configurable: true,
      value: {
        SpeechRecognition:
          FakeRecognition,
      },
    }
  );

  try {
    instances = [];
    mode = "success";

    assert(
      isVoiceInputAvailable(),
      "browser recognition should be detected when available"
    );

    const result =
      await captureVoiceInput({
        lang: "en-GB",
        continuous: true,
        interimResults: true,
        maxAlternatives: 3,
      });

    const recognition =
      instances[0];

    assert(
      result.transcript ===
        "Hello Human OS",
      "successful recognition must return the normalized transcript"
    );

    assert(
      result.final,
      "successful final recognition must be marked final"
    );

    assert(
      recognition?.lang ===
        "en-GB" &&
        recognition.continuous &&
        recognition.interimResults &&
        recognition.maxAlternatives ===
          3,
      "recognition options must be applied to the browser session"
    );

    mode = "error";

    let recognitionRejected =
      false;

    try {
      await captureVoiceInput();
    } catch {
      recognitionRejected =
        true;
    }

    assert(
      recognitionRejected,
      "browser recognition errors must reject the capture promise"
    );

    mode = "throw";

    let startRejected =
      false;

    try {
      await captureVoiceInput();
    } catch {
      startRejected =
        true;
    }

    assert(
      startRejected,
      "browser start failures must reject the capture promise"
    );

    mode = "idle";

    const pendingCapture =
      captureVoiceInput();

    stopVoiceInput();

    let stopRejected =
      false;

    try {
      await pendingCapture;
    } catch {
      stopRejected =
        true;
    }

    assert(
      stopRejected,
      "stopping an active recognition session must reject the capture promise"
    );

    assert(
      instances.at(-1)?.stopped ===
        true,
      "stopping voice input must stop the active browser recognition session"
    );
  } finally {
    stopVoiceInput();

    if (
      previousWindow ===
      undefined
    ) {
      delete (
        globalThis as {
          window?: unknown;
        }
      ).window;
    } else {
      Object.defineProperty(
        globalThis,
        "window",
        {
          configurable: true,
          value: previousWindow,
        }
      );
    }
  }
}

await verifyBrowserCapture();

console.log(
  "Voice input browser boundary verification passed."
);
