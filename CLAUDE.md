# Calculator — STORM v1

## Current State

- **Phase:** BUILD M3 (History Tape) — **COMPLETE, ready for REVIEW M3.** All 44 tasks done across groups A–I (forked sonnet, tier-clean). Tape is LIVE: record-on-genuine-=, newest-on-top, repeated-= dedup, error/bare-= excluded, AC clears. Verified by LIVE browser smoke (real Chrome) + 75 tests (61 engine + 14 M3 jsdom) + tsc + build, all green. M2 REVIEW-PASS still un-shipped (SHIP M2 deferred by owner — "lanjut M3" 2026-06-15).
- **Sub-context:** M3 spec set `storm/specify/03-history-tape/` — 8 concerns + `_decisions.md` (D-M3-DM-01..03, TC-01..02, EC-01) + `_audit.md` PASS (`32e57f7`). Load-bearing design = **INT-M3 recording seam**: a subscriber list on M2's `dispatch()` (`src/ui/state.ts`) observing `(prev,next)` EngineState; INT-M3-1 predicate `prevState.pendingOperator !== null AND nextState.errorState === null AND nextState.justEvaluated === true` IS the equals-filter (dedupes repeated-=/error/bare-=). `HistoryEntry {expression,result,id}`, unbounded in-memory array, zero new deps, M1 frozen+untouched. Visual baseline = **v1 Conservative single-line** (`04-ui/_picked.md`); v2 Bold/v3 Wildcard retained as record. Audit verified seam buildable vs live `src/`, renumbered HE-018b→HE-029, superseded 04-ui two-line orphan.
- **Last decision:** Owner picked **v1 single-line** tape ("gw pilih v1", 2026-06-15). All 6 M3 SPECIFY sub-agent dispatches ran **forked** this session (#FF-008 credits-gate OPEN — clean tier baseline restored vs the inline REVIEW M2 commits). 3 of the parallel mockup/acceptance dispatches died on a transient socket error mid-flight; re-dispatched cleanly.
- **Next step:** **REVIEW M3** (`/storm-review` — 8-layer auto-verification: full Playwright/axe coverage of HE/HR/US, visual-vs-_picked diff, a11y over glass both themes). OR SHIP M2 (still deferred — owner sequencing). Note for REVIEW: BUILD live-smoke already PASS on the 6 core flows; a startup-crash bug (missing static tape skeleton in index.html) was found+fixed in-BUILD (`35e8530`) — green tsc/build/tests had masked it, live-smoke caught it (validates the runtime-smoke discipline #E4 axis-2).

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
