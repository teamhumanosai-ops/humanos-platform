import { Decision } from "./decision";
import { Execution } from "./execution";

export function generateExecution(
  decision: Decision
): Execution {
  return {
    id: crypto.randomUUID(),

    title: decision.title,

    action: decision.selectedAction,

    status: "pending",

    startedAt: null,

    completedAt: null,

    createdAt: new Date(),
  };
}