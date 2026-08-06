import { AnalysisResult } from "../../content/analyzers";

import { Knowledge } from "../models";

import { DefaultKnowledgeExtractor } from "./DefaultKnowledgeExtractor";
import { KnowledgeExtractor } from "./KnowledgeExtractor";

export class KnowledgeRegistry {
    private static readonly extractors: KnowledgeExtractor[] =
        [new DefaultKnowledgeExtractor()];

    static register(
        extractor: KnowledgeExtractor
    ): void {
        this.extractors.unshift(
            extractor
        );
    }

    static async extract(
        analysis: AnalysisResult
    ): Promise<Knowledge> {
        return this.extractors[0].extract(
            analysis
        );
    }
}