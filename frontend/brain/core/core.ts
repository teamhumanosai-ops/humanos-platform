export type BrainState = {
  initialized: boolean;
  version: string;
};

export const CORE: BrainState = {
  initialized: true,
  version: "1.0.0",
};

export function getBrainState(): BrainState {
  return CORE;
}