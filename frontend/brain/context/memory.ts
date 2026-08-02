import { buildMemoryPrompt } from "../memory";

export function buildMemoryContext(): string {
  return buildMemoryPrompt();
}