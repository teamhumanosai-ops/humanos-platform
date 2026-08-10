export type ReasoningSource =
  | "intent"
  | "memory"
  | "knowledge"
  | "live_knowledge"
  | "timeline"
  | "reflection"
  | "profile"
  | "knowledge_graph";

export type ReasoningObservation = {
  statement: string;

  confidence: number;

  source: ReasoningSource;
};

export type ReasoningResult = {
  summary: string;

  observations: ReasoningObservation[];

  confidence: number;
};