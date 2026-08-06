import { Artifact } from "../models";

import {
    AnalyzerRegistry,
} from "../analyzers";

import {
    KnowledgeEngine,
} from "../../knowledge/engine";

import { ContentProcessor } from "./ContentProcessor";

export abstract class BaseProcessor
    implements ContentProcessor
{
    abstract readonly name: string;

    abstract canProcess(
        artifact: Artifact
    ): boolean;

    protected abstract extract(
        artifact: Artifact
    ): Promise<string>;

    async process(
        artifact: Artifact
    ): Promise<Artifact> {
        const extractedContent =
            await this.extract(artifact);

        const analysis =
            await AnalyzerRegistry.analyze({
                text: extractedContent,

                sections: [],
            });

        const knowledge =
            await KnowledgeEngine.generate(
                analysis
            );

        return {
            ...artifact,

            extractedContent,

            knowledge,
        };
    }
}