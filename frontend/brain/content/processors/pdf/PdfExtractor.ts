import {
    BaseExtractor,
    ExtractedContent,
} from "../../extractors";

export class PdfExtractor extends BaseExtractor {
    readonly name = "PdfExtractor";

    protected async doExtract(
        _content?: Buffer | string
    ): Promise<ExtractedContent> {
        /**
         * Placeholder.
         *
         * Real PDF extraction will be implemented
         * in a later milestone using a dedicated
         * PDF parsing library.
         */

        return {
            text: "",

            sections: [],
        };
    }
}