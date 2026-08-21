import { OpenRouterEmbeddingProvider } from "@/brain/ai/embeddings/openrouter";
import { vectorStore } from "./vectorStore";
import { cosineSimilarity } from "./cosineSimilarity";

export interface SemanticSearchResult {
  id: string;
  source: string;
  chunk: string;
  score: number;
}

export async function semanticSearch(
  query: string,
  topK: number = 3
): Promise<SemanticSearchResult[]> {
  const normalizedQuery =
    query.trim();

  if (
    !normalizedQuery ||
    vectorStore.isEmpty()
  ) {
    return [];
  }

  const limit =
    Number.isFinite(topK)
      ? Math.max(
          1,
          Math.floor(topK)
        )
      : 3;

  const provider =
    new OpenRouterEmbeddingProvider();

  console.log("");
  console.log("🧠 Human OS Semantic Search");
  console.log("--------------------------");
  console.log(
    "Query:",
    normalizedQuery
  );

  const queryEmbedding =
    await provider.embed(
      normalizedQuery
    );

  const results =
    vectorStore
      .getAll()
      .map((document) => ({
        id:
          document.id,
        source:
          document.source,
        chunk:
          document.chunk,
        score:
          cosineSimilarity(
            queryEmbedding.vector,
            document.embedding
          ),
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, limit);

  console.log("");
  console.log(
    `Results: ${results.length}`
  );

  results.forEach(
    (result, index) => {
      console.log(
        `${index + 1}. ${result.source} (${result.score.toFixed(4)})`
      );
    }
  );

  return results;
}
