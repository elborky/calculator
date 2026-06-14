# Group 0 — Vite scaffold over the existing M1 package

**What:** Add Vite 8.0.16 dev-server/bundler + entry HTML + UI source stub to the *existing* M1
package (NOT a second package — D-002 one-pipeline). Tasks T-101..T-108.

**Why:** M2 is the first demo-able surface. It needs a dev server (`vite`) + a static-build
pipeline (`vite build` → `dist/`) targeting Dokploy Static/NGINX. M1's pure TS library + Vitest
config stay untouched; Vite layers on top of the same package.json/tsconfig.

**Spec refs:** `storm/specify/02-calculator-ui/_index.md` Group 0; `06-tech-choices.md` (vite@8.0.16,
TS 6.0.3 continuity, static-build target); D-002 (`_decisions.md`).

**Execution note:** Forked sonnet sub-agent dispatch was blocked this session (#FF-008, 1M-context
usage-credits gate). Per owner decision (2026-06-15), these tasks run **inline in the main opus
session**; commits honestly carry `Model: opus` (#FF-028 no-overclaim). Tier-discipline deviation
noted for measurement; flushed to session-delta at exit.

**Constraints honored:** M1 src/ frozen; package.json extended not replaced; vite version pinned
exact (8.0.16, no caret); per-task atomic commits.
