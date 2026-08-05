import { Artifact, ArtifactType } from "../../models";

import { BaseProcessor } from "../BaseProcessor";

import { PdfExtractor } from "./PdfExtractor";

export class PdfProcessor extends BaseProcessor {
    readonly name = "PdfProcessor";

    private readonly extractor =
        new PdfExtractor();

    canProcess(
        artifact: Artifact
    ): boolean {
        return (
            artifact.metadata.type ===
            ArtifactType.PDF
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