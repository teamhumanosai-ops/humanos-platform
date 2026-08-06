import { ExtractedContent } from "../extractors";

import { AnalysisResult } from "./AnalysisResult";
import { ContentAnalyzer } from "./ContentAnalyzer";
import { TextAnalyzer } from "./TextAnalyzer";

export class AnalyzerRegistry {
    private static readonly analyzers: ContentAnalyzer[] = [
        new TextAnalyzer(),
    ];

    static register(
        analyzer: ContentAnalyzer
    ): void {
        this.analyzers.unshift(analyzer);
    }

    static async analyze(
        content: ExtractedContent
    ): Promise<AnalysisResult> {
        /**
         * Phase 1
         *
         * We currently execute the first registered analyzer.
         *
         * Later milestones will introduce analyzer selection
         * based on artifact type and analysis capabilities.
         */

        const analyzer = this.analyzers[0];

        return analyzer.analyze(content);
    }
}