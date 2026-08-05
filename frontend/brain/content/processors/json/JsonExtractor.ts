import {
    BaseExtractor,
    ExtractedContent,
} from "../../extractors";

export class JsonExtractor extends BaseExtractor {
    readonly name = "JsonExtractor";

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

        let formatted = text;

        try {
            formatted = JSON.stringify(
                JSON.parse(text),
                null,
                2
            );
        } catch {
            // Keep original text if parsing fails.
        }

        return {
            text: formatted,
            sections: [],
        };
    }
}