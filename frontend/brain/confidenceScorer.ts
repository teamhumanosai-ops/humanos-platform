import { Plan } from "./planning";

export function calculateConfidence(
  plan: Plan,
  action: string
): number {
  let score = 0;

  // Priority contributes up to 40 points
  score += plan.priority * 40;

  // Current next action gets a boost
  if (action === plan.nextAction) {
    score += 40;
  }

  // Existing confidence contributes up to 20 points
  score += Math.round(plan.confidence * 20);

  return Math.min(score, 100);
}