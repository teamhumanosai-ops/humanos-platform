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
      `Voice input verification failed: ${message}`
    );
  }
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

void verifyServerBoundary();
