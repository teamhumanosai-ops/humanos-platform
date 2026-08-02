import {
  generateLesson,
} from "./lessonGenerator";

import {
  LearningCandidate,
} from "./learningCandidate";

export type LearningCategory =
  | "preference"
  | "habit"
  | "goal"
  | "skill"
  | "constraint"
  | "strategy"
  | "relationship"
  | "productivity"
  | "health"
  | "work"
  | "personal";

export type Lesson = {
  id: string;

  category: LearningCategory;

  title: string;

  insight: string;

  confidence: number;

  evidenceCount: number;

  source: string;

  createdAt: Date;

  updatedAt: Date;

  lastReinforcedAt: Date;
};

const lessonStore = new Map<
  string,
  Lesson
>();

/*
|--------------------------------------------------------------------------
| Query API
|--------------------------------------------------------------------------
*/

export function getAllLessons(): Lesson[] {
  return Array.from(
    lessonStore.values()
  );
}

export function getLesson(
  id: string
): Lesson | undefined {
  return lessonStore.get(id);
}

/*
|--------------------------------------------------------------------------
| Mutation API
|--------------------------------------------------------------------------
*/

export function saveLesson(
  lesson: Lesson
): void {
  lesson.updatedAt = new Date();

  lessonStore.set(
    lesson.id,
    lesson
  );
}

export function updateLesson(
  lesson: Lesson
): void {
  saveLesson(lesson);
}

export function deleteLesson(
  id: string
): void {
  lessonStore.delete(id);
}

export function clearLessons(): void {
  lessonStore.clear();
}

/*
|--------------------------------------------------------------------------
| Learning Operations
|--------------------------------------------------------------------------
*/

export function createLesson(
  candidate: LearningCandidate
): Lesson {
  const lesson =
    generateLesson(candidate);

  saveLesson(lesson);

  return lesson;
}