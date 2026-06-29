# Waitlist Worker

Page d'inscription à une liste d'attente — Cloudflare Workers + Hono + D1.

## Stack

| Couche | Techno |
|---|---|
| Runtime | Cloudflare Workers |
| Framework | [Hono](https://hono.dev) + JSX |
| Base de données | Cloudflare D1 (SQLite) |
| Rate limiting | Cloudflare KV |
| Assets statiques | Cloudflare Static Assets Binding |
| CSS | Bootstrap 5.3 + CSS custom |
| CI/CD | GitHub Actions |

## Fonctionnalités

- Formulaire d'inscription (prénom + email)
- Validation email côté serveur
- Gestion des doublons (réponse 409)
- Rate limiting par IP (5 req/min via KV)
- Compteur d'inscrits en temps réel via WebSocket
- Animation du compteur à chaque inscription
- Panel admin protégé par session JWT (cookie HttpOnly)
- Export CSV de tous les inscrits
- CI/CD via GitHub Actions (migrations + deploy)

---

## Installation

### Prérequis

- Node.js 20+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) : `npm install -g wrangler`
- Compte Cloudflare (gratuit)

### 1. Cloner et installer

```bash
git clone https://github.com/TON-USERNAME/waitlist-worker.git
cd waitlist-worker
npm install
```

### 2. Authentification Cloudflare

```bash
wrangler login
```

### 3. Créer la base D1

```bash
wrangler d1 create waitlist-db
```

Copiez le `database_id` retourné dans `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "waitlist-db"
database_id = "VOTRE_ID_ICI"
```

### 4. Créer le namespace KV

```bash
wrangler kv namespace create RATE_LIMIT_KV
```

Copiez l'`id` retourné dans `wrangler.toml` :

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "VOTRE_KV_ID_ICI"
```

### 5. Appliquer les migrations D1

```bash
# Local
npm run db:migrate

# Production
npm run db:migrate:remote
```

### 6. Configurer les secrets admin

```bash
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD
wrangler secret put JWT_SECRET
```

### 7. Développement local

```bash
cp .dev.vars.example .dev.vars
# Éditez .dev.vars avec vos valeurs locales

npm run dev
# → http://localhost:8787
```

### 8. Déployer

```bash
npm run deploy
```

---

## CI/CD avec GitHub Actions

### Secrets GitHub à configurer

Dans **Settings → Secrets → Actions** :

| Secret | Valeur |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Votre Account ID Cloudflare |

### Créer un token API Cloudflare

1. Aller sur `https://dash.cloudflare.com/profile/api-tokens`
2. Cliquer **Create Token**
3. Template **Edit Cloudflare Workers**
4. Ajouter les permissions : `D1 Edit`, `KV Storage Edit`
5. Copier le token → GitHub Secret `CLOUDFLARE_API_TOKEN`

### Workflow

```
Push sur main
  → Type check TypeScript
  → D1 migrations apply --remote
  → wrangler deploy
```

---

## API

### `POST /api/subscribe`

```json
// Request
{ "email": "user@example.com", "name": "Alice" }

// 200 OK
{ "success": true, "count": 42 }

// 409 Duplicate
{ "success": false, "duplicate": true, "error": "...", "count": 42 }

// 429 Rate limit
{ "success": false, "error": "Trop de tentatives." }
```

### `GET /api/count`

```json
{ "count": 42 }
```

### `GET /api/ws`

WebSocket — envoie `{ "count": 42 }` à la connexion puis à chaque ping client.

### `GET /api/export/csv` — session requise

Accessible uniquement après connexion sur `/login`. Télécharge tous les inscrits au format CSV.

---

## Personnalisation

### Textes et branding

Les textes sont dans `src/components/` :

- `HomePage.tsx` → accroche, description, features, footer
- `LoginPage.tsx` → titre du panel admin
- `AdminPage.tsx` → libellés du tableau de bord

### Couleurs

Dans `public/style.css` :

```css
:root {
  --accent: #6366f1;        /* Couleur principale */
  --accent-light: #818cf8;  /* Nuance claire */
  --bg-primary: #0a0a0f;    /* Fond principal */
}
```

### Icônes

Les icônes sont des composants SVG inline dans `src/components/icons.tsx` — modifiables directement.

---

## Structure du projet

```
waitlist-worker/
├── src/
│   ├── components/
│   │   ├── icons.tsx          # Composants SVG (IconLightning, IconLock, IconTarget, IconKey)
│   │   ├── baseHead.tsx       # <head> commun
│   │   ├── HomePage.tsx       # Page d'accueil (publique)
│   │   ├── LoginPage.tsx      # Page de connexion admin
│   │   └── AdminPage.tsx      # Dashboard admin
│   ├── lib/
│   │   ├── db.ts              # Requêtes D1
│   │   └── ratelimit.ts       # Rate limiting KV
│   ├── middleware/
│   │   └── auth.ts            # Session JWT (cookie HttpOnly)
│   └── index.tsx              # Routes Hono
├── public/
│   ├── style.css              # Thème dark + Bootstrap
│   └── app.js                 # Client JS (form, WebSocket, animations)
├── migrations/
│   └── 0001_create_waitlist.sql
├── .github/
│   └── workflows/
│       └── deploy.yml
├── wrangler.toml
├── tsconfig.json
└── package.json
```
