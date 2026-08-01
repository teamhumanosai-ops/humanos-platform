import { buildMemoryPrompt } from "../memory";
import { retrieveKnowledge } from "../knowledge";

export function buildContext(userMessage: string): string {
  const memory = buildMemoryPrompt();

  const knowledge = retrieveKnowledge(userMessage);

  return `
${memory}

${knowledge}

Human OS has access to its own Knowledge Base.

If relevant information exists in the Knowledge Base,
prefer using it instead of relying on general model knowledge.

If no relevant knowledge exists,
answer normally.
`;
}