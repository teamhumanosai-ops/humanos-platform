export interface RuntimeContext {
  message: string;

  intent?: string;

  profile?: unknown;

  mission?: unknown;

  memory?: unknown;

  knowledge?: unknown;

  planner?: unknown;

  response?: string;
}

export type RuntimeStep = (
  context: RuntimeContext
) => Promise<RuntimeContext>;

export class RuntimePipeline {
  private readonly steps: RuntimeStep[] = [];

  use(step: RuntimeStep): this {
    this.steps.push(step);

    return this;
  }

  async execute(
    message: string
  ): Promise<RuntimeContext> {
    let context: RuntimeContext = {
      message,
    };

    for (const step of this.steps) {
      context = await step(context);
    }

    return context;
  }
}

export const runtimePipeline =
  new RuntimePipeline();