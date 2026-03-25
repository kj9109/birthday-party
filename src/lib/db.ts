// Vercel KV with in-memory fallback for local dev
// KV is used when KV_REST_API_URL is set (auto-populated by Vercel)

const memoryStore: Record<string, unknown> = {};

function useKV(): boolean {
  return !!process.env.KV_REST_API_URL;
}

export async function getKey<T>(key: string): Promise<T | null> {
  if (useKV()) {
    const { kv } = await import("@vercel/kv");
    return kv.get<T>(key);
  }
  return (memoryStore[key] as T) ?? null;
}

export async function setKey<T>(key: string, value: T): Promise<void> {
  if (useKV()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value);
  } else {
    memoryStore[key] = value;
  }
}
