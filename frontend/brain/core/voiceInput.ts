import type {
  VoiceInputOptions,
  VoiceInputResult,
} from "./voiceContracts";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = Event & {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function getSpeechRecognitionConstructor():
  SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow =
    window as SpeechRecognitionWindow;

  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
}

function normalizeOptions(
  options: VoiceInputOptions = {}
): Required<VoiceInputOptions> {
  return {
    lang:
      options.lang ?? "en-US",
    continuous:
      options.continuous ?? false,
    interimResults:
      options.interimResults ?? false,
    maxAlternatives:
      options.maxAlternatives ?? 1,
  };
}

export function isVoiceInputAvailable(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

/**
 * Captures one browser speech-recognition session and resolves with the
 * final normalized transcript. This is a presentation/input boundary and
 * does not create another AI provider or mutate BrainState.
 */
export function captureVoiceInput(
  options: VoiceInputOptions = {}
): Promise<VoiceInputResult> {
  const Recognition =
    getSpeechRecognitionConstructor();

  if (!Recognition) {
    return Promise.reject(
      new Error(
        "Voice input is unavailable in this environment."
      )
    );
  }

  const normalized =
    normalizeOptions(options);
  const recognition =
    new Recognition();

  recognition.lang =
    normalized.lang;
  recognition.continuous =
    normalized.continuous;
  recognition.interimResults =
    normalized.interimResults;
  recognition.maxAlternatives =
    normalized.maxAlternatives;

  return new Promise<VoiceInputResult>(
    (resolve, reject) => {
      let transcript = "";
      let final = false;

      recognition.onresult =
        (event) => {
          for (
            let index = 0;
            index < event.results.length;
            index += 1
          ) {
            const result =
              event.results[index];
            transcript +=
              result[0].transcript;
            final =
              final || result.isFinal;
          }
        };

      recognition.onerror =
        () => {
          reject(
            new Error(
              "Voice input recognition failed."
            )
          );
        };

      recognition.onend =
        () => {
          const normalizedTranscript =
            transcript.trim();

          if (!normalizedTranscript) {
            reject(
              new Error(
                "Voice input produced an empty transcript."
              )
            );
            return;
          }

          resolve({
            transcript:
              normalizedTranscript,
            final,
          });
        };

      try {
        recognition.start();
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error(
                String(error)
              )
        );
      }
    }
  );
}

export function stopVoiceInput(): void {
  const Recognition =
    getSpeechRecognitionConstructor();

  if (!Recognition) {
    return;
  }
}
