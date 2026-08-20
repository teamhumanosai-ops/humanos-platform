"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  captureVoiceInput,
  isVoiceInputAvailable,
  stopVoiceInput,
} from "@/brain/core/voiceInput";

import {
  isVoiceOutputAvailable,
  isVoiceOutputSpeaking,
  speakText,
  stopSpeaking,
  subscribeVoiceOutputState,
} from "@/brain/core/voiceService";

type VoiceControlsProps = {
  text: string;
  onTranscript: (transcript: string) => void;
};

export default function VoiceControls({
  text,
  onTranscript,
}: VoiceControlsProps) {
  const [listening, setListening] =
    useState(false);
  const [speaking, setSpeaking] =
    useState(() =>
      isVoiceOutputSpeaking()
    );
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    return subscribeVoiceOutputState(
      setSpeaking
    );
  }, []);

  async function handleVoiceInput() {
    if (!isVoiceInputAvailable()) {
      setError(
        "Voice input is unavailable in this browser."
      );
      return;
    }

    setError(null);
    setListening(true);

    try {
      const result =
        await captureVoiceInput();
      onTranscript(
        result.transcript
      );
    } catch (voiceError) {
      setError(
        voiceError instanceof Error
          ? voiceError.message
          : "Voice input failed."
      );
    } finally {
      setListening(false);
    }
  }

  function handleSpeak() {
    if (!text.trim()) {
      setError(
        "There is no response available to speak."
      );
      return;
    }

    if (!isVoiceOutputAvailable()) {
      setError(
        "Voice output is unavailable in this browser."
      );
      return;
    }

    setError(null);

    try {
      if (speaking) {
        stopSpeaking();
        return;
      }

      speakText(text);
    } catch (voiceError) {
      setError(
        voiceError instanceof Error
          ? voiceError.message
          : "Voice output failed."
      );
    }
  }

  function handleStopListening() {
    stopVoiceInput();
    setListening(false);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={
          listening
            ? handleStopListening
            : handleVoiceInput
        }
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
        disabled={!isVoiceInputAvailable()}
      >
        {listening
          ? "Stop listening"
          : "Voice input"}
      </button>

      <button
        type="button"
        onClick={handleSpeak}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
        disabled={!text.trim() || !isVoiceOutputAvailable()}
      >
        {speaking
          ? "Stop speaking"
          : "Speak response"}
      </button>

      {error && (
        <span className="text-sm text-red-300">
          {error}
        </span>
      )}
    </div>
  );
}
