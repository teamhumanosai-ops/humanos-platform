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
