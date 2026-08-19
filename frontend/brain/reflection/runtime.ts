import type { BrainState } from "../brainState";

export type RuntimeReflection = {
  summary: string;
  evidence: string;
  confidence: number;
  createdAt: string;
};

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function createRuntimeReflection(
  state: Pick<
    BrainState,
    | "runtimeStatus"
    | "userMessage"
    | "actionRoute"
    | "execution"
    | "outcome"
    | "errors"
  >
): RuntimeReflection {
  const outcomeStatus =
    state.outcome?.status ??
    state.runtimeStatus;

  const action =
    state.actionRoute?.action ??
    state.userMessage;

  const summary =
    state.errors.length > 0
      ? `Action reflection: ${outcomeStatus}. The runtime encountered ${state.errors.length} error(s) while processing the requested action.`
      : `Action reflection: ${outcomeStatus}. The requested action reached the current runtime outcome.`;

  const evidence = [
    `Action: ${action}`,
    `Runtime status: ${state.runtimeStatus}`,
    `Outcome status: ${outcomeStatus}`,
    state.execution ?? "Execution evidence unavailable.",
    ...(state.errors.length > 0
      ? state.errors.map((error) => `Error: ${error}`)
      : []),
  ].join("\n");

  const confidence = clampConfidence(
    state.errors.length > 0
      ? 0.5
      : state.outcome?.status === "completed"
        ? 0.95
        : 0.75
  );

  return {
    summary,
    evidence,
    confidence,
    createdAt: new Date().toISOString(),
  };
}

export function buildRuntimeReflectionMemory(
  reflection: Pick<
    RuntimeReflection,
    "summary" | "evidence"
  >
): string {
  return [
    reflection.summary,
    reflection.evidence,
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}
