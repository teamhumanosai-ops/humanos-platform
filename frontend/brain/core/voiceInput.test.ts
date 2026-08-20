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

stopVoiceInput();

if (
  typeof window ===
  "undefined"
) {
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
