import type {
  ActionRouteTarget,
} from "./types";

import type {
  RuntimeServices,
} from "../runtime/runtimeServices";

import {
  getActionTool,
} from "./toolCapabilities";

import type {
  ExternalIntegration,
} from "./integrationContracts";

import {
  integrationMetadata,
  normalizeExternalIntegrations,
} from "./integrationContracts";

import {
  executeWithIntegrationSafety,
} from "./integrationExecution";

export type ActionCapabilityTarget = Exclude<
  ActionRouteTarget,
  "unresolved"
>;

export type ActionCapability = {
  target:
    ActionCapabilityTarget;

  integrations:
    readonly ExternalIntegration[];

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

function normalizeCapabilityResult(
  target: ActionCapabilityTarget,
  result: ActionCapabilityResult,
  integrations: readonly ExternalIntegration[]
): ActionCapabilityResult {
  const summary =
    result.summary.trim();

  if (!summary) {
    throw new Error(
      `Action capability "${target}" returned an empty execution result.`
    );
  }

  const normalizedIntegrations =
    normalizeExternalIntegrations(
      integrations
    );

  return {
    summary,
    metadata: {
      ...(result.metadata ?? {}),
      capabilityTarget:
        target,
      ...integrationMetadata(
        normalizedIntegrations
      ),
    },
  };
}

function extractUrl(
  action: string
): string | null {
  const match =
    action.match(
      /https?:\/\/[^\s<>\"]+/i
    );

  if (!match?.[0]) {
    return null;
  }

  return match[0].replace(
    /[),.;!?]+$/,
    ""
  );
}

const webSearchCapability:
  ActionCapability = {
  target:
    "web-search",

  integrations: [
    {
      provider:
        "tavily",
      operation:
        "search",
    },
    {
      provider:
        "firecrawl",
      operation:
        "search",
    },
  ],

  async execute(
    action,
    services
  ) {
    const result =
      await services.searchWeb(
        action
      );

    return normalizeCapabilityResult(
      "web-search",
      {
        summary:
          result.answer,
        metadata: {
          query:
            result.query,
          searchedAt:
            result.searchedAt,
          providers:
            result.provenance?.observedProviders.join(",") ??
            "",
          requiredProviders:
            result.provenance?.requiredProviders.join(",") ??
            "",
          dualProviderResultCount:
            String(
              result.provenance?.dualProviderResultCount ??
              0
            ),
          dualProviderCoverage:
            String(
              result.provenance?.dualProviderCoverage ??
              0
            ),
        },
      },
      webSearchCapability.integrations
    );
  },
};

const webContentCapability:
  ActionCapability = {
  target:
    "web-content",

  integrations: [
    {
      provider:
        "firecrawl",
      operation:
        "fetch",
    },
  ],

  async execute(
    action,
    services
  ) {
    const url =
      extractUrl(
        action
      );

    if (!url) {
      throw new Error(
        "Web content execution requires an explicit HTTP or HTTPS URL in the action."
      );
    }

    const result =
      await services.fetchWebContentViaFirecrawl(
        url
      );

    const content =
      result.text.trim();

    if (!content) {
      throw new Error(
        "Web content execution returned no readable content."
      );
    }

    return normalizeCapabilityResult(
      "web-content",
      {
        summary:
          [
            `Title: ${result.title}`,
            `URL: ${result.url}`,
            `Status: ${result.status}`,
            `Content-Type: ${result.contentType || "unknown"}`,
            "Content:",
            content,
          ].join("\n"),

        metadata: {
          url:
            result.url,
          title:
            result.title,
          status:
            String(result.status),
          contentType:
            result.contentType,
          fetchedAt:
            result.fetchedAt,
          provider:
            "firecrawl",
        },
      },
      webContentCapability.integrations
    );
  },
};

const cognitiveCapability:
  ActionCapability = {
  target:
    "cognitive",

  integrations: [
    {
      provider:
        "gemini",
      operation:
        "cognitive-action",
    },
    {
      provider:
        "openrouter",
      operation:
        "cognitive-action",
    },
  ],

  async execute(
    action,
    services
  ) {
    const normalizedAction =
      action.trim();

    if (!normalizedAction) {
      throw new Error(
        "Cognitive action execution requires a non-empty action."
      );
    }

    const result =
      await services.aiService(
        [
          "HUMAN OS ACTION EXECUTION MODE.",
          "Execute the requested cognitive action as a real provider-backed operation.",
          "Return a concise, useful result of the requested action.",
          "Do not describe the action as merely acknowledged or simulated.",
        ].join("\n"),
        [
          {
            role:
              "user",
            message:
              normalizedAction,
          },
        ]
      );

    const summary =
      result.trim();

    if (!summary) {
      throw new Error(
        "Cognitive action execution returned an empty provider result."
      );
    }

    return normalizeCapabilityResult(
      "cognitive",
      {
        summary,
        metadata: {
          executionType:
            "cognitive-ai",
          providerBoundary:
            "aiService",
          action:
            normalizedAction,
        },
      },
      cognitiveCapability.integrations
    );
  },
};

const toolCapability:
  ActionCapability = {
  target:
    "tool",

  integrations: [],

  async execute(
    action,
    services
  ) {
    const normalizedAction =
      action.trim();

    const explicitPrefix =
      normalizedAction
        .toLowerCase()
        .startsWith("tool:");

    const toolPayload =
      explicitPrefix
        ? normalizedAction.slice(5).trim()
        : normalizedAction;

    const separator =
      toolPayload.indexOf(":");

    if (separator <= 0) {
      throw new Error(
        "Tool execution requires an explicit registered tool id followed by ':'."
      );
    }

    const toolId =
      toolPayload
        .slice(0, separator)
        .trim();

    const toolAction =
      toolPayload
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

    if (
      tool.integration?.isConfigured &&
      !tool.integration.isConfigured()
    ) {
      throw new Error(
        `External integration "${tool.integration.provider}" is not configured for action tool "${toolId}".`
      );
    }

    const toolIntegrations =
      tool.integration
        ? [
            {
              provider:
                tool.integration.provider,
              operation:
                tool.integration.operation,
            },
          ]
        : [];

    const executionKey =
      [
        toolId,
        tool.integration?.provider ??
          "internal",
        tool.integration?.operation ??
          "execute",
        toolAction,
      ].join("|");

    const result =
      await executeWithIntegrationSafety(
        executionKey,
        tool.integration?.executionPolicy ??
          "allow-duplicate",
        () =>
          tool.execute(
            toolAction,
            services
          )
      );

    return normalizeCapabilityResult(
      "tool",
      {
        ...result,
        metadata: {
          ...(result.metadata ?? {}),
          executionType:
            "registered-tool",
          toolId,
          toolAction,
          integrationConfigured:
            tool.integration?.isConfigured?.() ===
            false
              ? "false"
              : "true",
          executionPolicy:
            tool.integration?.executionPolicy ??
            "allow-duplicate",
        },
      },
      toolIntegrations
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
    "web-content",
    webContentCapability,
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
