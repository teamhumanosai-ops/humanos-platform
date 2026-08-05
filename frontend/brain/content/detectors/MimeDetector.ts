import { ArtifactType } from "../models";

const MIME_TYPES: Record<string, ArtifactType> = {
    "application/pdf": ArtifactType.PDF,

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ArtifactType.DOCX,

    "text/plain": ArtifactType.TXT,

    "text/markdown": ArtifactType.MARKDOWN,

    "image/png": ArtifactType.PNG,

    "image/jpeg": ArtifactType.JPG,

    "text/csv": ArtifactType.CSV,

    "application/json": ArtifactType.JSON,

    "application/zip": ArtifactType.ZIP,
};

export class MimeDetector {
    static detect(mimeType?: string): ArtifactType | null {
        if (!mimeType) {
            return null;
        }

        const normalized = mimeType.trim().toLowerCase();

        return MIME_TYPES[normalized] ?? null;
    }
}