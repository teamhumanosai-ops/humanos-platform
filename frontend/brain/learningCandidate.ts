import { LearningCategory } from "./learning";
import { LearningEvidence } from "./learningEvidence";

export type LearningCandidate = {
  title: string;

  insight: string;

  category: LearningCategory;

  source: string;

  evidence: LearningEvidence[];
};