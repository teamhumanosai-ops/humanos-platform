import { ingestDocument } from "./ingest";

let initialized = false;

export async function initializeKnowledge() {
  if (initialized) {
    return;
  }

  initialized = true;

  await ingestDocument("humanos.txt");
}