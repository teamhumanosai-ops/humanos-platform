import { retrieveKnowledge } from "../knowledge";

export async function buildKnowledgeContext(
  userMessage: string
): Promise<string> {
  return await retrieveKnowledge(userMessage);
}