import { searchKnowledge } from "./search";
import { semanticSearch } from "./semanticSearch";

export interface RetrievalResult {
  source: string;
  text: string;
  score: number;
}

export class RetrievalPipeline {
  async execute(
    query: string,
    topK: number = 5
  ): Promise<RetrievalResult[]> {
    console.log("");
    console.log("🧠 Human OS Hybrid Retrieval");
    console.log("----------------------------");

    const keyword = searchKnowledge(query);

    const semantic = await semanticSearch(query, topK);

    const fused = new Map<string, RetrievalResult>();

    const K = 60;

    keyword.forEach((item, index) => {
      const key = item.chunk.text;

      fused.set(key, {
        source: item.chunk.source,
        text: item.chunk.text,
        score: 1 / (K + index + 1),
      });
    });

    semantic.forEach((item, index) => {
      const key = item.chunk;

      const score = 1 / (K + index + 1);

      const existing = fused.get(key);

      if (existing) {
        existing.score += score;
      } else {
        fused.set(key, {
          source: item.source,
          text: item.chunk,
          score,
        });
      }
    });

    return [...fused.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export const retrievalPipeline =
  new RetrievalPipeline();