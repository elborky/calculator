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
> CP-6 deployment-target decided in STRUCTURE, not at SHIP (`storm-protocol.md` Tech Choice Discipline §5). The **technical shape** below is settled and AI-autonomous. The **one open item** — *which* host — has mild business implications (cost model, vendor lock-in, ease) and is therefore an **owner decision** (CP-7). See the `DECISION PENDING` marker at the bottom.

---

## Deployment shape — static hosting (settled)

The deployment shape is **static file hosting** — a CDN serving pre-built HTML/CSS/JS, no server tier of any kind. This is not a preference; it is forced directly by scope:

- **No backend / server / API** — pre-approved OUT (`04-scope.md:55`).
- **No accounts / auth / login** — single anonymous user (`04-scope.md:54`).
- **No persistence / database** — history + theme are in-memory and die with the tab; no localStorage, no server store (`04-scope.md:53`).
- **Client-side-only utility** (`01-vision.md:53`).

With zero server-side anything, there is nothing to run — only static assets to serve. Any host that serves a folder of files over HTTPS satisfies the entire requirement. There is **no architectural fork** here: every candidate below delivers the identical runtime (static files on a CDN). The choice is purely about *friction, cost, and lock-in* for the owner — which is exactly why it is surfaced as an owner pick rather than locked unilaterally.

**Anti-inflation guard (CP-13 over-engineering dim):** resist reaching for containers, edge functions, CI pipelines, or a custom domain at this stage. A zero-stakes single-user calculator needs none of it (`00-domain-lens.md:70`; `01-vision.md:56`). The default subdomain each host gives for free is sufficient.

---

## Candidate hosts (CP-6 verified)

Three static hosts, each verified live this turn. All three are free for this use case, support HTTPS out of the box, and require zero code from the owner. They differ mainly in deploy friction and the shape of their free-tier limits.

### Option A — GitHub Pages

- **What it is:** Free static hosting tied directly to a GitHub repository; push to the repo (or a branch) and the site publishes at `username.github.io/repo`.
- **Free-tier reality:** Free for public repositories. Soft limits: **100 GB/month bandwidth**, **1 GB published site size**, **10 builds/hour** (the latter not applied when using a custom Actions workflow). A single-user calculator is orders of magnitude under all three. *(per WebFetch check of GitHub Pages usage-limits docs, June 2026.)*
- **Lock-in risk:** **Very low.** The site is just files in a git repo — fully portable to any other host by copying the folder. Tied to GitHub as a company, but the artifact is standard static files, not a proprietary format.
- **Friction (zero-code solo owner):** **Low-moderate.** Requires a GitHub account + a repo. Once set up, deploys are automatic on push. The repo requirement is the only extra concept vs. a pure drag-and-drop host.
- **Caveat:** GitHub Pages' terms state it is "not intended… as a free web-hosting service to run your online business / e-commerce." A zero-stakes personal calculator is squarely within acceptable personal/project use. *(per WebFetch, June 2026.)*

### Option B — Cloudflare Pages

- **What it is:** Free static + JAMstack hosting on Cloudflare's global CDN; connect a git repo or upload a build, publishes at `project.pages.dev`.
- **Free-tier reality:** **Unlimited bandwidth, unlimited static requests, unlimited sites**, 100 custom domains per project. The only real constraint is **build capacity: 1 concurrent build, 500 builds/month** — irrelevant for a calculator that deploys a handful of times. *(per WebFetch check of Cloudflare Pages page, June 2026.)*
- **Lock-in risk:** **Very low.** Output is standard static files; portable to any host. Cloudflare-specific features (Workers, etc.) are opt-in and unused here.
- **Friction (zero-code solo owner):** **Low-moderate.** Requires a Cloudflare account; can deploy via git connection or direct upload. Slightly more dashboard surface than GitHub Pages, but the unlimited-bandwidth free tier is the most generous of the three.

### Option C — Netlify

- **What it is:** Free static hosting + deploy previews on a global CDN; drag-and-drop a folder or connect a git repo, publishes at `project.netlify.app`.
- **Free-tier reality:** Free plan includes custom domains with SSL, a global CDN, and deploy previews — but is metered on a **unified credit system capped at 300 credits/month** (e.g. bandwidth ≈ 20 credits/GB, production deploys ≈ 15 credits each). For a single-user calculator the credit draw is negligible, but the metering model is **less transparent** than a flat bandwidth limit. *(per WebFetch check of Netlify pricing page, June 2026.)*
- **Lock-in risk:** **Low.** Static output is portable; Netlify-specific add-ons (Functions, Blobs, Netlify DB) are opt-in and unused here.
- **Friction (zero-code solo owner):** **Lowest for first deploy** — the drag-and-drop "drop a folder, get a URL" path needs no git and no repo. The credit-metered free tier is the only mild watch-item, though far out of reach at this scale.

> **Verification confidence note (CP-6 §4):** the three offerings above were each confirmed via a live WebFetch this turn (June 2026). GitHub's own *pricing* page did not detail Pages limits, so the figures above come from GitHub's dedicated usage-limits **docs** page instead — cross-checked, not fabricated. No candidate was named from training data alone.

---

## Recommendation (proposed — owner picks)

**Proposed: Option A — GitHub Pages.**

Rationale, tied to the owner profile (zero-code, solo, zero-stakes, low-friction-preferring) and to the project's actual purpose:

- **Free with comfortable headroom** — 100 GB/month is ~1000× over any realistic single-user calculator load; cost is a non-issue.
- **Near-zero lock-in** — the site is literally files in a git repo, copyable to any other host in minutes if the owner ever changes mind. Lowest regret.
- **On-thesis with the project** — STORM's SHIP phase and this whole build live naturally alongside source control; a repo-backed deploy keeps the artifact and its publish step in one place, reinforcing the clean-STORM-run deliverable (`01-vision.md:42`). The calculator is a *framework field-test* (`01-vision.md:26`); a git-native deploy fits that grain.

**Honest counter-weight (CP-15 name-the-tradeoff):** GitHub Pages' friction floor is slightly *higher* than Netlify's drag-and-drop for a first-ever deploy (account + repo vs. drop-a-folder). If the owner's overriding priority is *absolute minimum steps to a live URL with no git*, **Option C (Netlify)** is the better pick. If the priority is *maximum free headroom*, **Option B (Cloudflare Pages)** wins on unlimited bandwidth. All three are genuinely fine — there is no wrong answer at this scale; the recommendation optimizes lowest-lock-in + project-fit, and the sacrificed axis is *first-deploy friction*.

---

## DECISION PENDING: owner picks the host

This is a **CP-7 owner decision** (deployment topology with mild business implications). The technical shape (static hosting) is **settled — no TBD**. The single open item is *which host*:

- **A — GitHub Pages** *(proposed)* — lowest lock-in, git-native, generous free tier; slightly more first-time setup.
- **B — Cloudflare Pages** — unlimited bandwidth, most generous free tier; small extra dashboard surface.
- **C — Netlify** — lowest first-deploy friction (drag-and-drop, no git); credit-metered free tier.

> Orchestrator: surface these three to the owner as a CP-1 pick (`Confirm? (A / B / C / discuss more)`), then resolve this marker. No host is locked until the owner chooses.

---

## No TBDs on the technical shape — static hosting is fully resolved at structure altitude. The only open item is the owner's host pick, flagged above.
