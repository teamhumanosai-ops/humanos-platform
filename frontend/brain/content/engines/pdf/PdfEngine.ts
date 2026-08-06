export interface PdfMetadata {
    title?: string;

    author?: string;

    subject?: string;

    keywords?: string[];

    creator?: string;

    producer?: string;
}

export interface PdfExtractionResult {
    text: string;

    pageCount: number;

    metadata: PdfMetadata;
}

export abstract class PdfEngine {
    abstract extractText(
        content: Buffer
    ): Promise<PdfExtractionResult>;
}