import {
    BaseExtractor,
    ExtractedContent,
} from "../../extractors";

export class TextExtractor extends BaseExtractor {
    readonly name = "TextExtractor";

    protected async doExtract(
        content?: Buffer | string
    ): Promise<ExtractedContent> {
        if (!content) {
            return {
                text: "",
                sections: [],
            };
        }

        const text =
            typeof content === "string"
                ? content
                : content.toString("utf-8");

        return {
            text,
            sections: [],
        };
    }
}