/** @jsxImportSource hono/jsx */
import { baseHead } from "./baseHead";
import { IconKey } from "./icons";

const loginStyles = `
  .login-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .login-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 40px 36px;
    width: 100%;
    max-width: 380px;
  }

  .login-logo {
    width: 40px;
    height: 40px;
    background: var(--accent-dim);
    border: 1px solid rgba(99, 102, 241, .25);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: var(--accent-light);
  }

  .login-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 4px;
  }

  .login-sub {
    font-size: .82rem;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 28px;
  }

  .login-label {
    display: block;
    font-size: .78rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .login-field {
    margin-bottom: 16px;
  }

  .login-error {
    background: rgba(248, 113, 113, .08);
    border: 1px solid rgba(248, 113, 113, .25);
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: .84rem;
    color: #f87171;
    margin-bottom: 16px;
  }

  .login-btn {
    width: 100%;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    padding: 13px;
    font-size: .95rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font);
    transition: background .2s;
  }

  .login-btn:hover {
    background: var(--accent-light);
  }
`;

export function LoginPage({ error }: { error?: string }) {
  return (
    <html lang="fr">
      <head>
        {baseHead("Connexion Admin")}
        <style>{loginStyles}</style>
      </head>
      <body>
        <div class="login-wrap">
          <div class="login-card">
            <div class="login-logo">
              <IconKey size={20} />
            </div>
            <h1 class="login-title">Espace admin</h1>
            <p class="login-sub">Liste d'attente</p>

            {error && <div class="login-error">{error}</div>}

            <form method="post" action="/login">
              <div class="login-field">
                <label class="login-label" for="username">Identifiant</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  class="form-input"
                  style="width:100%"
                  autocomplete="username"
                  required
                  autofocus
                />
              </div>

              <div class="login-field">
                <label class="login-label" for="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  class="form-input"
                  style="width:100%"
                  autocomplete="current-password"
                  required
                />
              </div>

              <button type="submit" class="login-btn">Se connecter</button>
            </form>
          </div>
        </div>
      </body>
    </html>
  );
}
