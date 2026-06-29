export interface WaitlistEntry {
  id: number;
  email: string;
  name: string | null;
  source: string;
  ip: string;
  created_at: string;
}

export interface WaitlistStats {
  total: number;
  today: number;
  last7days: number;
}

export async function getCount(db: D1Database): Promise<number> {
  const result = await db
    .prepare("SELECT COUNT(*) as n FROM waitlist")
    .first<{ n: number }>();
  return result?.n ?? 0;
}

export async function insertEmail(
  db: D1Database,
  email: string,
  name: string | null,
  ip: string
): Promise<void> {
  await db
    .prepare("INSERT INTO waitlist (email, name, ip) VALUES (?, ?, ?)")
    .bind(email, name, ip)
    .run();
}

export async function getStats(db: D1Database): Promise<WaitlistStats> {
  const [total, today, week] = await Promise.all([
    getCount(db),
    db
      .prepare(
        "SELECT COUNT(*) as n FROM waitlist WHERE date(created_at) = date('now')"
      )
      .first<{ n: number }>(),
    db
      .prepare(
        "SELECT COUNT(*) as n FROM waitlist WHERE created_at >= datetime('now', '-7 days')"
      )
      .first<{ n: number }>(),
  ]);

  return {
    total,
    today: today?.n ?? 0,
    last7days: week?.n ?? 0,
  };
}

export async function getRecent(
  db: D1Database,
  limit = 20
): Promise<WaitlistEntry[]> {
  const { results } = await db
    .prepare(
      "SELECT id, email, name, source, ip, created_at FROM waitlist ORDER BY created_at DESC LIMIT ?"
    )
    .bind(limit)
    .all<WaitlistEntry>();
  return results ?? [];
}

export async function exportAll(db: D1Database): Promise<WaitlistEntry[]> {
  const { results } = await db
    .prepare(
      "SELECT id, email, name, source, ip, created_at FROM waitlist ORDER BY created_at ASC"
    )
    .all<WaitlistEntry>();
  return results ?? [];
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
