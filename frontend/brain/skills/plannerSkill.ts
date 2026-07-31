import { planner } from "../planner";

export function plannerSkill(message: string): string | null {
  const lower = message.toLowerCase();

  if (
    lower.startsWith("plan ") ||
    lower.startsWith("help me") ||
    lower.includes("roadmap") ||
    lower.includes("strategy")
  ) {
    const plan = planner(message);

    return `
Goal:
${plan.goal}

Steps:

${plan.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;
  }

  return null;
}