import type {
  RuntimeServices,
} from "../runtime/runtimeServices";

export type ActionCapabilityTarget =
  | "web-search"
  | "cognitive";

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
