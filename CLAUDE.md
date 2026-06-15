# Calculator — STORM v1

## Current State

- **Phase:** **SHIPPED — v1.0.0 LIVE in production.** 🎉 `https://calc.elborky.my.id` (self-hosted Dokploy, Dockerfile build from public GitHub `elborky/calculator`, prod SHA `e0ee19b`, 2026-06-15). HTTP/2 + valid Let's Encrypt cert + all security headers (CSP/nosniff/X-Frame DENY/Referrer/Permissions-Policy; HSTS deferred-deliberate). Deployed via official `@dokploy/mcp` REST API (driven directly, MCP config at `.mcp.json`). M1+M2+M3 all PROD (M1 bundled). Prod functional smoke PASS (arithmetic click≡keyboard, history record/dedup/error-no-record/AC-clear, 0 console errors). Glass confirmed rendering in owner's Chrome. **Open follow-up (parked #001, non-blocking):** build drops unprefixed `backdrop-filter` → Firefox glass gap; HSTS enable now that HTTPS is live.
- **Sub-context:** M3 spec set `storm/specify/03-history-tape/` — 8 concerns + `_decisions.md` (D-M3-DM-01..03, TC-01..02, EC-01) + `_audit.md` PASS (`32e57f7`). Load-bearing design = **INT-M3 recording seam**: a subscriber list on M2's `dispatch()` (`src/ui/state.ts`) observing `(prev,next)` EngineState; INT-M3-1 predicate `prevState.pendingOperator !== null AND nextState.errorState === null AND nextState.justEvaluated === true` IS the equals-filter (dedupes repeated-=/error/bare-=). `HistoryEntry {expression,result,id}`, unbounded in-memory array, zero new deps, M1 frozen+untouched. Visual baseline = **v1 Conservative single-line** (`04-ui/_picked.md`); v2 Bold/v3 Wildcard retained as record. Audit verified seam buildable vs live `src/`, renumbered HE-018b→HE-029, superseded 04-ui two-line orphan.
- **Last decision:** Owner picked **v1 single-line** tape ("gw pilih v1", 2026-06-15). All 6 M3 SPECIFY sub-agent dispatches ran **forked** this session (#FF-008 credits-gate OPEN — clean tier baseline restored vs the inline REVIEW M2 commits). 3 of the parallel mockup/acceptance dispatches died on a transient socket error mid-flight; re-dispatched cleanly.
- **Next step:** **Post-SHIP** — product is live; STORM v1 field-test ran the full CAPTURE→STRUCTURE→SPECIFY→BUILD→REVIEW→SHIP loop end-to-end. Optional follow-ups (owner-paced, all non-blocking): (1) parking #001 — fix unprefixed `backdrop-filter` drop for Firefox glass (lightningcss/postcss → rebuild → redeploy); (2) enable HSTS in `security-headers.conf` (HTTPS now confirmed live) + redeploy; (3) M4 (theme toggle) if owner wants to extend scope. Re-enter via `/storm-park` triage. Ship artifacts: `storm/ship/01..05`; runbook `05-runbook.md`; deploy-config `04-deployment-config/`.

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
