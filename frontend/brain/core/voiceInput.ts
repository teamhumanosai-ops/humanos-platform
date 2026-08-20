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

export type VoiceRecognitionTranscriptState = {
  finalTranscript: string;
  interimTranscript: string;
  final: boolean;
};

let activeRecognition:
  SpeechRecognitionLike | null = null;

let activeCancel:
  (() => void) | null = null;

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

export function collectVoiceRecognitionResults(
  event: SpeechRecognitionEventLike
): VoiceRecognitionTranscriptState {
  let finalTranscript = "";
  let interimTranscript = "";
  let final = false;

  for (
    let index = 0;
    index < event.results.length;
    index += 1
  ) {
    const result =
      event.results[index];
    const transcript =
      result[0].transcript.trim();

    if (!transcript) {
      continue;
    }

    if (result.isFinal) {
      finalTranscript =
        `${finalTranscript} ${transcript}`.trim();
      final = true;
    } else {
      interimTranscript =
        `${interimTranscript} ${transcript}`.trim();
    }
  }

  return {
    finalTranscript,
    interimTranscript,
    final,
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

  stopVoiceInput();

  const normalized =
    normalizeOptions(options);
  const recognition =
    new Recognition();

  activeRecognition =
    recognition;

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
      let finalTranscript = "";
      let interimTranscript = "";
      let final = false;
      let settled = false;

      const clearActive = () => {
        if (
          activeRecognition ===
          recognition
        ) {
          activeRecognition =
            null;
        }

        if (
          activeCancel !==
          cancelRecognition
        ) {
          return;
        }

        activeCancel =
          null;
      };

      const rejectOnce = (
        error: Error
      ) => {
        if (settled) {
          return;
        }

        settled = true;
        clearActive();
        reject(error);
      };

      const cancelRecognition = () => {
        rejectOnce(
          new Error(
            "Voice input was stopped."
          )
        );
      };

      activeCancel =
        cancelRecognition;

      recognition.onresult =
        (event) => {
          const result =
            collectVoiceRecognitionResults(
              event
            );

          finalTranscript =
            result.finalTranscript;
          interimTranscript =
            result.interimTranscript;
          final =
            result.final;
        };

      recognition.onerror =
        () => {
          rejectOnce(
            new Error(
              "Voice input recognition failed."
            )
          );
        };

      recognition.onend =
        () => {
          clearActive();

          if (settled) {
            return;
          }

          const normalizedTranscript =
            `${finalTranscript} ${interimTranscript}`
              .trim();

          if (!normalizedTranscript) {
            rejectOnce(
              new Error(
                "Voice input produced an empty transcript."
              )
            );
            return;
          }

          settled = true;
          resolve({
            transcript:
              normalizedTranscript,
            final,
          });
        };

      try {
        recognition.start();
      } catch (error) {
        rejectOnce(
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
  const recognition =
    activeRecognition;
  const cancel =
    activeCancel;

  activeRecognition =
    null;
  activeCancel =
    null;

  if (cancel) {
    cancel();
  }

  if (!recognition) {
    return;
  }

  try {
    recognition.stop();
  } catch {
    // Browser implementations may throw when stopping an already-ended
    // recognition session. The active session has already been cleared.
  }
}
