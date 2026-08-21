export interface VectorDocument {
  id: string;
  source: string;
  chunk: string;
  embedding: number[];
}

function validateVectorDocument(
  document: VectorDocument,
  expectedDimension:
    number | null
): void {
  if (!document.id.trim()) {
    throw new Error(
      "VectorStore requires a document id."
    );
  }

  if (!document.source.trim()) {
    throw new Error(
      "VectorStore requires a document source."
    );
  }

  if (!document.chunk.trim()) {
    throw new Error(
      "VectorStore requires non-empty chunk text."
    );
  }

  if (
    document.embedding.length === 0
  ) {
    throw new Error(
      "VectorStore requires a non-empty embedding."
    );
  }

  if (
    document.embedding.some(
      (value) =>
        !Number.isFinite(value)
    )
  ) {
    throw new Error(
      "VectorStore requires finite embedding values."
    );
  }

  if (
    expectedDimension !== null &&
    document.embedding.length !==
      expectedDimension
  ) {
    throw new Error(
      "VectorStore embedding dimensions must remain consistent."
    );
  }
}

export class VectorStore {
  private readonly documents: VectorDocument[] = [];

  add(
    document: VectorDocument
  ): void {
    const existing =
      this.documents.find(
        (entry) =>
          entry.id === document.id
      );

    if (existing) {
      throw new Error(
        `VectorStore cannot register duplicate document id "${document.id}".`
      );
    }

    validateVectorDocument(
      document,
      this.documents[0]
        ?.embedding.length ?? null
    );

    this.documents.push(
      document
    );
  }

  addMany(
    documents: VectorDocument[]
  ): void {
    for (const document of documents) {
      this.add(document);
    }
  }

  getAll(): VectorDocument[] {
    return [...this.documents];
  }

  clear(): void {
    this.documents.length = 0;
  }

  size(): number {
    return this.documents.length;
  }

  isEmpty(): boolean {
    return this.documents.length === 0;
  }
}

export const vectorStore =
  new VectorStore();
