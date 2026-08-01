import { AIProvider } from "./types";

export class ProviderRegistry {
  private readonly providers = new Map<
    string,
    AIProvider
  >();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }

  list(): AIProvider[] {
    return [...this.providers.values()];
  }
}