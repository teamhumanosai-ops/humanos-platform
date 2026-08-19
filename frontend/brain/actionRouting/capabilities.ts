import type {
  RuntimeServices,
} from "../runtime/runtimeServices";

import {
  getActionTool,
} from "./toolCapabilities";

export type ActionCapabilityTarget =
  | "web-search"
  | "cognitive"
  | "tool";

export type ActionCapability = {
  target:
    ActionCapabilityTarget;

  execute: (
    action: string,
    services: RuntimeServices
  ) => Promise<ActionCapabilityResult>;
};

export type ActionCapabilityResult = {
  summary: string;

  metadata?:
    Record<string, string>;
};

const webSearchCapability:
  ActionCapability = {
  target:
    "web-search",

  async execute(
    action,
    services
  ) {
    const result =
      await services.searchWeb(
        action
      );

    return {
      summary:
        [
          result.answer,
          `Evidence count: ${result.results.length}`,
          `Search time: ${result.searchedAt}`,
        ]
          .filter(Boolean)
          .join("\n"),

      metadata: {
        query:
          result.query,
        searchedAt:
          result.searchedAt,
      },
    };
  },
};

const cognitiveCapability:
  ActionCapability = {
  target:
    "cognitive",

  async execute(
    action
  ) {
    return {
      summary:
        `Cognitive action acknowledged: ${action}`,
    };
  },
};

const toolCapability:
  ActionCapability = {
  target:
    "tool",

  async execute(
    action,
    services
  ) {
    const separator =
      action.indexOf(":");

    if (separator <= 0) {
      throw new Error(
        "Tool execution requires an explicit registered tool id followed by ':'."
      );
    }

    const toolId =
      action
        .slice(0, separator)
        .trim();

    const toolAction =
      action
        .slice(separator + 1)
        .trim();

    const tool =
      getActionTool(
        toolId
      );

    if (!tool) {
      throw new Error(
        `No registered action tool exists for "${toolId}".`
      );
    }

    if (!toolAction) {
      throw new Error(
        `Registered action tool "${toolId}" requires an action.`
      );
    }

    return tool.execute(
      toolAction,
      services
    );
  },
};

const capabilities: ReadonlyMap<
  ActionCapabilityTarget,
  ActionCapability
> = new Map([
  [
    "web-search",
    webSearchCapability,
  ],
  [
    "cognitive",
    cognitiveCapability,
  ],
  [
    "tool",
    toolCapability,
  ],
]);

export function getActionCapability(
  target: string
): ActionCapability | null {
  return (
    capabilities.get(
      target as ActionCapabilityTarget
    ) ?? null
  );
}

export function hasActionCapability(
  target: string
): boolean {
  return (
    getActionCapability(target) !==
    null
  );
}
