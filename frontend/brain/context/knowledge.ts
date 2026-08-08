import {
  retrieveKnowledgeResults,
} from "../knowledge";

import type {
  RetrievalResult,
} from "../knowledge/retrievalPipeline";

import {
  graphQuery,
} from "../graph";

export type KnowledgeContext = {
  prompt: string;

  results: RetrievalResult[];

  graphPrompt: string;
};

export async function buildKnowledgeContext(
  userMessage: string
): Promise<KnowledgeContext> {
  const results =
    await retrieveKnowledgeResults(
      userMessage
    );

  const graphNodes =
    graphQuery.search(
      userMessage
    );

  const graphSections: string[] =
    [];

  for (
    const node of graphNodes
  ) {
    const subgraph =
      graphQuery.getConnectedSubgraph(
        node.id
      );

    graphSections.push(
      [
        `${node.label} (${node.type})`,

        ...subgraph.neighbors.map(
          (neighbor) =>
            `  • ${neighbor.label} (${neighbor.type})`
        ),
      ].join("\n")
    );
  }

  const graphPrompt =
    graphSections.length > 0
      ? `Relevant Knowledge Graph Information:

${graphSections.join(
  "\n\n"
)}`
      : "";

  const knowledgePrompt =
    results.length > 0
      ? `Relevant Knowledge Base Information:

${results
  .map(
    (result) => `
Source: ${result.source}
Score: ${result.score.toFixed(6)}

${result.text}
`
  )
  .join("\n")}`
      : "";

  const prompt = [
    knowledgePrompt,
    graphPrompt,
  ]
    .filter(
      (section) =>
        section.trim().length > 0
    )
    .join("\n\n");

  return {
    prompt,

    results,

    graphPrompt,
  };
}