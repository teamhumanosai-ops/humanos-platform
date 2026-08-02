type Memory = {
  key: string;
  value: string;
  confidence: number;
  updatedAt: string;
};

type Listener = () => void;

let memories: Memory[] = [];

const listeners = new Set<Listener>();

export function getMemories(): Memory[] {
  return memories;
}

export async function refreshMemories() {
  const response = await fetch("/api/memory");

  memories = await response.json();

  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}