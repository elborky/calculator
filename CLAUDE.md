# Calculator — STORM v1

## Current State

- **Phase:** Pre-CAPTURE
- **Sub-context:** STORM scaffolding complete
- **Last decision:** STORM v1 init
- **Next step:** Run `/storm-capture` — pour ideas into `storm/capture/01-braindump.md` first or tell me directly

## STORM Config

- **Framework version:** STORM Protocol v1.5.0 (loaded from `.claude/rules/storm-protocol.md`)
- **Domain lens:** not yet declared (set in CAPTURE)
- **Deployment target:** not yet decided (set in STRUCTURE per CP-6 #5)
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
