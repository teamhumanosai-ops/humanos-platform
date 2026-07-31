import { searchKnowledge } from "./search";

export function retrieveKnowledge(
  question: string
): string {
  const results = searchKnowledge(question);

  if (results.length === 0) {
    return "";
  }

  return `
Relevant Knowledge Base Information:

${results
  .map((chunk) => `- ${chunk.text}`)
  .join("\n\n")}
`;
}