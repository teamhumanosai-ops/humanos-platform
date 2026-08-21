import { searchKnowledge } from "./search";
import { semanticSearch } from "./semanticSearch";

export interface RetrievalResult {
  source: string;
  text: string;
  score: number;
}

const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 20;
const RRF_K = 60;

function normalizeTopK(
  topK: number
): number {
  if (!Number.isFinite(topK)) {
    return DEFAULT_TOP_K;
  }

  return Math.min(
    MAX_TOP_K,
    Math.max(1, Math.floor(topK))
  );
}

function addRankedResult(
  fused: Map<string, RetrievalResult>,
  source: string,
  text: string,
  rank: number
): void {
  const score =
    1 / (RRF_K + rank);

  const existing =
    fused.get(text);

  if (existing) {
    existing.score += score;
    return;
  }

  fused.set(text, {
    source,
    text,
    score,
  });
}

export class RetrievalPipeline {
  async execute(
    query: string,
    topK: number = DEFAULT_TOP_K
  ): Promise<RetrievalResult[]> {
    const normalizedQuery =
      query.trim();

    if (!normalizedQuery) {
      return [];
    }

    const limit =
      normalizeTopK(topK);

    const keyword =
      searchKnowledge(
        normalizedQuery
      );

    let semantic: Awaited<
      ReturnType<typeof semanticSearch>
    > = [];

    try {
      semantic =
        await semanticSearch(
          normalizedQuery,
          limit
        );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.warn(
        `[Retrieval] Semantic retrieval unavailable; using keyword results: ${message}`
      );
    }

    const fused =
      new Map<
        string,
        RetrievalResult
      >();

    keyword
      .slice(0, limit)
      .forEach((item, index) => {
        addRankedResult(
          fused,
          item.chunk.source,
          item.chunk.text,
          index + 1
        );
      });

    semantic
      .slice(0, limit)
      .forEach((item, index) => {
        addRankedResult(
          fused,
          item.source,
          item.chunk,
          index + 1
        );
      });

    return [...fused.values()]
      .sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        }

        return `${a.source}\n${a.text}`.localeCompare(
          `${b.source}\n${b.text}`
        );
      })
      .slice(0, limit);
  }
}

export const retrievalPipeline =
  new RetrievalPipeline();
