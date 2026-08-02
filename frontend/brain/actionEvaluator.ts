import { Plan } from "./planning";
import { calculateConfidence } from "./confidenceScorer";

export type ActionEvaluation = {
  action: string;
  score: number;
  reason: string;
};

export function evaluateActions(
  plan: Plan
): ActionEvaluation[] {
  return plan.milestones.map((milestone) => {
    const completed =
      plan.completedMilestones.includes(
        milestone
      );

    if (completed) {
      return {
        action: milestone,
        score: 0,
        reason: "Already completed",
      };
    }

    return {
      action: milestone,
      score: calculateConfidence(
        plan,
        milestone
      ),
      reason:
        milestone === plan.nextAction
          ? "Highest confidence based on current plan progress"
          : "Valid future milestone",
    };
  });
}