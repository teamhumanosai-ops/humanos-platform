import { KnowledgeChunk } from "./types";

export function splitIntoChunks(text: string): KnowledgeChunk[] {
  const cleaned = text.trim();

  if (!cleaned) {
    return [];
  }

  const parts = cleaned.split(/\n\s*\n/);

  return parts.map((part, index) => ({
    id: `chunk-${index + 1}`,
    documentId: "",
    text: part.trim(),
  }));
}