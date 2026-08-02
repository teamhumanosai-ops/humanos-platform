import { buildMemoryPrompt } from "../memory";

export async function buildMemoryContext(): Promise<string> {
  return await buildMemoryPrompt();
}