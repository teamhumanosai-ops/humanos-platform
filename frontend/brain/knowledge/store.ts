import { KnowledgeDocument } from "./types";

const KNOWLEDGE: KnowledgeDocument[] = [];

export function addDocument(doc: KnowledgeDocument) {
  KNOWLEDGE.push(doc);
}

export function getDocuments() {
  return KNOWLEDGE;
}

export function clearKnowledge() {
  KNOWLEDGE.length = 0;
}