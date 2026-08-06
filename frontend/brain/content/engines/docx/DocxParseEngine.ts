import {
    DocxEngine,
    DocxResult,
} from "./DocxEngine";

export class DocxParseEngine extends DocxEngine {
    async extractText(
        buffer: Buffer
    ): Promise<DocxResult> {
        /**
         * Placeholder implementation.
         *
         * The real DOCX parsing engine
         * will be added in the next milestone.
         */

        const text = buffer.toString("utf8");

        return {
            text,

            metadata: {
                wordCount:
                    text.split(/\s+/).length,
            },
        };
    }
}