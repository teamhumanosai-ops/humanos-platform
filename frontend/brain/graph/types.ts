export type GraphNodeType =
  | "memory"
  | "timeline"
  | "profile"
  | "knowledge"
  | "entity";

export type GraphEdgeType =
  | "related_to"
  | "references"
  | "belongs_to"
  | "mentions"
  | "derived_from";

export interface GraphNode {
  id: string;

  type: GraphNodeType;

  label: string;

  properties: Record<string, unknown>;

  createdAt: string;

  updatedAt: string;
}

export interface GraphEdge {
  id: string;

  from: string;

  to: string;

  type: GraphEdgeType;

  weight: number;

  properties: Record<string, unknown>;

  createdAt: string;
}

export interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;

  edges: Map<string, GraphEdge>;
}