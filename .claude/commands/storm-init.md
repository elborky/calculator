---
description: Bootstrap a new project with STORM — creates storm/ starters, CLAUDE.md template, git init, first commit
model: sonnet
---

Bootstrap STORM v1 in the current directory.

## Step 1: Pre-flight

1. **Check state:**
   - If `CLAUDE.md`, `storm/`, or project-level `.claude/rules/storm-protocol.md` already exists → STORM may already be initialized here. Report findings and ask: *"Found existing STORM artifacts — (a) cancel, (b) inspect, (c) overwrite (destructive)? Default cancel."*
   - If directory has unrelated files → warn: *"Directory not empty. Proceed anyway? (yes / cancel)"*
   - If empty → proceed silently.

2. **Confirm target:**
   > *"Initializing STORM in: `[current working directory]`. Correct? (yes / different path)"*

3. **Tool readiness preflight** — run before/alongside folder scaffolding. STORM declares a tool manifest; init detects what's present and provisions what's missing:

   | Tool | Used for | Provision |
   |---|---|---|
   | **Playwright** | REVIEW User-Reality Crawl (functional verification) | **Auto:** `npm i -D @playwright/test && npx playwright install` (run in the project root, or `./test-tooling/` for non-Node projects). |
   | **`/frontend-design`** | All design/mockup activity (primary per #FF-019) | **Detect; guided-install:** official Claude Code marketplace plugin (`claude-plugins-official/frontend-design`). If absent, show the exact install/marketplace step and ask the user to install it once, then continue. Upgrade to auto only if the plugin CLI supports non-interactive install. |

   **Procedure:**
   1. Detect Playwright: check `package.json` devDependencies for `@playwright/test` AND `node_modules/@playwright`. If absent → auto-install: `npm i -D @playwright/test && npx playwright install`.
      - **Non-Node guard (deterministic gate):** if no `package.json` exists at the project root, the project is non-Node (STORM is stack-agnostic — Python/Go/Rails/etc.). Playwright drives the browser against any-stack app but needs a Node runtime to run. Gate on `node --version`:
        - If `node --version` succeeds (Node available) → option (a): create a minimal `package.json` in `./test-tooling/` and install the Playwright dev-dependency there (the app's own stack stays independent).
        - If `node --version` fails (no Node runtime) → option (b): fall back to the documented REVIEW drivers (Chrome MCP / browser-use) and report `Playwright [WARN] (non-Node, no Node runtime — using fallback driver)`.
   2. Detect `/frontend-design` (introspection-first to avoid false-negatives): check whether `/frontend-design` appears in the active skill list first; fall back to the plugin cache path (`~/.claude/plugins/cache/claude-plugins-official/frontend-design`) only if introspection isn't available; if neither is conclusive, proceed to guided-install — a spurious prompt is harmless (user confirms it's already present). Guided-install: print the install/marketplace steps, pause for the user to install, then re-detect to confirm.
   3. Report readiness before declaring init complete, using plain tokens (`[OK]` / `[WARN]` / `[PENDING]`), e.g.: `Tools: Playwright [OK] / /frontend-design [OK]`.

## Step 2: Gather project identity (one question per turn)

Per #F-001 lesson — **conversational, single open question per turn**, wait for user answer before moving to next:

1. **"Apa yang mau lo build?"** / *"What are you building?"* → short answer, 1-2 lines. Stored in `CLAUDE.md > Project Identity > What:`.

   **Do NOT ask "one-time vs gradual?" here or anywhere (#E6/M4).** The CAPTURE revolving door is **behavior-driven, not a setup choice** — a one-time dump is the degenerate path through the same door (slice = everything, nothing deferred), so the gradual machinery stays invisible/default-OFF unless real deferral or re-entry occurs. There is no mode toggle to set at init.
2. (Optional — only if session context doesn't already know the user) **"Siapa builder-nya? (nama / role / coding level / language preference)"** — default inherit from global `~/.claude/rules/` user profile if available.

Do NOT ask here:
- Domain lens → belongs in CAPTURE phase (AI will declare and confirm there)
- Deployment target → belongs in STRUCTURE phase (per CP-6 #5)
- Scope / features / roles → those are CAPTURE content, not init metadata

Keep init lightweight. Init is just the scaffolding.

## Step 3: Create files

Create in current directory:

**`storm/capture/01-braindump.md`** — frontmatter + guidance + "waiting for first idea". This is the **JOURNAL (Layer 1, #E6/M1): append-only, raw, the user's own words, NEVER overwritten** — note this property in the seed guidance comment. Its **projection** (`storm/capture/_index.md`, Layer 2 — regenerated summary) is NOT created at init; it is GENERATED on first `/storm-capture` (entry + exit). Do not seed an empty `_index.md` here — a producer-less placeholder is the exact orphan #E6/M1 removes.
**`storm/meta/parking-lot.md`** — frontmatter + "no tickets yet" + ticket format reference
**`storm/meta/framework-feedback.md`** — frontmatter + "no entries yet" + entry format + detection triggers
**`storm/meta/session-handoff.md`** — seeded with the header + `<!-- NEWEST ENTRY BELOW THIS LINE -->` marker, NO entries yet (written at each session END by `/storm-end-session`, read at session start by `/storm-start-session`):

```
# Session Handoff

> AI-maintained. NEWEST entry directly below the marker. Recovery reads only the top entry.
> Written at session END by a fresh forked sub-agent (reconstructs from git log + plan files +
> CLAUDE.md — never from conversation memory, to avoid context-bloat "dumb-zone" inaccuracy).
> Entries below the top are the project journey (ideation → production) — read on demand.

<!-- NEWEST ENTRY BELOW THIS LINE -->
```
**`storm/meta/module-status.md`** — seeded with the header + empty grid, NO module rows yet (#FF-023; maintained at REVIEW-PASS + SHIP-exit, read on-demand by `/storm-start-session` + `/storm-status`, never injected into CLAUDE.md):

```
# Module Status

> AI-maintained deploy-pipeline tracker. Read on-demand by /storm-start-session + /storm-status.
> NOT auto-loaded (kept out of CLAUDE.md to avoid per-load context tax, per #FF-024 insight).
> This is STORM's CLAIM of what it deployed; prod ground-truth lives in the deploy platform
> (Dokploy / k8s / etc). Session start reconciles this grid against git ship-tags/commits.

| Module | Slug | Phase | Staging SHA | Prod SHA | SHIP date | Notes |
|---|---|---|---|---|---|---|
```
**`.gitignore`** — STORM defaults:
```
# Claude Code — local overrides
.claude/settings.local.json
# Personal session memory
.remember/
# OS
.DS_Store
# Environment (sensitive)
.env
.env.local
.env.*.local
```

**`CLAUDE.md`** — filled from user answers:
- `# [Project Name] — STORM v1`
- `## Current State`: Phase = Pre-CAPTURE; Sub-context = STORM scaffolding complete; Last decision = STORM v1 init; Next step = run `/storm-capture`
- `## STORM Config`: Framework version = **read the current version from the loaded `storm-protocol.md` header (project-local first, else `~/.claude/rules/storm-protocol.md`) — do NOT hardcode a literal** (this is what prevented the recurring version-drift class, e.g. the old `v1.0` hardcode); Domain lens = not yet declared (set in CAPTURE); Deployment target = not yet decided (set in STRUCTURE per CP-6 #5); **Design tool: `/frontend-design` (D4 baseline per #FF-019 — fallback to `/design-shotgun` only if unavailable)**
- `## Project Identity`: What / Builder filled from answers
- `## User Profile`: default from global (Bahasa primary, zero-code, ADHD-like) or override from user answer
- `## Installed STORM Artifacts`: Note that framework docs load from global (`~/.claude/docs/storm/`); protocol loads from `~/.claude/rules/storm-protocol.md`; skills/commands from `~/.claude/skills/` and `~/.claude/commands/`
- `## Session Start Protocol` + `## Maintenance Rules` — standard sections

DO NOT copy `STORM-FRAMEWORK.md` or `STORM-WORKFLOW.md` into project. They live at `~/.claude/docs/storm/` globally.

## Step 4: Git init + first commit

If `.git/` doesn't exist:
1. `git init`
2. `git add` explicitly: `CLAUDE.md`, `.gitignore`, `storm/capture/01-braindump.md`, `storm/meta/parking-lot.md`, `storm/meta/framework-feedback.md`, `storm/meta/session-handoff.md`, `storm/meta/module-status.md`
3. Commit with STORM convention via HEREDOC:

```
storm:META::init - STORM v1 initialized for [project name]

Project: [one-line what-are-you-building summary]
Framework docs: global (~/.claude/docs/storm/)
Phase: Pre-CAPTURE; next = /storm-capture

Model: <sonnet|opus|haiku>
Felt: <ok|snappy|long>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

**Model:/Felt: trailers are MANDATORY per STORM Commit Convention** (`.claude/rules/storm-protocol.md`). Every STORM commit — including this init — requires both. No exceptions.

**Format invariant (per #FF-018):** all trailers (`Model:`, `Felt:`, `Co-Authored-By:`) MUST be in ONE contiguous block at the very end of the message — no blank lines between them. A blank line truncates `git interpret-trailers --parse` and silently breaks the measurement-extraction pipeline. The pre-commit hook (`.githooks/commit-msg`) rejects malformed blocks.

4. Verify with `git log --oneline`.

If `.git/` already exists → skip init, still commit STORM scaffolding as a new commit with same message format.

## Step 5: Announce ready

> *"STORM ready. State: Pre-CAPTURE. 6 files created, 1 commit logged.*
>
> *Tools: Playwright [OK/WARN] / /frontend-design [OK/PENDING].*
>
> *Next: run `/storm-capture` to start ideation, or pour ideas directly into `storm/capture/01-braindump.md`."*

Use small-wins narration style (CP-10).

## Principles in play

- CP-1 counselor (confirm before destructive ops like overwrite)
- CP-4 transparent narration (every step announced)
- CP-7 decision split (human picks identity; AI generates files)
- CP-10 small wins (init announced as completion milestone)
- CP-12 recovery-by-design (git init = Layer 2 from day 1; CLAUDE.md = Layer 1)

## What this command does NOT do

- **Does not install STORM framework** — assumes global install at `~/.claude/` already exists
- **Does not copy framework docs to project** — global by default; user can manually copy later for version freeze
- **Does not start CAPTURE automatically** — announces readiness; user chooses when
- **Does not configure project-level permissions** — relies on global `~/.claude/settings.json`; add `.claude/settings.json` locally only if project needs different permissions
