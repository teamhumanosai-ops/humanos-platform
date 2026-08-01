export type EmbeddingVector = number[];

export interface EmbeddingResult {
  vector: EmbeddingVector;
  dimensions: number;
  model: string;
}

export interface EmbeddingOptions {
  model?: string;
}

export interface EmbeddingProvider {
  embed(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult>;
}