import { retrievalPipeline } from "@/brain/knowledge/retrievalPipeline";

export interface EvaluationCase {
  name: string;
  query: string;
  expected: string;
}

export class RetrievalEvaluator {
  async evaluate(
    test: EvaluationCase
  ): Promise<void> {
    console.log("");
    console.log("==================================");
    console.log("🧪 Human OS Retrieval Evaluation");
    console.log("==================================");

    console.log("Test:", test.name);
    console.log("Query:", test.query);

    const started = Date.now();

    const results = await retrievalPipeline.execute(
      test.query,
      5
    );

    const elapsed = Date.now() - started;

    const passed = results.some((result) =>
      result.text
        .toLowerCase()
        .includes(test.expected.toLowerCase())
    );

    console.log("");
    console.log("Retrieved:", results.length);
    console.log("Latency:", `${elapsed} ms`);
    console.log("Result:", passed ? "✅ PASS" : "❌ FAIL");

    console.log("");
    console.log("Top Results:");

    results.forEach((result, index) => {
      console.log(
        `${index + 1}. ${result.source} (${result.score.toFixed(
          6
        )})`
      );
    });

    console.log("==================================");
    console.log("");
  }
}

export const retrievalEvaluator =
  new RetrievalEvaluator();