import { Artifact } from "../models";

import { ProcessingError } from "./ProcessingError";
import { ProcessingStatus } from "./ProcessingStatus";

export interface ProcessingResult {
    artifact: Artifact;

    status: ProcessingStatus;

    startedAt: Date;

    completedAt?: Date;

    durationMs?: number;

    error?: ProcessingError;
}