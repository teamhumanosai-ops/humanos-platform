import { BrainState } from "../../brainState";
import { buildContext } from "../../context";
import { graphQuery } from "../../graph";
import { Intent } from "../../intent";
import { BaseStage } from "./baseStage";

const REASONING_RELATIONSHIP_TYPES = new Set([
  "uses",
  "built_with",
  "depends_on",
  "based_on",
  "created_by",
  "works_with",
  "integrates_with",
  "part_of",
  "belongs_to",
]);

function buildReasoningGraphContext(
  userMessage: string
): string {
  const matchedNodes =
    graphQuery.search(
      userMessage
    );

  if (matchedNodes.length === 0) {
    return "";
  }

  const sections = new Set<string>();

  for (const node of matchedNodes) {
    const relationships =
      graphQuery.getRelationships(
        node.id
      );

    for (const relationship of relationships) {
      if (
        !REASONING_RELATIONSHIP_TYPES.has(
          relationship.type
        )
      ) {
        continue;
      }

      const fromNode =
        graphQuery.getNode(
          relationship.from
        );

      const toNode =
        graphQuery.getNode(
          relationship.to
        );

      if (!fromNode || !toNode) {
        continue;
      }

      sections.add(
        `• ${fromNode.label} ${relationship.type.replace(
          /_/g,
          " "
        )} ${toNode.label}`
      );
    }
  }

  if (sections.size === 0) {
    return "";
  }

  return `Relevant Reasoning Graph Relationships:

${[...sections].join("\n")}`;
}

/**
 * ContextStage
 *
 * Builds the runtime context consumed by
 * the response stage.
 *
 * Responsibilities:
 * - Build the existing Human OS context
 * - Add reasoning-aware graph relationships
 * - Preserve local skill responses
 * - Apply intent-specific guidance
 */
export class ContextStage extends BaseStage {
  readonly name = "Context";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (state.response) {
      return state;
    }

    let context =
      await buildContext(
        state.userMessage
      );

    const reasoningGraphContext =
      buildReasoningGraphContext(
        state.userMessage
      );

    if (reasoningGraphContext) {
      context += `\n\n${reasoningGraphContext}`;
    }

    switch (state.intent) {
      case Intent.STARTUP_PLANNING:
        context +=
          "\n\nThe user wants startup advice. Think like an experienced startup founder and advisor.";
        break;

      case Intent.LIVE_SEARCH:
        context +=
          "\n\nThe user needs current information. Use live search when appropriate.";
        break;

      default:
        break;
    }

    state.context =
      context;

    return state;
  }
}