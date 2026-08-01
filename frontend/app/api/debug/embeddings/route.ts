import { NextResponse } from "next/server";
import { OpenRouterEmbeddingProvider } from "@/brain/ai/embeddings/openrouter";

export async function GET() {
  try {
    const provider = new OpenRouterEmbeddingProvider();

    const started = Date.now();

    const result = await provider.embed(
      "What is Human OS?"
    );

    const elapsed = Date.now() - started;

    return NextResponse.json({
      success: true,
      provider: provider.name,
      model: result.model,
      dimensions: result.dimensions,
      duration: `${elapsed} ms`,
      preview: result.vector.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}