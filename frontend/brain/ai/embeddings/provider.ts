import {
  EmbeddingProvider,
  EmbeddingResult,
  EmbeddingOptions,
} from "./types";

export abstract class BaseEmbeddingProvider
  implements EmbeddingProvider
{
  abstract embed(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult>;
}