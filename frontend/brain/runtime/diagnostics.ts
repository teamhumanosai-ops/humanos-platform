export type StageDiagnostic = {
  stage: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  success: boolean;
  error: string | null;
};

export function createStageDiagnostic(
  stage: string,
  startedAt: Date,
  completedAt: Date,
  error: string | null = null
): StageDiagnostic {
  return {
    stage,
    startedAt,
    completedAt,
    durationMs:
      completedAt.getTime() -
      startedAt.getTime(),
    success: error === null,
    error,
  };
}