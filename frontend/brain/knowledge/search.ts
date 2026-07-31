import { getDocuments } from "./store";
import { KnowledgeChunk } from "./types";

export function searchKnowledge(query: string): KnowledgeChunk[] {
  const lower = query.toLowerCase();

  const results: KnowledgeChunk[] = [];

  for (const doc of getDocuments()) {
    for (const chunk of doc.chunks) {
      if (chunk.text.toLowerCase().includes(lower)) {
        results.push(chunk);
      }
    }
  }

  return results;
}