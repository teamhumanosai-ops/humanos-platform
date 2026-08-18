import {
  StageDiagnostic,
} from "./diagnostics";

export type RuntimeDiagnosticsSummary = {
  totalStages: number;
  successfulStages: number;
  failedStages: number;
  totalDurationMs: number;
  failedStageNames: string[];
};

export function summarizeRuntimeDiagnostics(
  diagnostics: StageDiagnostic[]
): RuntimeDiagnosticsSummary {
  const failedStageNames = [
    ...new Set(
      diagnostics
        .filter(
          (diagnostic) =>
            !diagnostic.success
        )
        .map(
          (diagnostic) =>
            diagnostic.stage
        )
        .filter(Boolean)
    ),
  ];

  return {
    totalStages:
      diagnostics.length,

    successfulStages:
      diagnostics.filter(
        (diagnostic) =>
          diagnostic.success
      ).length,

    failedStages:
      diagnostics.filter(
        (diagnostic) =>
          !diagnostic.success
      ).length,

    totalDurationMs:
      diagnostics.reduce(
        (total, diagnostic) =>
          total +
          Math.max(
            0,
            Number.isFinite(
              diagnostic.durationMs
            )
              ? diagnostic.durationMs
              : 0
          ),
        0
      ),

    failedStageNames,
  };
}
