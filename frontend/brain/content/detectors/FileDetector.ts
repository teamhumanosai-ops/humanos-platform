import { ArtifactType } from "../models";

const EXTENSIONS: Record<string, ArtifactType> = {
    pdf: ArtifactType.PDF,

    docx: ArtifactType.DOCX,

    txt: ArtifactType.TXT,

    md: ArtifactType.MARKDOWN,

    png: ArtifactType.PNG,

    jpg: ArtifactType.JPG,

    jpeg: ArtifactType.JPG,

    csv: ArtifactType.CSV,

    json: ArtifactType.JSON,

    zip: ArtifactType.ZIP,
};

export class FileDetector {
    static detect(filename?: string): ArtifactType | null {
        if (!filename) {
            return null;
        }

        const extension = filename
            .split(".")
            .pop()
            ?.toLowerCase();

        if (!extension) {
            return null;
        }

        return EXTENSIONS[extension] ?? null;
    }
}