const inflightRequests = new Map<string, Promise<unknown>>();

export async function withRequestDedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    inflightRequests.delete(key);
  });
  inflightRequests.set(key, promise);
  return promise;
}

export function getInflightRequestCount(): number {
  return inflightRequests.size;
}

