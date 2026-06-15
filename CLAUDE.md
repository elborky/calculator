# Calculator — STORM v1

## Current State

- **Phase:** REVIEW M2 (Calculator UI) — **PASS**. 8-layer auto-verification complete (0 P0; all P1+P2 fixed & re-verified). Ready for SHIP M2 (or continue M3/M4 — owner sequencing).
- **Sub-context:** REVIEW log `storm/review/02-review-calculator-ui.md`; evidence `storm/review/evidence/02-calculator-ui/`. L1 functional PASS (click≡keyboard, error sentence, shrink→scroll), L4 axe **4→0** (rest+scroll), L5 visual faithful to v3, L6 FCP 204ms, L7 tsc/61-tests/build GREEN + token-purity CLEAN, L8 code HIGH (no XSS, exhaustive switch, INT-1..6). Fixed in-REVIEW: main-landmark/role-application, sr-only `<h1>`, scroll-region focusable (conditional tabindex), UR-029 rgba→channel-tokens, font consolidation, favicon, dead re-export. **F1 "font weights collapsed" RETRACTED** — woff2 is a latin-subset variable font (fvar wght 100–900); D-004 self-host IS met (verify-before-flag #FF-001).
- **Last decision:** REVIEW M2 ran **INLINE** (forked sonnet/opus dispatch blocked all session by #FF-008 credits-gate; owner chose "gas inline" after 2 retries). Tier-purity caveat: REVIEW commits tagged `Model: opus` (orchestrator tier), not the dispatched sonnet/opus — measurement degraded for these commits, documented in the review log + handoff. Re-run forked once credits enabled if a clean baseline is wanted.
- **Next step:** SHIP M2 (`/storm-ship`) — first deployable surface (static NGINX/Dokploy), security audit + smoke-test scaffold. OR continue to M3 (history) / M4 (theming) first — **owner sequencing decision** to confirm at session start.

## STORM Config

- **Framework version:** STORM Protocol v1.5.0 (loaded from `.claude/rules/storm-protocol.md`)
- **Domain lens:** "Solo zero-stakes consumer web utility — design-craft-forward, framework-test vehicle" (`storm/structure/00-domain-lens.md`)
- **Deployment target:** Self-hosted Dokploy (static NGINX build, Traefik + Let's Encrypt) — `storm/structure/07-deployment-target.md`
- **Design tool:** `/frontend-design` (D4 baseline per #FF-019 — fallback to `/design-shotgun` only if unavailable)

## Project Identity

- **What:** Web-based calculator, intentionally simple. Primary goal = **field-test the STORM framework** end-to-end (the process is what's being exercised; the product is deliberately minimal).
- **Builder:** Default profile — Bahasa Indonesia primary, zero-code, ADHD-like (override in CAPTURE if needed)

## User Profile

- **Native language:** Bahasa Indonesia (mixed with English tech terms)
- **Coding level:** zero — never ask user to review technical implementation
- **Cognitive style:** ADHD-like, chaotic mind, shiny-object prone, easily demotivated when stuck
- **Session rhythm:** patient during planning, restless during execution

## Installed STORM Artifacts

- **Framework docs:** project-local (`STORM-FRAMEWORK.md`, `STORM-WORKFLOW.md` at root; `docs/storm/`)
- **Protocol:** `.claude/rules/storm-protocol.md` (project-local)
- **Commands:** `.claude/commands/storm-*.md`
- **Skills:** `.claude/skills/`

## Session Start Protocol

On every session open, run `/storm-start-session` (or detect intent and route automatically).
Reads: CLAUDE.md → git log → plan files → session-handoff.md top entry → reports continuity.

## Maintenance Rules

- **CLAUDE.md stays lean** — no state trackers, history, or raw artifacts here (CP-14)
- **Every AI commit** includes `Model:` + `Felt:` trailers (STORM Commit Convention)
- **Cascade** — when any canonical doc changes, walk DAG downstream + announce plan before executing
- **Tech choices** — verified via Context7 (primary) + WebFetch (cross-check), never training data alone
