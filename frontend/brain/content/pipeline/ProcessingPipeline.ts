import {
    ProcessingResult,
    ProcessingStatus,
} from "../processing";

import { ProcessorRegistry } from "../processors";

import { HookRegistry } from "../hooks";

import { ProcessingContext } from "./ProcessingContext";

export class ProcessingPipeline {
    static async execute(
        context: ProcessingContext
    ): Promise<ProcessingResult> {
        const startedAt = new Date();

        try {
            await HookRegistry.beforeProcess(context);

            const processor =
                ProcessorRegistry.resolve(
                    context.artifact
                );

            const artifact =
                await processor.process(
                    context.artifact
                );

            context.artifact = artifact;

            await HookRegistry.afterProcess(
                context
            );

            const completedAt = new Date();

            return {
                artifact,

                status:
                    ProcessingStatus.COMPLETED,

                startedAt,

                completedAt,

                durationMs:
                    completedAt.getTime() -
                    startedAt.getTime(),
            };
        } catch (error) {
            await HookRegistry.onError(
                context,
                error
            );

            const completedAt = new Date();

            return {
                artifact: context.artifact,

                status:
                    ProcessingStatus.FAILED,

                startedAt,

                completedAt,

                durationMs:
                    completedAt.getTime() -
                    startedAt.getTime(),

                error: {
                    code: "PROCESSING_ERROR",

                    message:
                        error instanceof Error
                            ? error.message
                            : "Unknown processing error",

                    cause: error,
                },
            };
        }
    }
}