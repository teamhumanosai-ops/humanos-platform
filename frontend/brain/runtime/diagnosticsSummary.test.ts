import {
  StageDiagnostic,
} from "./diagnostics";

import {
  summarizeRuntimeDiagnostics,
} from "./diagnosticsSummary";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime diagnostics summary verification failed: ${message}`
    );
  }
}

const diagnostics: StageDiagnostic[] = [
  {
    stage: "Input",
    startedAt:
      new Date(1000),
    completedAt:
      new Date(1010),
    durationMs: 10,
    success: true,
    error: null,
  },
  {
    stage: "Reasoning",
    startedAt:
      new Date(1010),
    completedAt:
      new Date(1040),
    durationMs: 30,
    success: true,
    error: null,
  },
  {
    stage: "Execution",
    startedAt:
      new Date(1040),
    completedAt:
      new Date(1060),
    durationMs: 20,
    success: false,
    error: "Execution failed",
  },
  {
    stage: "Execution",
    startedAt:
      new Date(1060),
    completedAt:
      new Date(1070),
    durationMs: Number.NaN,
    success: false,
    error: "Execution failed again",
  },
];

const summary =
  summarizeRuntimeDiagnostics(
    diagnostics
  );

assert(
  summary.totalStages === 4,
  "summary must count all diagnostics"
);

assert(
  summary.successfulStages === 2,
  "summary must count successful diagnostics"
);

assert(
  summary.failedStages === 2,
  "summary must count failed diagnostics"
);

assert(
  summary.totalDurationMs === 60,
  "summary must ignore non-finite duration values"
);

assert(
  summary.failedStageNames.length === 1 &&
    summary.failedStageNames[0] ===
      "Execution",
  "summary must deduplicate failed stage names"
);

console.log(
  "Runtime diagnostics summary verification passed."
);
