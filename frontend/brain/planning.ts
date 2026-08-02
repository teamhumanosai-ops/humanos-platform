export type Plan = {
  id: string;

  title: string;

  goal: string;

  milestones: string[];

  completedMilestones: string[];

  nextAction: string;

  priority: number;

  confidence: number;

  updatedAt: Date;
};

const planStore = new Map<string, Plan>();

export function getPlans(): Plan[] {
  return Array.from(planStore.values());
}

export function getPlan(id: string): Plan | undefined {
  return planStore.get(id);
}

export function savePlan(plan: Plan) {
  planStore.set(plan.id, plan);
}

export function deletePlan(id: string) {
  planStore.delete(id);
}

export function clearPlans() {
  planStore.clear();
}