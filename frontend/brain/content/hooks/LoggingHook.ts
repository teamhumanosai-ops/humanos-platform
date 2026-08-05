import { ProcessingHook } from "./ProcessingHook";

export class LoggingHook
    implements ProcessingHook
{
    beforeProcess(): void {
        console.log(
            "[UCE] Processing started"
        );
    }

    afterProcess(): void {
        console.log(
            "[UCE] Processing completed"
        );
    }

    onError(
        _context: unknown,
        error: unknown
    ): void {
        console.error(
            "[UCE] Processing failed",
            error
        );
    }
}