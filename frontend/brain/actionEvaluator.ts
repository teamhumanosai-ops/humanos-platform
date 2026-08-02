import { Plan } from "./planning";

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

    if (milestone === plan.nextAction) {
      return {
        action: milestone,
        score: 100,
        reason:
          "Highest priority because it is the next required milestone",
      };
    }

    return {
      action: milestone,
      score: 50,
      reason:
        "Useful milestone but not the immediate priority",
    };
  });
}