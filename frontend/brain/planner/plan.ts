export type Plan = {
  goal: string;
  steps: string[];
};

export function createPlan(goal: string): Plan {
  return {
    goal,
    steps: [],
  };
}