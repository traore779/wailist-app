/** @jsxImportSource hono/jsx */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { requireSession, createSession, destroySession } from "./middleware/auth";
import { checkRateLimit } from "./lib/ratelimit";
import {
  getCount, getStats, getRecent,
  exportAll, insertEmail, isValidEmail,
} from "./lib/db";
import { trackVisitor, getVisitorCount } from "./lib/visitors";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { AdminPage } from "./components/AdminPage";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("/api/*", cors());

function getClientIP(cfIP?: string, forwardedFor?: string): string {
  return cfIP ?? forwardedFor ?? "unknown";
}

function escapeCSV(val: string): string {
  return `"${val.replace(/"/g, '""')}"`;
}

function isSecure(url: string): boolean {
  return new URL(url).protocol === "https:";
}

app.get("/", async (c) => {
  const count = await getCount(c.env.DB);
  return c.html(<HomePage count={count} />);
});

app.post("/api/subscribe", async (c) => {
  const ip = getClientIP(c.req.header("CF-Connecting-IP"), c.req.header("X-Forwarded-For"));

  const { allowed } = await checkRateLimit(c.env.RATE_LIMIT_KV, ip);
  if (!allowed) {
    return c.json({ success: false, error: "Trop de tentatives. Réessayez dans une minute." }, 429);
  }

  let body: { email?: string; name?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: "Corps de requête invalide." }, 400);
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const name = body.name?.trim().slice(0, 100) || null;

  if (!email || !isValidEmail(email)) {
    return c.json({ success: false, error: "Adresse email invalide." }, 400);
  }

  try {
    await insertEmail(c.env.DB, email, name, ip);
  } catch (err) {
    if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
      const count = await getCount(c.env.DB);
      return c.json({ success: false, duplicate: true, error: "Cet email est déjà inscrit !", count }, 409);
    }
    console.error("DB error:", err);
    return c.json({ success: false, error: "Erreur serveur." }, 500);
  }

  const count = await getCount(c.env.DB);
  return c.json({ success: true, count });
});

app.get("/api/count", async (c) => {
  const count = await getCount(c.env.DB);
  return c.json({ count });
});

app.get("/api/visitors", async (c) => {
  const redirect = await requireSession(c.req.raw, c.env.JWT_SECRET);
  if (redirect) return c.json({ visitors: 0 }, 401);

  const visitors = await getVisitorCount(c.env.RATE_LIMIT_KV, "/");
  return c.json({ visitors });
});

app.post("/api/ping", async (c) => {
  let body: { sessionId?: string; url?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ visitors: 0 }, 400);
  }

  const sessionId = (body.sessionId ?? "").slice(0, 64);
  const url = (body.url ?? "/").slice(0, 200);

  if (!sessionId) return c.json({ visitors: 0 }, 400);

  await trackVisitor(c.env.RATE_LIMIT_KV, url, sessionId);
  const visitors = await getVisitorCount(c.env.RATE_LIMIT_KV, url);

  return c.json({ visitors });
});

app.get("/api/ws", async (c) => {
  if (c.req.header("Upgrade") !== "websocket") {
    return c.text("WebSocket upgrade required", 426);
  }

  const { 0: client, 1: server } = new WebSocketPair();
  server.accept();

  const db = c.env.DB;

  const sendCount = async () => {
    try {
      const count = await getCount(db);
      server.send(JSON.stringify({ count }));
    } catch {
      server.close(1011, "Server error");
    }
  };

  await sendCount();
  server.addEventListener("message", () => sendCount());

  return new Response(null, { status: 101, webSocket: client });
});

app.get("/login", (c) => c.html(<LoginPage />));

app.post("/login", async (c) => {
  const form = await c.req.formData();
  const username = (form.get("username") as string ?? "").trim();
  const password = (form.get("password") as string ?? "").trim();

  if (username !== c.env.ADMIN_USERNAME || password !== c.env.ADMIN_PASSWORD) {
    return c.html(<LoginPage error="Identifiant ou mot de passe incorrect." />, 401);
  }

  const cookie = await createSession(c.env.JWT_SECRET, isSecure(c.req.url));
  return new Response(null, {
    status: 302,
    headers: { Location: "/admin", "Set-Cookie": cookie },
  });
});

app.get("/logout", (c) => {
  return new Response(null, {
    status: 302,
    headers: { Location: "/login", "Set-Cookie": destroySession(isSecure(c.req.url)) },
  });
});

app.get("/admin", async (c) => {
  const redirect = await requireSession(c.req.raw, c.env.JWT_SECRET);
  if (redirect) return redirect;

  const [stats, recent, visitors] = await Promise.all([
    getStats(c.env.DB),
    getRecent(c.env.DB, 20),
    getVisitorCount(c.env.RATE_LIMIT_KV, "/"),
  ]);

  return c.html(<AdminPage stats={stats} recent={recent} visitors={visitors} />);
});

app.get("/api/export/csv", async (c) => {
  const redirect = await requireSession(c.req.raw, c.env.JWT_SECRET);
  if (redirect) return redirect;

  const rows = await exportAll(c.env.DB);
  const date = new Date().toISOString().slice(0, 10);
  const header = "id,email,name,source,ip,created_at\n";
  const body = rows.map((r) =>
    [r.id, escapeCSV(r.email), escapeCSV(r.name ?? ""), escapeCSV(r.source), escapeCSV(r.ip), escapeCSV(r.created_at)].join(",")
  ).join("\n");

  return new Response(header + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waitlist-${date}.csv"`,
    },
  });
});


export default app;
