import { Lesson } from "./learning";
import { LearningCandidate } from "./learningCandidate";

export function generateLesson(
  candidate: LearningCandidate
): Lesson {
  const now = new Date();

  return {
    id: crypto.randomUUID(),

    category: candidate.category,

    title: candidate.title,

    insight: candidate.insight,

    confidence: 0.5,

    evidenceCount: 1,

    source: candidate.source,

    createdAt: now,

    updatedAt: now,

    lastReinforcedAt: now,
  };
}