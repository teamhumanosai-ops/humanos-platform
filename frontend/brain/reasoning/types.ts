export type ReasoningSource =
  | "intent"
  | "memory"
  | "knowledge"
  | "live_knowledge"
  | "timeline"
  | "reflection"
  | "profile"
  | "knowledge_graph";

export type ReasoningObservationKind =
  | "known_fact"
  | "observed_relationship"
  | "derived_inference"
  | "uncertainty";

export type ReasoningObservation = {
  statement: string;

  confidence: number;

  source: ReasoningSource;

  kind: ReasoningObservationKind;
};

export type ReasoningResult = {
  summary: string;

  observations: ReasoningObservation[];

  confidence: number;
};