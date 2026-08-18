import type { BrainState } from "../brainState";

import type {
  AutonomousLoopDecision,
  AutonomousLoopOptions,
} from "./types";

const DEFAULT_MAX_ITERATIONS = 3;

function normalizeMaxIterations(
  value: number | undefined
): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_ITERATIONS;
  }

  return Math.max(
    1,
    Math.min(
      10,
      Math.floor(value as number)
    )
  );
}

export function evaluateAutonomousLoop(
  state: BrainState,
  options: AutonomousLoopOptions = {}
): AutonomousLoopDecision {
  const maxIterations =
    normalizeMaxIterations(
      options.maxIterations
    );

  const iteration =
    Math.max(
      1,
      state.executedStages.length > 0
        ? 1
        : 1
    );

  if (state.errors.length > 0) {
    return {
      status: "blocked",
      reason:
        "The cognitive cycle contains errors, so autonomous continuation is blocked.",
      nextAction: null,
      recommendationId: null,
      iteration,
      maxIterations,
    };
  }

  if (state.runtimeStatus === "blocked") {
    return {
      status: "blocked",
      reason:
        "The runtime is blocked and requires resolution before continuation.",
      nextAction: null,
      recommendationId: null,
      iteration,
      maxIterations,
    };
  }

  if (state.runtimeStatus === "failed") {
    return {
      status: "blocked",
      reason:
        "The runtime failed, so autonomous continuation is blocked.",
      nextAction: null,
      recommendationId: null,
      iteration,
      maxIterations,
    };
  }

  const recommendation =
    state.recommendations[0];

  if (!recommendation) {
    return {
      status: "complete",
      reason:
        "No actionable recommendation remains, so the cognitive cycle is complete.",
      nextAction: null,
      recommendationId: null,
      iteration,
      maxIterations,
    };
  }

  if (iteration >= maxIterations) {
    return {
      status: "max_iterations",
      reason:
        "The autonomous loop reached its configured iteration safety limit.",
      nextAction:
        recommendation.statement,
      recommendationId:
        recommendation.id,
      iteration,
      maxIterations,
    };
  }

  return {
    status: "continue",
    reason:
      "A ranked recommendation provides a candidate next cognitive action. Execution must remain gated by downstream planning, decision, validation, and action-routing controls.",
    nextAction:
      recommendation.statement,
    recommendationId:
      recommendation.id,
    iteration,
    maxIterations,
  };
}
