import {
  isVoiceOutputAvailable,
  speakText,
  stopSpeaking,
} from "./voiceService";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Voice output verification failed: ${message}`
    );
  }
}

let emptyRejected =
  false;

try {
  speakText("   ");
} catch {
  emptyRejected =
    true;
}

assert(
  emptyRejected,
  "empty voice output must be rejected"
);

const disabled =
  speakText(
    "Voice disabled",
    {
      enabled: false,
    }
  );

assert(
  disabled.spoken === false,
  "disabled voice output must not execute speech"
);

assert(
  disabled.text ===
    "Voice disabled",
  "voice output must preserve normalized response text"
);

let invalidRateRejected =
  false;

try {
  speakText(
    "Invalid rate",
    {
      rate: Number.NaN,
    }
  );
} catch {
  invalidRateRejected =
    true;
}

assert(
  invalidRateRejected,
  "invalid voice options must be rejected"
);

stopSpeaking();

if (
  typeof window !==
  "undefined"
) {
  assert(
    isVoiceOutputAvailable(),
    "browser environments exposing speech synthesis must report voice availability"
  );
}
