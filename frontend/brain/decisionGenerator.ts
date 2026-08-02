import { Plan } from "./planning";
import { Decision } from "./decision";

export function generateDecision(
  plan: Plan
): Decision {
  return {
    id: crypto.randomUUID(),

    title: `Decision for ${plan.title}`,

    description: `Recommended action for achieving "${plan.goal}"`,

    selectedAction: plan.nextAction,

    alternatives: plan.milestones.filter(
      (m) => m !== plan.nextAction
    ),

    reason:
      `The next incomplete milestone is "${plan.nextAction}". ` +
      `Completing work in sequence keeps the plan progressing.`,

    confidence: plan.confidence,

    createdAt: new Date(),
  };
}