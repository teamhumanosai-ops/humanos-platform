import { ArtifactType } from "../models";

import { UrlDetector } from "./UrlDetector";
import { FileDetector } from "./FileDetector";
import { MimeDetector } from "./MimeDetector";
import { ContentDetector } from "./ContentDetector";

export interface DetectArtifactOptions {
    input?: string;

    filename?: string;

    mimeType?: string;

    content?: Buffer | Uint8Array | string;
}

export class ArtifactDetector {
    static detect(options: DetectArtifactOptions): ArtifactType {
        const urlResult = UrlDetector.detect(options.input);

        if (urlResult) {
            return urlResult;
        }

        const fileResult = FileDetector.detect(options.filename);

        if (fileResult) {
            return fileResult;
        }

        const mimeResult = MimeDetector.detect(options.mimeType);

        if (mimeResult) {
            return mimeResult;
        }

        /**
         * Reserved for future binary signature detection.
         */
        const contentResult = ContentDetector.detect();

        if (contentResult) {
            return contentResult;
        }

        return ArtifactType.UNKNOWN;
    }
}