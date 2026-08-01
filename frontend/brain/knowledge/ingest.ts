import { loadDocument } from "./loader";
import { splitIntoChunks } from "./parser";
import { addDocument } from "./store";

export async function ingestDocument(
  filename: string
): Promise<void> {
  const text = await loadDocument(filename);

  const chunks = splitIntoChunks(text);

  addDocument({
    id: filename,
    title: filename,
    source: filename,
    createdAt: new Date().toISOString(),

    chunks: chunks.map((chunk, index) => ({
      ...chunk,
      documentId: filename,
      source: filename,
      index,
    })),
  });
}