import { searchKnowledge } from "./search";

export function retrieveKnowledge(question: string): string {
  console.log("🔍 retrieveKnowledge() called");
  console.log("Question:", question);

  const results = searchKnowledge(question);

  console.log("Results found:", results.length);

  if (results.length === 0) {
    console.log("❌ No knowledge found.");
    return "";
  }

  const topResults = results.slice(0, 3);

  console.log("========== KNOWLEDGE DEBUG ==========");

  for (const result of topResults) {
    console.log({
      source: result.chunk.source,
      chunk: result.chunk.id,
      score: result.score,
      index: result.chunk.index,
      preview: result.chunk.text.substring(0, 80),
    });
  }

  console.log("====================================");

  return `
Relevant Knowledge Base Information:

${topResults
  .map(
    (result) => `
Source: ${result.chunk.source}
Chunk: ${result.chunk.id}
Score: ${result.score}

${result.chunk.text}
`
  )
  .join("\n")}
`;
}