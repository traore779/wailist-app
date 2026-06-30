const TTL = 60;
const PREFIX = "visitors:";

export async function trackVisitor(kv: KVNamespace, url: string, sessionId: string): Promise<void> {
  await kv.put(`${PREFIX}${url}:${sessionId}`, "1", { expirationTtl: TTL });
}

export async function getVisitorCount(kv: KVNamespace, url: string): Promise<number> {
  const { keys } = await kv.list({ prefix: `${PREFIX}${url}:` });
  return keys.length;
}
