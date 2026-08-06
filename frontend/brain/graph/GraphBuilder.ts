import { graphStore } from "./GraphStore";
import { GraphEdge, GraphNode, GraphNodeType } from "./types";

function now(): string {
  return new Date().toISOString();
}

function createNode(
  id: string,
  type: GraphNodeType,
  label: string,
  properties: Record<string, unknown> = {}
): GraphNode {
  return {
    id,
    type,
    label,
    properties,
    createdAt: now(),
    updatedAt: now(),
  };
}

function createEdge(
  from: string,
  to: string,
  type: GraphEdge["type"],
  weight = 1,
  properties: Record<string, unknown> = {}
): GraphEdge {
  return {
    id: `${from}:${type}:${to}`,
    from,
    to,
    type,
    weight,
    properties,
    createdAt: now(),
  };
}

export class GraphBuilder {
  addMemory(
    id: string,
    label: string,
    properties: Record<string, unknown> = {}
  ): GraphNode {
    const node = createNode(id, "memory", label, properties);

    if (!graphStore.hasNode(id)) {
      graphStore.addNode(node);
    }

    return node;
  }

  addTimelineEvent(
    id: string,
    label: string,
    properties: Record<string, unknown> = {}
  ): GraphNode {
    const node = createNode(id, "timeline", label, properties);

    if (!graphStore.hasNode(id)) {
      graphStore.addNode(node);
    }

    return node;
  }

  addKnowledge(
    id: string,
    label: string,
    properties: Record<string, unknown> = {}
  ): GraphNode {
    const node = createNode(id, "knowledge", label, properties);

    if (!graphStore.hasNode(id)) {
      graphStore.addNode(node);
    }

    return node;
  }

  addEntity(
    id: string,
    label: string,
    properties: Record<string, unknown> = {}
  ): GraphNode {
    const node = createNode(id, "entity", label, properties);

    if (!graphStore.hasNode(id)) {
      graphStore.addNode(node);
    }

    return node;
  }

  connect(
    from: string,
    to: string,
    type: GraphEdge["type"] = "related_to",
    weight = 1
  ): void {
    const edgeId = `${from}:${type}:${to}`;

    if (graphStore.hasEdge(edgeId)) {
      return;
    }

    graphStore.addEdge(
      createEdge(from, to, type, weight)
    );
  }
}

export const graphBuilder = new GraphBuilder();