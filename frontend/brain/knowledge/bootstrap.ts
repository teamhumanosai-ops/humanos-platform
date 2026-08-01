import { ingestDocument } from "./ingest";
import { listDocuments } from "./loader";

let initialized = false;

export async function initializeKnowledge() {
  if (initialized) {
    return;
  }

  initialized = true;

  const files = await listDocuments();

  console.log("\n📚 Initializing Knowledge Library...\n");

  for (const file of files) {
    console.log(`Loading ${file}`);

    await ingestDocument(file);
  }

  console.log(
    `\n✅ Loaded ${files.length} knowledge document(s).\n`
  );
}