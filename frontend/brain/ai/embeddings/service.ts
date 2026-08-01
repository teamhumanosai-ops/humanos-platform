import { EmbeddingProvider } from "./types";

export class EmbeddingService {
  constructor(
    private readonly provider: EmbeddingProvider
  ) {}

  embed(text: string) {
    return this.provider.embed(text);
  }
}