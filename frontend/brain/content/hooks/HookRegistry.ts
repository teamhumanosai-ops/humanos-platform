import { ProcessingContext } from "../pipeline";

import { ProcessingHook } from "./ProcessingHook";

export class HookRegistry {
    private static readonly hooks: ProcessingHook[] = [];

    static register(hook: ProcessingHook): void {
        this.hooks.push(hook);
    }

    static async beforeProcess(
        context: ProcessingContext
    ): Promise<void> {
        for (const hook of this.hooks) {
            await hook.beforeProcess?.(context);
        }
    }

    static async afterProcess(
        context: ProcessingContext
    ): Promise<void> {
        for (const hook of this.hooks) {
            await hook.afterProcess?.(context);
        }
    }

    static async onError(
        context: ProcessingContext,
        error: unknown
    ): Promise<void> {
        for (const hook of this.hooks) {
            await hook.onError?.(context, error);
        }
    }
}