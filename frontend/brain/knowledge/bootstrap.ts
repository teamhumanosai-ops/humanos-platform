import { ingestDocument } from "./ingest";
import { listDocuments } from "./loader";
import { knowledgeIndexer } from "./indexer";

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

  console.log("🧠 Building Semantic Index...\n");

  await knowledgeIndexer.index();

  console.log("\n🚀 Human OS Knowledge Ready.\n");
}