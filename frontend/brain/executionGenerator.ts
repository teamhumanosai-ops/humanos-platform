import { Decision } from "./decision";
import { Execution } from "./execution";

export function generateExecution(
  decision: Decision,
  planId: string
): Execution {
  return {
    id: crypto.randomUUID(),

    planId,

    title: decision.title,

    action: decision.selectedAction,

    status: "pending",

    startedAt: null,

    completedAt: null,

    createdAt: new Date(),
  };
}