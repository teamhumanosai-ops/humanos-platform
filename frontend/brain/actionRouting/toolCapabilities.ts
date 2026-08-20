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

  /**
   * Optional external integration identity. The executor remains the
   * canonical real-execution owner; this metadata makes provider provenance
   * explicit without introducing a second integration registry.
   */
  integration?: {
    provider: string;
    operation: string;
    isConfigured?: () => boolean;
  };
};

const registeredTools =
  new Map<string, RegisteredTool>();

function normalizeToolId(
  id: string
): string {
  return id.trim();
}

function normalizeIntegrationMetadata(
  id: string,
  integration: RegisteredTool["integration"]
): RegisteredTool["integration"] {
  if (!integration) {
    return undefined;
  }

  const provider = integration.provider.trim();
  const operation = integration.operation.trim();

  if (!provider) {
    throw new Error(
      `Action tool "${id}" integration metadata requires a provider.`
    );
  }

  if (!operation) {
    throw new Error(
      `Action tool "${id}" integration metadata requires an operation.`
    );
  }

  if (
    integration.isConfigured !== undefined &&
    typeof integration.isConfigured !== "function"
  ) {
    throw new Error(
      `Action tool "${id}" integration metadata requires a callable configuration check.`
    );
  }

  return {
    provider,
    operation,
    isConfigured:
      integration.isConfigured,
  };
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
      integration:
        normalizeIntegrationMetadata(
          id,
          tool.integration
        ),
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

export function getExternalActionTools():
  readonly RegisteredTool[] {
  return getActionTools().filter(
    (tool) =>
      Boolean(tool.integration)
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

export function hasExternalActionTool(
  id: string
): boolean {
  return Boolean(
    getActionTool(id)?.integration
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
