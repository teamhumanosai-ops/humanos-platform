import { LearningCategory } from "./learning";

export type LearningCandidate = {
  title: string;

  insight: string;

  category: LearningCategory;

  source: string;
};