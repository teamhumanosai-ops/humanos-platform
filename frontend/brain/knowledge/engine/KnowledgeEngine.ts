import { AnalysisResult } from "../../content/analyzers";

import { Knowledge } from "../models";
import { KnowledgeRegistry } from "../extractors";

export class KnowledgeEngine {
    static async generate(
        analysis: AnalysisResult
    ): Promise<Knowledge> {
        return KnowledgeRegistry.extract(
            analysis
        );
    }
}