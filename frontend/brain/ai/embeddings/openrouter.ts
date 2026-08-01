import { BaseEmbeddingProvider } from "./provider";
import {
  EmbeddingResult,
  EmbeddingOptions,
} from "./types";

export class OpenRouterEmbeddingProvider
  extends BaseEmbeddingProvider
{
  async embed(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult> {
    throw new Error(
      "Embedding provider not implemented yet."
    );
  }
}