import {
  VectorStore,
} from "./vectorStore";

const store =
  new VectorStore();

store.add({
  id: "chunk-1",
  source: "test.md",
  chunk: "Human OS retrieval",
  embedding: [1, 0, 0],
});

let duplicateRejected = false;

try {
  store.add({
    id: "chunk-1",
    source: "test.md",
    chunk: "Duplicate",
    embedding: [1, 0, 0],
  });
} catch {
  duplicateRejected = true;
}

if (!duplicateRejected) {
  throw new Error(
    "Vector store regression: duplicate ids must be rejected."
  );
}

let dimensionRejected = false;

try {
  store.add({
    id: "chunk-2",
    source: "test.md",
    chunk: "Wrong dimension",
    embedding: [1, 0],
  });
} catch {
  dimensionRejected = true;
}

if (!dimensionRejected) {
  throw new Error(
    "Vector store regression: embedding dimension drift must be rejected."
  );
}

console.log(
  "Vector store integrity regression verification passed."
);
