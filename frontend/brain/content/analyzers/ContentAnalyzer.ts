import { ExtractedContent } from "../extractors";

import { AnalysisResult } from "./AnalysisResult";

export interface ContentAnalyzer {
    readonly name: string;

    analyze(
        content: ExtractedContent
    ): Promise<AnalysisResult>;
}