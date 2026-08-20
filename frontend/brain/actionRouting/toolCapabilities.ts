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

function normalizeToolId(
  id: string
): string {
  return id.trim();
}

export function registerActionTool(
  tool: RegisteredTool
): void {
  const id =
    normalizeToolId(
      tool.id
    );

  if (!id) {
    throw new Error(
      "Action tool registration requires a non-empty id."
    );
  }

  if (
    typeof tool.execute !==
    "function"
  ) {
    throw new Error(
      `Action tool "${id}" must provide an executable function.`
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
    {
      ...tool,
      id,
    }
  );
}

export function getActionTool(
  id: string
): RegisteredTool | null {
  return (
    registeredTools.get(
      normalizeToolId(id)
    ) ?? null
  );
}

export function getActionTools():
  readonly RegisteredTool[] {
  return Array.from(
    registeredTools.values()
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

/**
 * Remove one explicitly registered tool.
 *
 * Removal only affects future capability resolution. Existing execution
 * artifacts retain their recorded tool provenance and results.
 */
export function unregisterActionTool(
  id: string
): boolean {
  return registeredTools.delete(
    normalizeToolId(id)
  );
}

export function clearActionTools(): void {
  registeredTools.clear();
}
