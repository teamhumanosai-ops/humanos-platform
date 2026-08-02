import { Plan } from "./planning";
import { Decision } from "./decision";
import {
  evaluateActions,
} from "./actionEvaluator";

export function generateDecision(
  plan: Plan
): Decision {
  const evaluations =
    evaluateActions(plan);

  const best =
    evaluations.sort(
      (a, b) => b.score - a.score
    )[0];

  return {
    id: crypto.randomUUID(),

    title: `Decision for ${plan.title}`,

    description:
      `Recommended action for "${plan.goal}"`,

    selectedAction: best.action,

    alternatives: evaluations
      .filter(
        (item) =>
          item.action !== best.action
      )
      .map((item) => item.action),

    reason: best.reason,

    confidence: plan.confidence,

    createdAt: new Date(),
  };
}