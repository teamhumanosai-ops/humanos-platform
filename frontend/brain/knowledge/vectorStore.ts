export interface VectorDocument {
  id: string;
  source: string;
  chunk: string;
  embedding: number[];
}

export class VectorStore {
  private readonly documents: VectorDocument[] = [];

  add(document: VectorDocument): void {
    this.documents.push(document);
  }

  addMany(documents: VectorDocument[]): void {
    this.documents.push(...documents);
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

export const vectorStore = new VectorStore();