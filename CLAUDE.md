# Calculator — STORM v1

## Current State

- **Phase:** **v1.1.0 SHIPPED — M4 theme toggle LIVE in prod.** `https://calc.elborky.my.id` now runs **v1.1.0** (prod SHA `dd13281`, deployed 2026-06-15 via Dokploy redeploy from `main`, Dockerfile build, HTTP/2 + HTTPS, security headers intact). All 4 modules PROD (M1/M2/M3 bundled + M4). M4 = Light/Dark toggle in `.toggle-slot`: OS-default first-load + single-key `localStorage` persist (`calc-theme`) + no-FOUC inline head script + 300ms cross-fade + reduced-motion guards. Light theme = **"Iridescent Dawn"**; dark v3 Wildcard frozen as default, unchanged. 0 new deps. Delta-SHIP (npm audit 0 vulns, reused v1.0.0 audit/QA/runbook). REVIEW-exit (staging) `f772fa7`; 8-layer REVIEW PASS (0 P0; L8 opus `0a0558b` 0 P0 / 1 P1 fixed `50a1c7f` 96→106 tests / 1 P2 parked #002 / 3 P3). Prod smoke PASS (HTML M4 markers + assets 200, byte-identical to REVIEW build). Delta record: `storm/ship/06-v1.1.0-delta.md`.
- **Sub-context:** M4 spec set `storm/specify/04-theming/` (8 concerns + `_picked.md` v3 Iridescent Dawn + `_audit.md` PASS); BUILD plan `storm/build/04-theming/_plan.md` (7 groups A–G all DONE). Theme module = `src/ui/theme.ts` (readStoredTheme/writeStoredTheme/resolveTheme/applyTheme/toggleTheme/attachOsChangeListener; `applyTheme` writes `dataset.theme` explicitly "light"|"dark"); wired in `main.ts`; styles in `tokens.css` (light palette) + `history.css` (light `--tape-scrim`) + `toggle.css` (control). **2 AA fixes found in Group-G verify:** `3956f08` light `--tape-scrim` override (history tape was dark in light theme — M3's local token literal was outside Group A's swap surface); `d000e9e` light `--text-secondary` 0.60→0.66 (dimmed text was 4.24:1 < 4.5). Verification artifact: `storm/build/04-theming/group-g-aa-verification.md`.
- **Last decision:** Owner picked **v3 "Iridescent Dawn"** light theme ("v3", 2026-06-15), Light+Dark 2-state (System 3rd option DEFERRED), OS-default + localStorage persist. #FF-037 credits-gate: ALL Wave-1/Wave-2 forked-sonnet dispatches ran clean once 1M context was turned off (logged permanently as framework-feedback `#F-003` — `ac84ccd` — recurring pattern + proposed pre-dispatch gate).
- **Next step:** **All scoped modules shipped (M1–M4 PROD).** No phase in flight — re-entrant via `/storm-park` triage. Non-blocking follow-ups open: parking #001 (unprefixed `backdrop-filter` Firefox glass gap); parking #002 (dead reduced-motion CSS in `tokens.css`, L8 F-1); enable HSTS in `security-headers.conf` (HTTPS live, safe to activate → redeploy). A future redeploy could bundle #001 + #002 + HSTS together. Owner visual-confirm of the live toggle (click sun/moon) optional — code is byte-identical to REVIEW-verified build. Ship artifacts: `storm/ship/01..06`.

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
