import { LearningCandidate } from "./learningCandidate";
import { LearningEvidence } from "./learningEvidence";

export function createLearningCandidate(
  title: string,
  insight: string,
  category: LearningCandidate["category"],
  source: string
): LearningCandidate {
  const evidence: LearningEvidence = {
    id: crypto.randomUUID(),

    source,

    observation: insight,

    confidence: 0.5,

    createdAt: new Date(),
  };

  return {
    title,
    insight,
    category,
    source,
    evidence: [evidence],
  };
}