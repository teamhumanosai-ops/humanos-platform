import { Artifact, ArtifactType } from "../../models";

import { BaseProcessor } from "../BaseProcessor";

import { MarkdownExtractor } from "./MarkdownExtractor";

export class MarkdownProcessor extends BaseProcessor {
    readonly name = "MarkdownProcessor";

    private readonly extractor =
        new MarkdownExtractor();

    canProcess(
        artifact: Artifact
    ): boolean {
        return (
            artifact.metadata.type ===
            ArtifactType.MARKDOWN
        );
    }

    protected async extract(
        artifact: Artifact
    ): Promise<string> {
        const result =
            await this.extractor.extract(
                artifact.rawContent
            );

        return result.content.text;
    }
}