import {
  isVoiceOutputAvailable,
  isVoiceOutputSpeaking,
  speakText,
  stopSpeaking,
  subscribeVoiceOutputState,
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

assert(
  !isVoiceOutputSpeaking(),
  "disabled voice output must not remain active"
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

let observedState: boolean | null =
  null;

const unsubscribe =
  subscribeVoiceOutputState(
    (speaking) => {
      observedState =
        speaking;
    }
  );

assert(
  observedState === false,
  "voice output subscribers must receive the current inactive state"
);

stopSpeaking();

assert(
  !isVoiceOutputSpeaking(),
  "stopping voice output must clear active state"
);

unsubscribe();

if (
  typeof window !==
  "undefined"
) {
  assert(
    isVoiceOutputAvailable(),
    "browser environments exposing speech synthesis must report voice availability"
  );
}
