---
storm-depends-on:
  - storm/structure/07-deployment-target.md
  - storm/ship/01-security-audit.md
storm-phase: ship
storm-canonical: true
---

# Deployment Config — Calculator (Dokploy, custom domain + HTTPS)

> SHIP phase, AI-led (opus). This is the deploy recipe + the real config files the repo
> ships so Dokploy can build and serve the calculator correctly and securely.
> Owner-facing settings are in plain language; the file internals are AI-autonomous (CP-7).

---

## TL;DR (what to do on Dokploy)

1. Create a new **Application** in Dokploy, pointed at this git repo (branch `main`).
2. **Build Type = `Dockerfile`** (NOT "Static" — see "Why Dockerfile" below). Dockerfile path: `Dockerfile` (repo root, the default).
3. Add a **Domain**: your custom domain/subdomain, **Container Port `80`**, **HTTPS = ON**, **Certificate Provider = Let's Encrypt**.
4. **Deploy.** Dokploy builds the image and serves it behind Traefik with auto-HTTPS.
5. After HTTPS is confirmed working in the browser, **enable HSTS** (one-line uncomment — see "HSTS" below) and redeploy.

No environment variables. No database. Nothing else to configure.

---

## Build path decision (1-line justification)

**Chosen: Dokploy `Dockerfile` build type** with a multi-stage `node → nginx` image — because it lets us own the NGINX config and bake in the security headers from the audit (F-7); Dokploy's built-in "Static" type serves with its own fixed NGINX config that cannot carry those headers.

*(Verified against Dokploy docs via WebFetch, June 2026: the Static build type "uses a NGINX Optimized Dockerfile … copies everything from the Root directory … to `/usr/share/nginx/html`"; the Dockerfile build type gives "full control … including multi-stage builds". For static serving "use the port `80` when creating a domain". Domains: HTTPS toggle + certificate provider **Let's Encrypt**, Traefik `certResolver: letsencrypt`.)*

The output shape is the same in spirit as the originally-planned Static serve (`07-deployment-target.md`): plain static files behind NGINX on port 80, fronted by Traefik + Let's Encrypt. The only difference is **who writes the NGINX config** — us, so we can harden it.

---

## Files added to the repo root (what each does)

| File | Purpose |
|---|---|
| **`Dockerfile`** | Multi-stage build. Stage 1 (`node:22-alpine`): `npm ci` from the lockfile, then `npm run build` (= `tsc --noEmit && vite build`) → `/app/dist`. Stage 2 (`nginx:1.27-alpine`): copies `dist/` to `/usr/share/nginx/html` and our NGINX config in. Serves on port 80. |
| **`nginx.conf`** | The server block: SPA fallback (`try_files … /index.html`), gzip, cache-control (immutable for `/assets/`, no-cache for `index.html`), and it `include`s the security-headers snippet into every location. |
| **`security-headers.conf`** | The audit's security headers (F-7), in their own file. Separate because NGINX does not inherit `add_header` into a location that has its own `add_header` (the cache-control locations) — `include`ing the snippet everywhere restores the headers on every response. |
| **`.dockerignore`** | Keeps the build context small/reproducible (excludes `node_modules`, `dist`, `.git`, `storm/`, docs). |

These four files are **real and verified**: `npm run build` succeeds, the Docker image builds, `nginx -t` passes, and a live container returns the correct headers + cache-control + SPA fallback on every route (index, hashed assets, deep links). HSTS is correctly absent until enabled.

---

## Security headers baked in (F-7)

Set on the serving layer (our NGINX), applied to every response:

| Header | Value | Note |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` | Verified against the real bundle: `script-src 'self'` (no inline JS / eval), `style-src 'unsafe-inline'` for runtime font-fit CSSOM writes, `font-src 'self'` for the self-hosted Inter woff2 (no CDN), `img-src data:` for the inline favicon. Does **not** break rendering (live-tested). |
| `X-Content-Type-Options` | `nosniff` | |
| `X-Frame-Options` | `DENY` | Redundant with CSP `frame-ancestors 'none'`; kept for older UAs. |
| `Referrer-Policy` | `no-referrer` | |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=()` | App uses none of these. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | **Commented out** — see HSTS below. |

### HSTS — enable AFTER HTTPS is confirmed

HSTS is intentionally **disabled** in the shipped config. Enabling it before a valid custom-domain HTTPS cert is live would lock users out (the browser would refuse plain-HTTP and any cert error). **After** you deploy with a custom domain + Let's Encrypt and confirm `https://yourdomain` loads cleanly in a browser:

1. In `security-headers.conf`, uncomment the `Strict-Transport-Security` line (remove the leading `# `).
2. Commit + redeploy.

*(The free `traefik.me` subdomain is HTTP-only by default — use a **custom domain** so Let's Encrypt auto-HTTPS applies. Per `01-security-audit.md` F-6 and `07-deployment-target.md` open items.)*

---

## Environment / secrets

**None.** The calculator is client-side-only — no backend, no API keys, no env vars, no secrets. Nothing to configure in Dokploy's environment tab. (Confirmed by the security audit: no secrets in code, no network egress.)

---

## Monitoring / health / backup

- **Health check:** Dokploy/Traefik can health-check the app at `GET /` — it returns `200` with `index.html`. No dedicated `/health` endpoint is needed (a static SPA is healthy iff NGINX is up and serving the page). If Dokploy's app settings expose a health-check path, set it to `/`.
- **Logs:** NGINX access/error logs are inside the container (`/var/log/nginx/`, also streamed to Docker stdout/stderr) — viewable in Dokploy's **Logs** tab for the application. There is no app-level logging beyond NGINX (no backend).
- **Backup:** **Nothing to back up at runtime** — the app is stateless (history + theme are in-memory and die with the tab; no DB, no volumes, no uploads). The *source of truth* is the **git repo** — redeploying from git fully reconstructs the running app. Backup = the git remote.
- **Rollback:** redeploy a prior commit in Dokploy (or `git revert` + push). Since the app is stateless and the image is built from source, rollback is risk-free — no schema/data migration concerns (#FF-014 is N/A here: no schema).

---

## Verification done at build time (craft-floor C3)

- `npm run build` → succeeds, emits `dist/` with hashed `/assets/` (JS, CSS, woff2).
- `docker build` → multi-stage image builds clean.
- `nginx -t` on the real config → syntax OK (nginx 1.27).
- Live container (`curl`): security headers present on `/`, on hashed assets, and on the SPA-fallback deep route; `Cache-Control: no-cache` on index, `public, immutable` on `/assets/`; HSTS absent (correct, pre-HTTPS); `<title>Calculator</title>` served.
