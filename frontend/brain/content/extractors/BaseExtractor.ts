import {
    ExtractedContent,
    ExtractionMetadata,
    ExtractionResult,
} from "./";

export abstract class BaseExtractor {
    abstract readonly name: string;

    protected abstract doExtract(
        content?: Buffer | string
    ): Promise<ExtractedContent>;

    async extract(
        content?: Buffer | string
    ): Promise<ExtractionResult> {
        const startedAt = new Date();

        const extractedContent =
            await this.doExtract(content);

        const completedAt = new Date();

        const metadata: ExtractionMetadata = {
            extractor: this.name,

            startedAt,

            completedAt,

            durationMs:
                completedAt.getTime() -
                startedAt.getTime(),
        };

        return {
            content: extractedContent,

            metadata,
        };
    }
}