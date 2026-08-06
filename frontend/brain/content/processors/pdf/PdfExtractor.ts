import {
    BaseExtractor,
    ExtractedContent,
} from "../../extractors";

import { PdfEngine } from "../../engines/pdf/PdfEngine";
import { PdfParseEngine } from "../../engines/pdf/PdfParseEngine";

export class PdfExtractor extends BaseExtractor {
    readonly name = "PdfExtractor";

    constructor(
        private readonly engine: PdfEngine =
            new PdfParseEngine()
    ) {
        super();
    }

    protected async doExtract(
        content?: Buffer | string
    ): Promise<ExtractedContent> {
        if (!content) {
            return {
                text: "",
                sections: [],
            };
        }

        const buffer =
            typeof content === "string"
                ? Buffer.from(content)
                : content;

        const result =
            await this.engine.extractText(
                buffer
            );

        return {
            text: result.text,

            sections: [
                `Pages: ${result.pageCount}`,

                ...(result.metadata.title
                    ? [
                          `Title: ${result.metadata.title}`,
                      ]
                    : []),

                ...(result.metadata.author
                    ? [
                          `Author: ${result.metadata.author}`,
                      ]
                    : []),
            ],
        };
    }
}