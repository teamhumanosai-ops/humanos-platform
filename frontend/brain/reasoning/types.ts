export type ReasoningObservation = {
  statement: string;
  confidence: number;
};

export type ReasoningResult = {
  summary: string;
  observations: ReasoningObservation[];
  confidence: number;
};