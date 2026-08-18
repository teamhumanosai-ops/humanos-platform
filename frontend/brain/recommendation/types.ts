export type RecommendationKind =
  | "next_action"
  | "preparation"
  | "risk_reduction"
  | "dependency_resolution";

export type RecommendationEvidenceSource =
  | "prediction"
  | "goal"
  | "memory"
  | "graph"
  | "reflection"
  | "profile";

export type RecommendationEvidence = {
  source:
    RecommendationEvidenceSource;

  statement:
    string;

  confidence:
    number;
};

export type Recommendation = {
  id:
    string;

  kind:
    RecommendationKind;

  statement:
    string;

  rationale:
    string;

  priority:
    number;

  confidence:
    number;

  evidence:
    RecommendationEvidence[];

  createdAt:
    Date;
};
