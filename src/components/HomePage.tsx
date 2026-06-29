/** @jsxImportSource hono/jsx */
import { baseHead } from "./baseHead";
import { IconLightning, IconLock, IconTarget } from "./icons";

export function HomePage({ count }: { count: number }) {
  return (
    <html lang="fr">
      <head>{baseHead("Liste d'attente — Votre Produit")}</head>
      <body>
        <section class="hero-section d-flex align-items-center justify-content-center min-vh-100">
          <div class="container text-center px-4">
            <div class="eyebrow mb-4">
              <span class="badge-pill">Accès anticipé</span>
            </div>
            
            <h1 class="display-headline mb-4">
              Le futur arrive.<br />
              <span class="text-accent">Soyez-y.</span>
            </h1>

            <p class="lead-text mb-5 mx-auto">
              Nous construisons quelque chose qui va changer la façon dont vous travaillez.
              Rejoignez la liste d'attente et recevez un accès en avant-première.
            </p>

            <div class="form-card mx-auto mb-5">
              <form id="waitlist-form" novalidate>
                <div class="input-row">
                  <div class="input-group-custom">
                    <input type="text" id="name" name="name" placeholder="Votre prénom" class="form-input" autocomplete="given-name" />
                    <input type="email" id="email" name="email" placeholder="votre@email.com" class="form-input" required autocomplete="email" />
                  </div>
                  <button type="submit" class="btn-primary-custom" id="submit-btn">
                    <span class="btn-text">Rejoindre</span>
                    <span class="btn-spinner d-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </span>
                  </button>
                </div>
              </form>

              <div id="success-state" class="success-card d-none">
                <div class="success-icon">✓</div>
                <h3>Vous êtes sur la liste !</h3>
                <p>Nous vous contacterons dès que votre accès sera disponible.</p>
              </div>

              <div id="error-state" class="error-card d-none">
                <p id="error-message"></p>
              </div>
            </div>

            <div class="counter-block">
              <div class="counter-value" id="counter" data-target={count}>{count}</div>
              <div class="counter-label">personnes sur la liste d'attente</div>
              <div class="counter-pulse" id="counter-pulse"></div>
            </div>
          </div>
        </section>

        <section class="features-section py-5">
          <div class="container px-4">
            <div class="row g-4 justify-content-center">
              {[
                { icon: <IconLightning size={28} />, title: "Ultra rapide", desc: "Conçu pour la performance dès le premier jour." },
                { icon: <IconLock size={28} />,      title: "Sécurisé",     desc: "Vos données restent privées. Toujours." },
                { icon: <IconTarget size={28} />,    title: "Simple",       desc: "Pas de complexité inutile. Juste ce qui compte." },
              ].map((f) => (
                <div class="col-md-4" key={f.title}>
                  <div class="feature-card">
                    <div class="feature-icon">{f.icon}</div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer class="footer-section py-4 text-center">
          <p class="footer-text">© {new Date().getFullYear()} Votre Produit. Tous droits réservés.</p>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        <script src="/app.js"></script>
      </body>
    </html>
  );
}
