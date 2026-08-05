import { Artifact } from "../models";

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

        return {
            ...artifact,

            extractedContent,
        };
    }
}