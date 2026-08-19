import type {
  RuntimeServices,
} from "../runtime/runtimeServices";

export type RegisteredTool = {
  id: string;

  execute: (
    action: string,
    services: RuntimeServices
  ) => Promise<{
    summary: string;
    metadata?: Record<string, string>;
  }>;
};

const registeredTools =
  new Map<string, RegisteredTool>();

export function registerActionTool(
  tool: RegisteredTool
): void {
  const id =
    tool.id.trim();

  if (!id) {
    throw new Error(
      "Action tool registration requires a non-empty id."
    );
  }

  if (
    registeredTools.has(id)
  ) {
    throw new Error(
      `Action tool "${id}" is already registered.`
    );
  }

  registeredTools.set(
    id,
    tool
  );
}

export function getActionTool(
  id: string
): RegisteredTool | null {
  return (
    registeredTools.get(
      id
    ) ?? null
  );
}

export function hasActionTool(
  id: string
): boolean {
  return (
    getActionTool(id) !==
    null
  );
}

export function clearActionTools(): void {
  registeredTools.clear();
}
