const MAX_REQUESTS = 5;
const WINDOW_SECONDS = 60;

export async function checkRateLimit(
  kv: KVNamespace,
  ip: string
): Promise<{ allowed: boolean }> {
  const key = `rl:${ip}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= MAX_REQUESTS) return { allowed: false };

  await kv.put(key, String(count + 1), { expirationTtl: WINDOW_SECONDS });
  return { allowed: true };
}
