import {
  retrievalPipeline,
  RetrievalResult,
} from "./retrievalPipeline";

export async function retrieveKnowledgeResults(
  question: string
): Promise<RetrievalResult[]> {
  console.log(
    "🔍 retrieveKnowledgeResults() called"
  );

  console.log(
    "Question:",
    question
  );

  const results =
    await retrievalPipeline.execute(
      question
    );

  console.log(
    "Results found:",
    results.length
  );

  if (
    results.length === 0
  ) {
    console.log(
      "❌ No knowledge found."
    );

    return [];
  }

  console.log(
    "========== KNOWLEDGE DEBUG =========="
  );

  results.forEach(
    (result, index) => {
      console.log({
        index: index + 1,

        source:
          result.source,

        score:
          result.score.toFixed(
            6
          ),

        preview:
          result.text.substring(
            0,
            80
          ),
      });
    }
  );

  console.log(
    "===================================="
  );

  return results;
}

/**
 * Backward-compatible formatted
 * knowledge context.
 *
 * Existing callers that need a prompt
 * string can continue using this API.
 *
 * New runtime code should prefer
 * retrieveKnowledgeResults().
 */
export async function retrieveKnowledge(
  question: string
): Promise<string> {
  const results =
    await retrieveKnowledgeResults(
      question
    );

  if (
    results.length === 0
  ) {
    return "";
  }

  return `
Relevant Knowledge Base Information:

${results
  .map(
    (result) => `
Source: ${result.source}
Score: ${result.score.toFixed(6)}

${result.text}
`
  )
  .join("\n")}
`;
}