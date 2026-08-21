import {
  RetrievalPipeline,
} from "./retrievalPipeline";

const pipeline =
  new RetrievalPipeline();

pipeline
  .execute("   ")
  .then((results) => {
    if (results.length !== 0) {
      throw new Error(
        "Hybrid retrieval regression: blank queries must return no results."
      );
    }

    console.log(
      "Hybrid retrieval boundary regression verification passed."
    );
  })
  .catch((error) => {
    throw error;
  });
