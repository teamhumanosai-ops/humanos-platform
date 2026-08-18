import type { BrainState } from "../brainState";

export type AutonomousLoopStatus =
  | "complete"
  | "continue"
  | "blocked"
  | "max_iterations";

export type AutonomousLoopOptions = {
  maxIterations?: number;
};

export type AutonomousLoopDecision = {
  status: AutonomousLoopStatus;
  reason: string;
  nextAction: string | null;
  recommendationId: string | null;
  iteration: number;
  maxIterations: number;
};

export type AutonomousLoopEvaluation = (
  state: BrainState,
  options?: AutonomousLoopOptions
) => AutonomousLoopDecision;
