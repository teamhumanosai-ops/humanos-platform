import { BaseEmbeddingProvider } from "./provider";
import {
  EmbeddingResult,
  EmbeddingOptions,
} from "./types";

export class OpenRouterEmbeddingProvider extends BaseEmbeddingProvider {
  readonly id = "openrouter";

  readonly type = "embedding" as const;

  readonly name = "OpenRouter";

  async embed(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing.");
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/embeddings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:
            options?.model ??
            "openai/text-embedding-3-small",
          input: text,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `OpenRouter Embedding Error: ${error}`
      );
    }

    const json = await response.json();

    const vector = json.data?.[0]?.embedding;

    if (!Array.isArray(vector)) {
      throw new Error(
        "Invalid embedding response from OpenRouter."
      );
    }

    return {
      vector,
      dimensions: vector.length,
      model:
        options?.model ??
        "openai/text-embedding-3-small",
    };
  }
}