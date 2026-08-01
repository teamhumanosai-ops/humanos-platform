export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  createdAt: string;
  chunks: KnowledgeChunk[];
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;

  // Which file did this come from?
  source: string;

  // Position inside the document
  index: number;

  // Chunk text
  text: string;
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}