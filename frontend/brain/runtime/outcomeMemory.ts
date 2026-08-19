import type { RuntimeReflection } from "../reflection";
import type { RuntimeOutcome } from "./outcome";

export type RuntimeOutcomeMemory = {
  key: string;
  value: string;
  confidence: number;
};

export function buildRuntimeOutcomeMemory(
  outcome: RuntimeOutcome,
  reflection: RuntimeReflection
): RuntimeOutcomeMemory | null {
  const executionId =
    outcome.metadata.executionId?.trim();

  if (!executionId) {
    return null;
  }

  if (
    outcome.status !== "completed" &&
    outcome.status !== "failed" &&
    outcome.status !== "blocked"
  ) {
    return null;
  }

  const value = [
    reflection.summary,
    reflection.evidence,
    `Confidence: ${reflection.confidence}`,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");

  if (!value) {
    return null;
  }

  return {
    key: `runtime-outcome:${executionId}`,
    value,
    confidence: reflection.confidence,
  };
}
