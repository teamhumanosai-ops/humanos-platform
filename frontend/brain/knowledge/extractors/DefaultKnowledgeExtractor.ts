import { AnalysisResult } from "../../content/analyzers";

import { Knowledge } from "../models";

import { BaseKnowledgeExtractor } from "./BaseKnowledgeExtractor";

export class DefaultKnowledgeExtractor
    extends BaseKnowledgeExtractor
{
    readonly name =
        "DefaultKnowledgeExtractor";

    async extract(
        analysis: AnalysisResult
    ): Promise<Knowledge> {
        return {
            summary: {
                title: undefined,

                summary: undefined,

                language:
                    analysis.summary.language,

                keywords:
                    analysis.summary.keywords,

                topics: [],
            },

            entities: [],

            relationships: [],
        };
    }
}