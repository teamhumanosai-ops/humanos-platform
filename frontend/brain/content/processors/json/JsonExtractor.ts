import {
    BaseExtractor,
    ExtractedContent,
} from "../../extractors";

import { JsonNormalizer } from "./JsonNormalizer";

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

        const raw =
            typeof content === "string"
                ? content
                : content.toString("utf-8");

        const normalized =
            JsonNormalizer.normalize(raw);

        return {
            text: normalized.text,

            sections: normalized.keys,
        };
    }
}