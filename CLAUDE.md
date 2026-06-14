# Calculator — STORM v1

## Current State

- **Phase:** BUILD M2 (Calculator UI) — IN PROGRESS. Groups 0–3 done (T-101–T-136); first visual render LANDED (static glass UI, desktop+phone screenshots in `_evidence/`).
- **Sub-context:** Vite static build green. v3 aurora-glass UI ported (index.html markup + tokens/layout/keypad CSS, all theme colour via tokens). NOT yet interactive — M1 wiring + render + input binding = Groups 4–8 next. Fonts (self-hosted Inter, D-004) = Group 13. Build target = v3 Wildcard; a11y floor non-negotiable.
- **Last decision:** BUILD execution runs **inline on opus** (not forked sonnet) — forked dispatch blocked by #FF-008 (1M-context usage credits); owner chose unblocked progress over tier-purity (2026-06-15). Commits tagged `Model: opus` honestly; measurement-tier deviation noted.
- **Next step:** Continue BUILD M2 → Group 4 (M1 import + held-state wiring, T-137–T-139), then Groups 5–8 to make it interactive.

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
