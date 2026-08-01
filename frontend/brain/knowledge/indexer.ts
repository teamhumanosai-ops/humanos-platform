import { OpenRouterEmbeddingProvider } from "@/brain/ai/embeddings/openrouter";
import { vectorStore } from "./vectorStore";

export interface KnowledgeChunk {
  id: string;
  source: string;
  content: string;
}

export class KnowledgeIndexer {
  private readonly provider = new OpenRouterEmbeddingProvider();

  async index(chunks: KnowledgeChunk[]): Promise<void> {
    console.log("");
    console.log("🧠 Human OS Knowledge Indexer");
    console.log("--------------------------------");

    vectorStore.clear();

    for (const chunk of chunks) {
      console.log(`📄 ${chunk.source} :: ${chunk.id}`);

      const result = await this.provider.embed(chunk.content);

      vectorStore.add({
        id: chunk.id,
        source: chunk.source,
        chunk: chunk.content,
        embedding: result.vector,
      });

      console.log(`✅ Embedded (${result.dimensions} dimensions)`);
    }

    console.log("");
    console.log("🎉 Indexing Complete");
    console.log(`Indexed Chunks : ${vectorStore.size()}`);
  }
}

export const knowledgeIndexer = new KnowledgeIndexer();