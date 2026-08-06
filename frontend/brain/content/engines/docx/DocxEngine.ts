export interface DocxResult {
    text: string;

    metadata: {
        title?: string;

        author?: string;

        wordCount?: number;
    };
}

export abstract class DocxEngine {
    abstract extractText(
        buffer: Buffer
    ): Promise<DocxResult>;
}