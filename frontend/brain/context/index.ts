import { buildMemoryPrompt } from "../memory";

export function buildContext(): string {
  return `
${buildMemoryPrompt()}

Human OS has access to its own Knowledge Base.

If relevant information exists in the Knowledge Base, prefer using it before relying on general model knowledge.
`;
}