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
  text: string;
}