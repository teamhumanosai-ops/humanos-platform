import { ProcessingContext } from "../pipeline";

export interface ProcessingHook {
    beforeProcess?(
        context: ProcessingContext
    ): Promise<void> | void;

    afterProcess?(
        context: ProcessingContext
    ): Promise<void> | void;

    onError?(
        context: ProcessingContext,
        error: unknown
    ): Promise<void> | void;
}