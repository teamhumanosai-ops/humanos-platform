export type AIProviderType =
  | "chat"
  | "embedding";

export interface AIProvider {
  readonly id: string;
  readonly type: AIProviderType;
  readonly name: string;
}