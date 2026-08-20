import {
  captureVoiceInput,
  collectVoiceRecognitionResults,
  isVoiceInputAvailable,
  stopVoiceInput,
} from "./voiceInput";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Voice input verification failed: ${message}`
    );
  }
}

function verifyRecognitionNormalization(): void {
  const first =
    collectVoiceRecognitionResults({
      results: {
        length: 2,
        0: {
          isFinal: true,
          0: {
            transcript:
              "Hello",
          },
        },
        1: {
          isFinal: false,
          0: {
            transcript:
              " Human",
          },
        },
      },
    } as never);

  assert(
    first.finalTranscript ===
      "Hello",
    "final speech results must be preserved once"
  );

  assert(
    first.interimTranscript ===
      "Human",
    "interim speech results must remain separate"
  );

  assert(
    first.final,
    "final speech results must mark the result as final"
  );

  const updated =
    collectVoiceRecognitionResults({
      results: {
        length: 2,
        0: {
          isFinal: true,
          0: {
            transcript:
              "Hello",
          },
        },
        1: {
          isFinal: true,
          0: {
            transcript:
              " Human OS",
          },
        },
      },
    } as never);

  assert(
    updated.finalTranscript ===
      "Hello Human OS",
    "cumulative browser results must not duplicate earlier transcript text"
  );

  assert(
    updated.interimTranscript ===
      "",
    "finalized browser results must clear interim transcript"
  );
}

async function verifyServerBoundary(): Promise<void> {
  stopVoiceInput();

  if (
    typeof window !==
    "undefined"
  ) {
    return;
  }

  assert(
    !isVoiceInputAvailable(),
    "server environments must not report browser voice input availability"
  );

  let unavailableRejected =
    false;

  try {
    await captureVoiceInput();
  } catch {
    unavailableRejected =
      true;
  }

  assert(
    unavailableRejected,
    "voice input must reject when browser recognition is unavailable"
  );
}

verifyRecognitionNormalization();
void verifyServerBoundary();
