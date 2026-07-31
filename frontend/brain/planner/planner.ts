import { createPlan, Plan } from "./plan";

export function planner(message: string): Plan {
  const goal = message.trim();

  const lower = goal.toLowerCase();

  const plan = createPlan(goal);

  if (lower.includes("fit")) {
    plan.steps = [
      "Understand current fitness level",
      "Create a workout plan",
      "Create a nutrition plan",
      "Track progress weekly",
      "Adjust the plan every month",
    ];

    return plan;
  }

  if (
    lower.includes("business") ||
    lower.includes("startup")
  ) {
    plan.steps = [
      "Understand the business goal",
      "Research competitors",
      "Create an execution roadmap",
      "Identify risks",
      "Track weekly progress",
    ];

    return plan;
  }

  if (
    lower.includes("study") ||
    lower.includes("learn")
  ) {
    plan.steps = [
      "Define the learning goal",
      "Break it into topics",
      "Create a study schedule",
      "Practice regularly",
      "Review progress",
    ];

    return plan;
  }

  if (
    lower.includes("money") ||
    lower.includes("financial")
  ) {
    plan.steps = [
      "Analyze current income",
      "Analyze expenses",
      "Create a savings strategy",
      "Increase income sources",
      "Review finances every month",
    ];

    return plan;
  }

  plan.steps = [
    "Understand the goal",
    "Break it into smaller tasks",
    "Prioritize the tasks",
    "Execute step by step",
    "Review progress",
  ];

  return plan;
}