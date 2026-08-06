import { AnalysisResult } from "../../content/analyzers";

import { Knowledge } from "../models";

import { KnowledgeExtractor } from "./KnowledgeExtractor";

export abstract class BaseKnowledgeExtractor
    implements KnowledgeExtractor
{
    abstract readonly name: string;

    abstract extract(
        analysis: AnalysisResult
    ): Promise<Knowledge>;
}