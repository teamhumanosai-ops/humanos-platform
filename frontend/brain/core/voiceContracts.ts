export type VoiceOutputOptions = {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
};

export type VoiceOutputResult = {
  spoken: boolean;
  text: string;
};

export type VoiceOutputStateListener = (
  speaking: boolean
) => void;

export type VoiceInputOptions = {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
};

export type VoiceInputResult = {
  transcript: string;
  final: boolean;
};
