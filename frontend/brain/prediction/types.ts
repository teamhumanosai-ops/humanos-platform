export type PredictionKind =
  | "upcoming_task"
  | "recurring_behavior"
  | "likely_deadline"
  | "likely_need";

export type PredictionEvidenceSource =
  | "timeline"
  | "memory"
  | "graph"
  | "reflection"
  | "history";

export type PredictionEvidence = {
  source:
    PredictionEvidenceSource;

  statement:
    string;

  confidence:
    number;
};

export type Prediction = {
  id:
    string;

  kind:
    PredictionKind;

  statement:
    string;

  confidence:
    number;

  evidence:
    PredictionEvidence[];

  createdAt:
    Date;
};