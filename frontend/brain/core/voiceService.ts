import type {
  VoiceOutputOptions,
  VoiceOutputResult,
} from "./voiceContracts";

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}

function normalizeOptions(
  options: VoiceOutputOptions = {}
): Required<
  Pick<
    VoiceOutputOptions,
    "enabled" | "rate" | "pitch" | "volume" | "lang"
  >
> {
  return {
    enabled:
      options.enabled ?? true,
    rate:
      options.rate ?? 1,
    pitch:
      options.pitch ?? 1,
    volume:
      options.volume ?? 1,
    lang:
      options.lang ?? "en-US",
  };
}

function assertSpeechOptionRange(
  value: number,
  name: string
): void {
  if (!Number.isFinite(value)) {
    throw new Error(
      `Voice ${name} must be a finite number.`
    );
  }
}

/**
 * Executes browser voice output for an already materialized Human OS response.
 * This is deliberately a presentation boundary: it does not create another
 * AI provider and does not mutate BrainState.
 */
export function speakText(
  text: string,
  options: VoiceOutputOptions = {}
): VoiceOutputResult {
  const normalizedText =
    text.trim();

  if (!normalizedText) {
    throw new Error(
      "Voice output requires non-empty text."
    );
  }

  const normalized =
    normalizeOptions(options);

  assertSpeechOptionRange(
    normalized.rate,
    "rate"
  );
  assertSpeechOptionRange(
    normalized.pitch,
    "pitch"
  );
  assertSpeechOptionRange(
    normalized.volume,
    "volume"
  );

  if (!normalized.enabled) {
    return {
      spoken: false,
      text: normalizedText,
    };
  }

  const speechSynthesis =
    getSpeechSynthesis();

  if (!speechSynthesis) {
    throw new Error(
      "Voice output is unavailable in this environment."
    );
  }

  const utterance =
    new SpeechSynthesisUtterance(
      normalizedText
    );

  utterance.rate =
    normalized.rate;
  utterance.pitch =
    normalized.pitch;
  utterance.volume =
    normalized.volume;
  utterance.lang =
    normalized.lang;

  speechSynthesis.cancel();
  speechSynthesis.speak(
    utterance
  );

  return {
    spoken: true,
    text: normalizedText,
  };
}

export function stopSpeaking(): void {
  getSpeechSynthesis()?.cancel();
}

export function isVoiceOutputAvailable(): boolean {
  return getSpeechSynthesis() !== null;
}
