export interface ProcessingError {
    code: string;

    message: string;

    cause?: unknown;
}