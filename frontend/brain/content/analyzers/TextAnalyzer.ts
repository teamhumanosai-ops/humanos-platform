import { ExtractedContent } from "../extractors";

import { AnalysisSummary } from "./AnalysisSummary";
import { BaseAnalyzer } from "./BaseAnalyzer";

export class TextAnalyzer extends BaseAnalyzer {
    readonly name = "TextAnalyzer";

    protected async createSummary(
        content: ExtractedContent
    ): Promise<AnalysisSummary> {
        const words =
            content.text.trim().length === 0
                ? []
                : content.text
                      .trim()
                      .split(/\s+/);

        return {
            language: "unknown",

            wordCount: words.length,

            characterCount:
                content.text.length,

            readingTimeMinutes: Math.max(
                1,
                Math.ceil(words.length / 200)
            ),

            keywords: [],
        };
    }
}