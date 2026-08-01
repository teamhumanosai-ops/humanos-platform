import { OpenRouterEmbeddingProvider } from "./openrouter";

async function main() {
  console.log("🧠 Human OS Embedding Test");
  console.log("-------------------------");

  try {
    const provider = new OpenRouterEmbeddingProvider();

    const started = Date.now();

    const result = await provider.embed(
      "What is Human OS?"
    );

    const elapsed = Date.now() - started;

    console.log("✅ Embedding generated successfully!");
    console.log("");

    console.log("Provider:", provider.name);
    console.log("Model:", result.model);
    console.log("Dimensions:", result.dimensions);
    console.log("Time:", `${elapsed} ms`);
    console.log("");

    console.log("Vector Preview:");
    console.log(result.vector.slice(0, 10));
  } catch (error) {
    console.error("");
    console.error("❌ Embedding generation failed.");
    console.error(error);
  }
}

main();