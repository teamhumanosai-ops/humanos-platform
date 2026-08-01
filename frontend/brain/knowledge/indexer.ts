import { OpenRouterEmbeddingProvider } from "@/brain/ai/embeddings/openrouter";
import { vectorStore } from "./vectorStore";
import { getDocuments } from "./store";

export class KnowledgeIndexer {
  private readonly provider =
    new OpenRouterEmbeddingProvider();

  async index(): Promise<void> {
    console.log("");
    console.log("🧠 Building Semantic Index...");
    console.log("");

    vectorStore.clear();

    const documents = getDocuments();

    for (const document of documents) {
      for (const chunk of document.chunks) {
        console.log(
          `Embedding ${document.source} :: ${chunk.id}`
        );

        const embedding =
          await this.provider.embed(chunk.text);

        vectorStore.add({
          id: chunk.id,
          source: document.source,
          chunk: chunk.text,
          embedding: embedding.vector,
        });
      }
    }

    console.log("");
    console.log(
      `✅ Semantic Index Ready (${vectorStore.size()} chunks)`
    );
  }
}

export const knowledgeIndexer =
  new KnowledgeIndexer();