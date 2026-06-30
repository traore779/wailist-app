/** @jsxImportSource hono/jsx */
import { baseHead } from "./baseHead";
import type { WaitlistEntry, WaitlistStats } from "../lib/db";

const adminStyles = `
  .admin-wrap {
    max-width: 900px;
    margin: 0 auto;
    padding: 48px 24px;
  }

  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .admin-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .admin-badge {
    font-size: .7rem;
    background: var(--accent-dim);
    color: var(--accent-light);
    border: 1px solid rgba(99, 102, 241, .25);
    padding: 4px 10px;
    border-radius: 100px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .live-section {
    margin-bottom: 32px;
  }

  .live-card {
    background: var(--bg-card);
    border: 1px solid rgba(52, 211, 153, 0.2);
    border-radius: var(--radius);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .live-dot {
    width: 10px;
    height: 10px;
    background: var(--success);
    border-radius: 50%;
    flex-shrink: 0;
    animation: blink-dot 2s ease-in-out infinite;
  }

  @keyframes blink-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .live-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--success);
    line-height: 1;
  }

  .live-label {
    font-size: .82rem;
    color: var(--text-muted);
    margin-top: 3px;
  }

  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 20px;
  }

  .stat-value {
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: -.03em;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label {
    font-size: .78rem;
    color: var(--text-muted);
  }

  .stat-card.accent .stat-value {
    color: var(--accent-light);
  }

  .section-title {
    font-size: .8rem;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: .88rem;
  }

  .admin-table th {
    color: var(--text-muted);
    font-weight: 500;
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .06em;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    text-align: left;
  }

  .admin-table td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, .04);
    color: var(--text-secondary);
    vertical-align: middle;
  }

  .admin-table tr:last-child td {
    border-bottom: none;
  }

  .admin-table tr:hover td {
    background: rgba(255, 255, 255, .02);
  }

  .email-cell {
    color: var(--text-primary);
    font-weight: 500;
  }

  .table-wrap {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 32px;
  }

  .admin-table th,
  .admin-table td {
    white-space: nowrap;
  }

  .btn-export {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    padding: 11px 20px;
    font-size: .88rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    font-family: var(--font);
    transition: background .2s, box-shadow .2s;
  }

  .btn-export:hover {
    background: var(--accent-light);
    box-shadow: 0 4px 16px var(--accent-glow);
    color: #fff;
  }

  .back-link {
    font-size: .82rem;
    color: var(--text-muted);
    text-decoration: none;
  }

  .back-link:hover {
    color: var(--text-primary);
  }

  .logout-link {
    font-size: .82rem;
    color: #f87171;
    text-decoration: none;
    font-weight: 500;
  }

  .logout-link:hover {
    color: #fca5a5;
  }

  .empty-cell {
    text-align: center;
    color: var(--text-muted);
    padding: 32px !important;
  }

  @media (max-width: 768px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .live-card { padding: 16px; }
  }

  @media (max-width: 576px) {
    .stat-grid { grid-template-columns: 1fr; }
    .admin-header { flex-direction: column; align-items: flex-start; }
  }
`;

export function AdminPage({ stats, recent, visitors }: { stats: WaitlistStats; recent: WaitlistEntry[]; visitors: number }) {
  return (
    <html lang="fr">
      <head>
        {baseHead("Admin — Liste d'attente")}
        <style>{adminStyles}</style>
      </head>
      <body>
        <div class="admin-wrap">
          <div class="admin-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <h1 class="admin-title">Liste d'attente</h1>
              <span class="admin-badge">Admin</span>
            </div>

            <div style="display:flex;align-items:center;gap:16px;">
              <a href="/" class="back-link">← Page d'acceuil</a>
              <a href="/logout" class="logout-link">Déconnexion</a>
            </div>
          </div>

          <div class="stat-grid">
            <div class="stat-card accent">
              <div class="stat-value">{stats.total}</div>
              <div class="stat-label">Total inscrits</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">{stats.today}</div>
              <div class="stat-label">Aujourd'hui</div>
            </div>

            <div class="stat-card">
              <div class="stat-value">{stats.last7days}</div>
              <div class="stat-label">7 derniers jours</div>
            </div>
          </div>

          <p class="section-title">Trafic en direct</p>

          <div class="live-section">
            <div class="live-card">
              <span class="live-dot"></span>
              <div>
                <div class="live-value" id="visitors-live">{visitors}</div>
                <div class="live-label" id="visitors-label">visiteur{visitors !== 1 ? "s" : ""} sur la page en ce moment</div>
              </div>
            </div>
          </div>

          <div style="margin-bottom:28px;">
            <a href="/api/export/csv" class="btn-export">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger CSV
            </a>
          </div>

          <p class="section-title">Dernières inscriptions</p>

          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Prénom</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colspan={4} class="empty-cell">Aucune inscription pour le moment.</td>
                  </tr>
                ) : (
                  recent.map((r) => (
                    <tr key={r.id}>
                      <td style="color:var(--text-muted);font-size:.8rem;">{r.id}</td>
                      <td class="email-cell">{r.email}</td>
                      <td>{r.name || "—"}</td>
                      <td style="font-size:.82rem;">{r.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {stats.total > 20 && (
            <p style="font-size:.8rem;color:var(--text-muted);text-align:center;">
              Affichage des 20 derniers sur {stats.total}. Téléchargez le CSV pour la liste complète.
            </p>
          )}
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          (function () {
            var count = document.getElementById("visitors-live");
            var label = document.getElementById("visitors-label");
            if (!count) return;
            async function refresh() {
              try {
                var res = await fetch("/api/visitors");
                if (!res.ok) return;
                var data = await res.json();
                if (typeof data.visitors === "number") {
                  count.textContent = data.visitors;
                  if (label) label.textContent = data.visitors !== 1 ? "visiteurs sur la page en ce moment" : "visiteur sur la page en ce moment";
                }
              } catch {}
            }
            refresh();
            setInterval(refresh, 10000);
          })();
        ` }} />
      </body>
    </html>
  );
}
