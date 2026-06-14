---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/01-vision.md
  - storm/structure/04-scope.md
storm-phase: structure
storm-canonical: true
---

# Deployment Target — Calculator

> Status: **proposed** (STRUCTURE phase, AI-led draft). Owner confirms comprehension, not wording.
>
> CP-6 deployment-target decided in STRUCTURE, not at SHIP (`storm-protocol.md` Tech Choice Discipline §5). The **technical shape** (static files) is settled and AI-autonomous. The **host** was an owner decision (CP-7, mild business implications: consistency, maintenance ownership, vendor independence) and is now **confirmed** — see the `DECISION` marker at the bottom.

---

## DECISION: self-hosted Dokploy (owner-confirmed 2026-06-14)

The calculator deploys to the **owner's own self-hosted Dokploy instance** — the same platform the owner runs their other projects on. Two reasons the owner gave, both business-side:

1. **Consistency** — one deploy surface across all their projects, instead of a one-off managed host just for this app.
2. **Exercise the real STORM deploy path** — Dokploy is the platform STORM's schema-migration discipline (#FF-014) is built around. Deploying the calculator here exercises the genuine SHIP-phase workflow end-to-end (even though this app has no schema), rather than a throwaway path.

This supersedes the earlier "pick a managed static host" recommendation. The managed-host comparison is retained only as a one-line footnote below.

---

## Deployment shape — static files (settled)

The deployment shape is **static file hosting** — pre-built HTML/CSS/JS served over HTTPS, no server tier of any kind. This is forced directly by scope, not a preference:

- **No backend / server / API** — pre-approved OUT (`04-scope.md:55`).
- **No accounts / auth / login** — single anonymous user (`04-scope.md:54`).
- **No persistence / database** — history + theme are in-memory and die with the tab; no localStorage, no server store (`04-scope.md:53`).
- **Client-side-only utility** (`01-vision.md:53`).

With zero server-side anything, there is nothing to *run* — only static assets to *serve*. The choice of self-hosted Dokploy does **not** change this: on Dokploy the calculator is still just a folder of static files behind a web server. Self-hosting changes *who owns the box*, not the app's runtime.

**Anti-inflation guard (CP-13 over-engineering dim):** running on Dokploy must NOT pull in a database, edge functions, a custom backend, or CI complexity the app doesn't need. A zero-stakes single-user calculator needs none of it (`00-domain-lens.md:70`; `01-vision.md:56`). The Dokploy app is one static-serving container, nothing more.

---

## How it's served on Dokploy (CP-6 verified)

Dokploy provides a dedicated **Static** build type designed for exactly this case — a plain HTML/CSS/JS bundle with no server runtime:

- The **Static** build type uses an **NGINX-optimized Dockerfile**: Dokploy copies the bundle from the app's root directory into the container at `/usr/share/nginx/html` and serves it with NGINX. The app's domain is then pointed at **port 80**. *(per WebFetch of Dokploy build-type docs, June 2026.)*
- Plain-language version for the owner: Dokploy wraps the calculator's files in a tiny standard web-server container and serves them. No code beyond the calculator itself; the container is boilerplate Dokploy generates.
- **Alternative (not needed here):** the **Nixpacks** build type can also serve static output via a "Publish Directory" field (point it at the build's output folder, e.g. `dist`), again using an NGINX-optimized Dockerfile. The dedicated **Static** type is Dokploy's own recommendation for pre-built bundles, so that is the path we'll use. *(per WebFetch, June 2026.)*
- **Routing / TLS:** Dokploy fronts apps with **Traefik**. For a real **custom domain**, Dokploy can auto-provision **Let's Encrypt** certificates (`certResolver: letsencrypt`) — automatic HTTPS. The free auto-generated `traefik.me` subdomain is **HTTP-only by default**; HTTPS on that free subdomain needs a manual certificate step. *(per WebFetch of Dokploy domains + certificates docs, June 2026.)* → this drives one open infra item below.

**Verification confidence note (CP-6 §4):** the Static build type, the NGINX `/usr/share/nginx/html` + port-80 mechanism, the Nixpacks alternative, Traefik routing, and the Let's Encrypt-vs-traefik.me TLS distinction were each confirmed via live WebFetch of the Dokploy docs this turn (June 2026). Context7 has no dedicated Dokploy library entry, so WebFetch against the official docs is the primary source. No specific was stated from training data alone.

---

## Tradeoff named (CP-15)

**Chosen:** self-hosted Dokploy. **Sacrificed axis:** *zero-maintenance simplicity.*

A managed static host (GitHub Pages / Cloudflare Pages / Netlify) would give a live HTTPS URL with **no infrastructure to own** — no server to patch, no container to keep running, no Traefik/TLS to mind. Self-hosting on Dokploy means the owner **owns the box**: the instance's uptime, updates, and TLS config are now part of the picture (even if light for a static app).

The owner accepts that maintenance cost deliberately, in exchange for **consistency** (one deploy surface for all projects) and **exercising the genuine STORM Dokploy deploy path**. At this app's near-zero load and stakes, the maintenance burden is small in practice — but it is real and is the named cost of this choice, not hand-waved away.

---

## Build output expectation (constrains SPECIFY / BUILD)

Dokploy's Static serving expects a **static bundle** — an `index.html` plus its CSS/JS/asset files — that the container serves as-is. This sets a constraint that flows downstream into SPECIFY and BUILD:

- The build must produce a **no-server-runtime** output: a folder of static files, servable by NGINX with no Node/Python/etc. process at runtime.
- A build step (bundler/transpiler) at *build time* is fine; what's disallowed is a *server process* at *run time*. The artifact handed to Dokploy is plain files.
- This keeps the app aligned with the scope (`04-scope.md`) — there was never a server tier to begin with; this just makes the build-output contract explicit for the module specs.

---

## Open infra items (flagged, not blocking STRUCTURE)

None of these block exiting STRUCTURE — they're SHIP-phase setup details, recorded now so they aren't rediscovered late:

- **Domain / subdomain** — decide between (a) a real **custom domain/subdomain** (gives clean auto-HTTPS via Let's Encrypt) vs. (b) the free **traefik.me** subdomain (HTTP-only by default, manual cert for HTTPS). For a zero-stakes calculator either is acceptable; owner picks at SHIP. *(CP-7 mild-business; not urgent.)*
- **TLS** — if a custom domain is used, confirm Dokploy's Let's Encrypt auto-provisioning is enabled on the instance (Traefik `certResolver: letsencrypt`). Standard Dokploy behavior; flagged to verify on the owner's actual instance at deploy time.
- **App-type confirmation on the live instance** — confirm the owner's Dokploy version exposes the **Static** build type (it is current per June-2026 docs); fall back to the Nixpacks publish-directory path if not.

---

> **Considered alternatives (footnote):** managed static hosts — GitHub Pages, Cloudflare Pages, Netlify — were the prior recommendation (commit `edad352`); all three serve this app fine at zero cost with zero maintenance. Set aside in favor of self-hosted Dokploy for cross-project consistency and to exercise the real STORM deploy path; the named cost is loss of zero-maintenance simplicity (see Tradeoff above).

---

## No TBDs on the technical shape — static files on self-hosted Dokploy via the Static (NGINX) build type. Host is owner-confirmed; only minor SHIP-phase infra items (domain, TLS) remain, flagged above.
