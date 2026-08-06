import { AnalysisResult } from "../../content/analyzers";

import { Knowledge } from "../models";

export interface KnowledgeExtractor {
    readonly name: string;

    extract(
        analysis: AnalysisResult
    ): Promise<Knowledge>;
}