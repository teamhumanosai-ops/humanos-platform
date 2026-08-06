import { ExtractedContent } from "../extractors";

import { AnalysisResult } from "./AnalysisResult";
import { AnalysisSummary } from "./AnalysisSummary";
import { ContentAnalyzer } from "./ContentAnalyzer";

export abstract class BaseAnalyzer
    implements ContentAnalyzer
{
    abstract readonly name: string;

    protected abstract createSummary(
        content: ExtractedContent
    ): Promise<AnalysisSummary>;

    async analyze(
        content: ExtractedContent
    ): Promise<AnalysisResult> {
        const startedAt = new Date();

        const summary =
            await this.createSummary(content);

        const completedAt = new Date();

        return {
            summary,

            metadata: {
                analyzer: this.name,

                startedAt,

                completedAt,

                durationMs:
                    completedAt.getTime() -
                    startedAt.getTime(),
            },
        };
    }
}