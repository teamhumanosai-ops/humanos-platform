import {
    BaseExtractor,
    ExtractedContent,
} from "../../extractors";

import { TextNormalizer } from "../../normalization";

export class MarkdownExtractor extends BaseExtractor {
    readonly name = "MarkdownExtractor";

    protected async doExtract(
        content?: Buffer | string
    ): Promise<ExtractedContent> {
        if (!content) {
            return {
                text: "",
                sections: [],
            };
        }

        const raw =
            typeof content === "string"
                ? content
                : content.toString("utf-8");

        const normalized =
            TextNormalizer.normalize(raw);

        return {
            text: normalized,

            sections:
                TextNormalizer.sections(
                    normalized
                ),
        };
    }
}