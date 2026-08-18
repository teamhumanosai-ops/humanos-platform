import { Decision } from "./decision";
import { Execution } from "./execution";
import type { ActionRoute } from "./actionRouting";

export function generateExecution(
  decision: Decision,
  planId: string,
  route: ActionRoute | null = null
): Execution {
  return {
    id: crypto.randomUUID(),

    planId,

    title: decision.title,

    action: decision.selectedAction,

    route,

    status: "pending",

    startedAt: null,

    completedAt: null,

    createdAt: new Date(),
  };
}