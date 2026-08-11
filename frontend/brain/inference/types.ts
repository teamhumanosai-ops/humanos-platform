export type InferenceKind =
  | "derived_inference"
  | "uncertainty";

export type InferenceEvidence = {
  source: string;

  statement: string;

  confidence: number;
};

export type CognitiveInference = {
  id: string;

  statement: string;

  kind: InferenceKind;

  confidence: number;

  evidence: InferenceEvidence[];

  createdAt: Date;
};