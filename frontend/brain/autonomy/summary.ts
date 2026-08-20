import type {
  AutonomousLoopDecision,
} from "./types";

/**
 * Formats an autonomous-loop decision for safe presentation.
 *
 * This helper intentionally describes a candidate next action only.
 * It never claims that an action was executed.
 */
export function formatAutonomousLoopDecision(
  decision: AutonomousLoopDecision
): string {
  const lines = [
    `Autonomous Loop: ${decision.status}`,
    `Iteration: ${decision.iteration}/${decision.maxIterations}`,
    `Reason: ${decision.reason}`,
  ];

  if (decision.nextAction) {
    lines.push(
      `Candidate Next Action: ${decision.nextAction}`
    );
  }

  if (decision.recommendationId) {
    lines.push(
      `Recommendation ID: ${decision.recommendationId}`
    );
  }

  return lines.join("\n");
}
