import { retrieveKnowledge } from "../knowledge";
import { graphQuery } from "../graph";

export async function buildKnowledgeContext(
  userMessage: string
): Promise<string> {
  const knowledge =
    await retrieveKnowledge(userMessage);

  const graphNodes =
    graphQuery.search(userMessage);

  if (graphNodes.length === 0) {
    return knowledge;
  }

  const sections: string[] = [];

  for (const node of graphNodes) {
    const subgraph =
      graphQuery.getConnectedSubgraph(node.id);

    sections.push(
      [
        `${node.label} (${node.type})`,
        ...subgraph.neighbors.map(
          (neighbor) =>
            `  • ${neighbor.label} (${neighbor.type})`
        ),
      ].join("\n")
    );
  }

  const graphContext = `Relevant Knowledge Graph Information:

${sections.join("\n\n")}`;

  if (!knowledge.trim()) {
    return graphContext;
  }

  return `${knowledge}

${graphContext}`;
}