# Calculator — STORM v1

## Current State

- **Phase:** BUILD M2 (Calculator UI) — **COMPLETE**. All 15 groups / 87 tasks DONE (T-101–T-187). Calculator is fully interactive + verified. Ready for REVIEW M2.
- **Sub-context:** Vite static build GREEN. v3 aurora-glass UI live + interactive (click ≡ keyboard convergence via `handleKeyIntent`). M1 engine wired (state.ts → render.ts loop). Self-hosted Inter (300/400/500). Motion + reduced-motion + responsive + reserved M3/M4 slots. UR-029 token-purity clean (0 theme-hex outside tokens.css). Playwright smoke PASS: `12+3=`→15, `5÷0=`→"Cannot divide by zero", AC→0, keyboard path→15. Screenshots in `_evidence/smoke-*.png`. a11y: role=status, 3px focus ring, real `<button>`s.
- **Last decision:** Forked-sonnet dispatch **RESTORED** for Groups 4–14 (#FF-008 credits-gate no longer blocking, 2026-06-15) — owner re-confirmed "coba lagi forked sonnet". All M2 task commits this session tagged `Model: sonnet` (tier-purity recovered; supersedes prior inline-opus session for Groups 0–3 only).
- **Next step:** Enter REVIEW M2 (`/storm-review`) — Playwright e2e suite, full a11y audit, visual regression vs v3 baseline, L7 static guards + L8 adversarial review.

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
