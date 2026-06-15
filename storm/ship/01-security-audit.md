---
storm-depends-on:
  - src/
  - storm/structure/07-deployment-target.md
storm-phase: ship
storm-canonical: true
---

# Security Audit — Calculator (M1 engine + M2 UI + M3 history tape)

> SHIP phase, AI-led (opus). Audits the single static bundle shipping M1+M2+M3 together.
> Calibrated to the real app: **zero-stakes, single-anonymous-user, client-side-only static calculator** — no backend, no auth, no database, no persistence (history + theme die with the tab). Deploy = self-hosted Dokploy, Static (NGINX) build, HTTPS via Traefik + Let's Encrypt (`storm/structure/07-deployment-target.md`).
> Findings are calibrated to that reality (CP-13 over-engineering dim): no manufactured enterprise findings. The craft-floor security bar (C3) is still held — XSS-safety of render paths, dependency integrity, secrets, static-hosting headers.

## Overall posture: **CLEAR**

Nothing blocks SHIP. `npm audit` is clean (0 vulnerabilities). Every DOM write renders via `textContent` — the app is injection-safe **by construction**, not by sanitization. No secrets in code. No network calls / analytics / telemetry. The only recommended hardening is **owner-config security headers on the NGINX/Traefik serve** (P2/P3, defense-in-depth — not a vulnerability fix), plus confirming Let's Encrypt TLS at deploy time.

| Severity | Count | Items |
|---|---|---|
| P0 (blocker) | 0 | — |
| P1 (high) | 0 | — |
| P2 (medium) | 1 | Security headers absent on static serve (recommend adding) |
| P3 (low/hardening) | 2 | HSTS (requires custom-domain HTTPS); `npm audit` in deploy pipeline |

---

## Technical findings (autonomous — CP-7)

### F-1 — `npm audit`: CLEAN (0 vulnerabilities) — **INFO**

Live scan this turn (not training data):

```
$ npm audit
found 0 vulnerabilities

metadata.vulnerabilities: { info:0, low:0, moderate:0, high:0, critical:0, total:0 }
dependencies: { prod:2, dev:113, optional:33, total:114 }
```

Only **2 production dependencies** (decimal.js + its single transitive). The 113 dev deps (vite, vitest, typescript, jsdom) are **build/test-time only** — they do not ship in the static bundle, so their attack surface is the developer's machine at build time, not the deployed artifact. No advisories on any of the 114.

### F-2 — XSS surface: injection-safe BY CONSTRUCTION — **PASS**

Audited every DOM-write path in the shipped bundle. **All user-influenced content is written via `textContent`; no `innerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, or `new Function` anywhere in production source.**

Verified sinks:

- **M2 display** (`src/ui/render.ts`): `readoutEl.textContent = readoutText` (L213), `pendingEl.textContent = pendingText` (L261). The horizontal-scroll fallback builds a `<span>` via `document.createElement` + `span.textContent = text` (L184–186) — element creation + textContent, never markup-string parsing.
- **M3 history tape** (`src/ui/history/render-history.ts`): each entry is built with `document.createElement('li'/'span')` and `exprSpan.textContent = entry.expression` / `resultSpan.textContent = entry.result` (L122–141). Comment at L115 documents the deliberate choice ("textContent (NOT innerHTML) … XSS-safe").

Grep for unsafe sinks (`innerHTML|outerHTML|insertAdjacentHTML|document.write|eval(|new Function|setAttribute('on…)`) over `src/` + `index.html` returned **only** test-scaffold matches (`*.test.ts` setting `document.body.innerHTML = TAPE_SKELETON` to build the jsdom fixture) and one confirming code comment. **Zero hits in production code.**

**Defense-in-depth note:** the calculator's grammar is structurally incapable of producing a `<` or script — input is digits/operators, output is engine-formatted numeric strings + Unicode glyphs (−, ×, ÷). Even so, the codebase does not *rely* on that; it uses `textContent` universally, so the path stays safe even if the input domain were ever widened. This is the correct craft-floor posture (safe by construction, belt-and-suspenders).

### F-3 — Secrets-in-code: NONE — **PASS**

Scanned `src/`, `index.html`, `vite.config.ts`, `package.json` for `api_key|secret|token|password|credential|bearer|aws_|private key|BEGIN RSA/PRIVATE`. **No hardcoded credentials, tokens, or keys.** The only `token` matches are CSS **design-token** comments (`var(--token)`, `tokens.css`) — false positives, not secrets. Expected for a client-only app with no backend to authenticate to.

### F-4 — Dependency integrity: PINNED + HASH-LOCKED — **PASS**

- **Lockfile present:** `package-lock.json` (`auditReportVersion: 2`).
- **decimal.js pinned EXACT:** `package.json` declares `"decimal.js": "10.6.0"` (no `^`/`~` — exact pin). Installed version matches (`10.6.0`).
- **Integrity hash present:** lockfile carries `integrity: sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==`, resolved from the official npm registry (`https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz`).
- **Provenance:** decimal.js is the canonical arbitrary-precision decimal library (MichaelMitchell-at / MikeMcl), MIT-licensed, widely adopted, actively maintained — the correct choice for a calculator that must avoid IEEE-754 float drift (verified at SPECIFY tech-choice gate, CP-6). 10.6.0 is current stable.
- *(Dev deps use caret ranges — acceptable: build-time only, lockfile pins the resolved tree.)*

### F-5 — No network egress / telemetry — **PASS**

Grep for `fetch|XMLHttpRequest|navigator.sendBeacon|WebSocket|gtag|analytics|googletagmanager|sentry` over production source: **zero hits.** The bundle makes no outbound requests — no analytics, no error reporting, no CDN beacons. Consistent with the no-tracking business posture below. (Confirms the consent/analytics business item is genuinely N/A, not merely undeclared.)

### F-6 — HTTPS / TLS in transit — **PLAN CONFIRMED (verify at deploy)**

Per `07-deployment-target.md`: Dokploy fronts the app with **Traefik**, auto-provisioning **Let's Encrypt** certs (`certResolver: letsencrypt`) for a real custom domain → automatic HTTPS in transit. **At-rest encryption is N/A** — the app stores nothing (history + theme are in-memory, die with the tab; no localStorage, no cookies, no server store).

⚠️ Deploy-time caveat (from the deployment-target doc's own open items): the **free `traefik.me` subdomain is HTTP-only by default** — HTTPS there needs a manual cert step. **Recommendation: use a custom domain/subdomain so Let's Encrypt auto-HTTPS applies.** If the free subdomain is used, HTTPS must be manually enabled — do not ship the calculator over plain HTTP. (P3 — owner picks domain at SHIP per the doc.)

---

## Recommended NGINX security headers (static-serve hardening — F-7, **P2/P3**)

These are the real, applicable hardening for a static SPA. They are **defense-in-depth**, not fixes for any found vulnerability (the app has no XSS path to exploit) — but they are the craft-floor baseline for a static serve and cheap to add. **Most are owner-config on the Dokploy/Traefik/NGINX side** (the Static build type's NGINX or a Traefik middleware), not build-time.

| Header | Recommended value | Why (this app) | Where to set | Priority |
|---|---|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'` | Backstop the already-safe render paths; block any injected external resource. `'unsafe-inline'` on `style-src` only because the scroll-fit logic sets inline `style.fontSize` (and CSS custom props) — script stays `'self'` with **no** `'unsafe-inline'`/`'unsafe-eval'` (the bundle has no inline scripts/eval). | NGINX `add_header` / Traefik middleware | **P2** |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-sniffing of the JS/CSS assets. | NGINX/Traefik | **P2** |
| `X-Frame-Options` | `DENY` | No reason to embed the calculator in a frame; blocks clickjacking. (Redundant with CSP `frame-ancestors 'none'` — keep both for older-UA coverage.) | NGINX/Traefik | **P2** |
| `Referrer-Policy` | `no-referrer` | App has no outbound links/requests; send no referrer. | NGINX/Traefik | **P3** |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS once a custom-domain Let's Encrypt cert is live. **Add only after HTTPS is confirmed working** (HSTS over a non-HTTPS or misconfigured-cert host locks users out). | Traefik (once TLS confirmed) | **P3** (gated on F-6) |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=()` | App uses none of these APIs; explicitly deny. Optional nicety. | NGINX/Traefik | **P3** |

**Build-time vs owner-config split:** none of these are build-time in the current Vite setup (Vite emits plain static assets; it does not write server headers). All are set on the **serving layer** — either the Static build's NGINX config or a Traefik `headers` middleware on the Dokploy instance. This is an **owner/infra action at SHIP**, surfaced here so it is not rediscovered late.

---

## Business items (propose — human decides, CP-7)

For this app, almost every business-security item is **"not applicable, and here's the concrete reason"** — which is itself the honest finding, not a gap. No decision is forced where the answer is structurally N/A; the one genuine pick is the domain/TLS choice (already owner-deferred to SHIP).

| Item | Finding | Needs a decision? |
|---|---|---|
| **Data collection** | **None.** No PII, no form fields beyond calculator buttons, no input captured or transmitted. Confirmed by F-5 (no network egress). | No — confirm only. |
| **Data retention** | **N/A.** History + theme are in-memory and die with the tab (`07-deployment-target.md`, `04-scope.md`: no localStorage, no DB, no server store). Nothing to retain → no retention policy needed. | No — confirm only. |
| **Compliance scope (GDPR / PDP Indonesia)** | **Effectively N/A.** Both regimes govern processing of personal data. This app collects, stores, and transmits **zero personal data** → no controller/processor obligations, no DSAR surface, no consent-for-processing. Plainly: there is no personal data to be compliant *about*. | No — stated plainly; no action. |
| **Consent / cookies / tracking** | **N/A.** No cookies, no localStorage, no analytics, no third-party scripts, no tracking pixels (F-5). No cookie banner needed — there is nothing to consent to. | No — confirm no analytics is the intended posture (it is). |
| **Domain + TLS** | The **one** real pick: custom domain (auto-HTTPS via Let's Encrypt) vs free `traefik.me` subdomain (HTTP-only by default). Recommend **custom domain** so HTTPS is automatic (see F-6). Already owner-deferred to SHIP in `07-deployment-target.md`. | **Yes** — owner picks at SHIP (mild-business, CP-7). |

---

## Summary

**Posture: CLEAR — SHIP not blocked.**

- **0 vulnerabilities** (`npm audit` live).
- **XSS-safe by construction** — every DOM write is `textContent` / `createElement`; zero `innerHTML`/`eval` in production code (M2 display + M3 tape both verified).
- **No secrets, no telemetry, no network egress.**
- **Dependency integrity solid** — decimal.js pinned exact (10.6.0) with SHA-512 lockfile hash, MIT, current.
- **Only action items are owner-config at deploy:** add the static-serve security headers (P2), and confirm Let's Encrypt HTTPS on a custom domain before enabling HSTS (P3).
- **Business security items are N/A by design** (no data collected/stored/transmitted) — the single genuine decision is the domain/TLS pick, already on the owner's SHIP plate.
