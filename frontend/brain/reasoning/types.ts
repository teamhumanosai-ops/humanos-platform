export type ReasoningSource =
  | "memory"
  | "knowledge"
  | "knowledge_graph"
  | "timeline"
  | "reflection"
  | "prediction"
  | "live_knowledge";

export type ReasoningObservationKind =
  | "known_fact"
  | "observed_relationship"
  | "derived_inference"
  | "uncertainty";

export type ReasoningObservation = {
  statement: string;

  confidence: number;

  source:
    ReasoningSource;

  kind:
    ReasoningObservationKind;
};

export type ReasoningResult = {
  summary: string;

  observations:
    ReasoningObservation[];

  confidence: number;
};