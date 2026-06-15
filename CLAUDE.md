# Calculator — STORM v1

## Current State

- **Phase:** REVIEW M3 (History Tape) — **PASS, ready for SHIP.** 8-layer auto-verify complete (0 P0 / 0 P1 outstanding). Fixed in-REVIEW (`a303f3b`): P1 desktop scroll-bound (panel scrolled page body + conditional tabindex never fired — US-M3-4 HE-016 / US-M3-8 HE-028; `max-height` on `.history-slot`) + 2 elevated P2 (dispatch-seam try/catch guard; `justEvaluated===false` test-gap closed) + P3 dup-import. L4 axe 0-violations, L6 FCP372/CLS0, 75 tests + tsc0 + build clean. All 4 REVIEW dispatches forked tier-clean (L1 sonnet, L8 opus, fix+log sonnet — #FF-037 gate fired at start, owner switched off 1M → clean baseline). **Both M2 + M3 now REVIEW-PASS, un-shipped** — SHIP deferred by owner sequencing.
- **Sub-context:** M3 spec set `storm/specify/03-history-tape/` — 8 concerns + `_decisions.md` (D-M3-DM-01..03, TC-01..02, EC-01) + `_audit.md` PASS (`32e57f7`). Load-bearing design = **INT-M3 recording seam**: a subscriber list on M2's `dispatch()` (`src/ui/state.ts`) observing `(prev,next)` EngineState; INT-M3-1 predicate `prevState.pendingOperator !== null AND nextState.errorState === null AND nextState.justEvaluated === true` IS the equals-filter (dedupes repeated-=/error/bare-=). `HistoryEntry {expression,result,id}`, unbounded in-memory array, zero new deps, M1 frozen+untouched. Visual baseline = **v1 Conservative single-line** (`04-ui/_picked.md`); v2 Bold/v3 Wildcard retained as record. Audit verified seam buildable vs live `src/`, renumbered HE-018b→HE-029, superseded 04-ui two-line orphan.
- **Last decision:** Owner picked **v1 single-line** tape ("gw pilih v1", 2026-06-15). All 6 M3 SPECIFY sub-agent dispatches ran **forked** this session (#FF-008 credits-gate OPEN — clean tier baseline restored vs the inline REVIEW M2 commits). 3 of the parallel mockup/acceptance dispatches died on a transient socket error mid-flight; re-dispatched cleanly.
- **Next step:** **SHIP** — M2 + M3 both REVIEW-PASS, neither deployed. Owner to sequence (ship M2+M3 together as one static NGINX bundle, or M2 first). M1 is headless (no deploy surface). REVIEW M3 evidence: `storm/review/03-review-history-tape.md` + `storm/review/evidence/03-history-tape/`. Deferred-cosmetic P3s (F-3 test-style note, F-5 reconciled-CSS dup) noted in the log, non-blocking.

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
