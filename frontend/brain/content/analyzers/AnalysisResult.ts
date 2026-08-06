import { AnalysisMetadata } from "./AnalysisMetadata";
import { AnalysisSummary } from "./AnalysisSummary";

export interface AnalysisResult {
    summary: AnalysisSummary;

    metadata: AnalysisMetadata;
}