import { Plan } from "./planning";
import { generateDecision } from "./decisionGenerator";

export type Decision = {
  id: string;

  title: string;

  description: string;

  selectedAction: string;

  alternatives: string[];

  reason: string;

  confidence: number;

  createdAt: Date;
};

const decisionStore = new Map<string, Decision>();

/*
|--------------------------------------------------------------------------
| Query API
|--------------------------------------------------------------------------
*/

export function getAllDecisions(): Decision[] {
  return Array.from(decisionStore.values());
}

export function getDecision(
  id: string
): Decision | undefined {
  return decisionStore.get(id);
}

/*
|--------------------------------------------------------------------------
| Mutation API
|--------------------------------------------------------------------------
*/

export function saveDecision(
  decision: Decision
): void {
  decisionStore.set(
    decision.id,
    decision
  );
}

export function updateDecision(
  decision: Decision
): void {
  saveDecision(decision);
}

export function deleteDecision(
  id: string
): void {
  decisionStore.delete(id);
}

export function clearDecisions(): void {
  decisionStore.clear();
}

/*
|--------------------------------------------------------------------------
| Decision Operations
|--------------------------------------------------------------------------
*/

export function createDecisionFromPlan(
  plan: Plan
): Decision {
  const decision =
    generateDecision(plan);

  saveDecision(decision);

  return decision;
}

export function getBestDecision(
  plan: Plan
): Decision {
  return createDecisionFromPlan(plan);
}