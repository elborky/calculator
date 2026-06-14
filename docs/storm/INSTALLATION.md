# STORM Installation Guide

Install STORM (Structured Thinking Out of Raw Mess) v1.5.0 for Claude Code.

**Who this is for:** non-coder builders using Claude Code who want a structured framework for long-running AI-assisted projects.

---

## What Gets Installed

**Global (user-level, shared across all projects):**
- `~/.claude/rules/storm-protocol.md` — always-loaded behavioral rules
- `~/.claude/skills/storm-*.md` — 5 skills (phase-guard, sync-cascade, recovery, friction-detector, hat-switch)
- `~/.claude/commands/storm-*.md` — 15 slash commands (capture, structure, specify, build, review, ship, status, park, feedback, recover, init, audit, run-scenario, start-session, end-session)
- `~/.claude/docs/storm/` — framework docs (FRAMEWORK, WORKFLOW, INSTALLATION, USER-GUIDE, MANUAL, craft-floor)

**Per-project (created by `/storm-init`):**
- `CLAUDE.md` — project memory (AI-maintained)
- `storm/capture/01-braindump.md` — CAPTURE canonical input
- `storm/meta/parking-lot.md` — out-of-scope ideas
- `storm/meta/framework-feedback.md` — STORM friction log
- `.gitignore` — standard exclusions

---

## Prerequisites

- **Claude Code** installed and working
- **Git** available in shell (`git --version` returns a version)
- A directory for your project (new or existing)

---

## Part 1: Global Install (one-time)

### Option A: Copy from an existing STORM-installed project

If you already have STORM in a reference project:

```bash
# From your STORM-installed project root
mkdir -p ~/.claude/commands ~/.claude/skills ~/.claude/docs/storm
cp .claude/rules/storm-protocol.md ~/.claude/rules/
cp .claude/skills/storm-*.md ~/.claude/skills/
cp .claude/commands/storm-*.md ~/.claude/commands/
cp STORM-FRAMEWORK.md STORM-WORKFLOW.md ~/.claude/docs/storm/
```

### Option B: Ask Claude Code

In a session where STORM isn't installed globally yet, ask:
> *"Install STORM v1 globally from [source path]."*

Claude will copy the files per the structure above.

### Verification

After install, start a new Claude Code session in any directory. Type `/storm-status`. If the command is recognized, global install succeeded.

Also check:
```bash
ls ~/.claude/rules/storm-*.md
ls ~/.claude/skills/storm-*.md
ls ~/.claude/commands/storm-*.md
ls ~/.claude/docs/storm/
```

All five should return file listings.

---

## Part 2: Bootstrap a New Project

Once global install is done, every new project starts with:

```bash
mkdir ~/my-new-project
cd ~/my-new-project
# Start Claude Code in this directory
```

Then in the Claude Code session:

```
/storm-init
```

`/storm-init` does:
1. Asks what you're building (conversational, one question at a time)
2. Creates `storm/` starter files + `CLAUDE.md` template + `.gitignore`
3. Runs `git init` + creates first commit with STORM convention
4. Announces "STORM ready — state: Pre-CAPTURE"

After init, you're ready to start the actual work:

```
/storm-capture
```

---

## Part 3: Convert an Existing Project

If you have an existing project (with code, docs, or both) and want to adopt STORM:

```bash
cd ~/existing-project
# Start Claude Code here
/storm-init
```

`/storm-init` detects existing files. If it finds existing `CLAUDE.md`, `storm/`, or `.claude/rules/storm-protocol.md`, it warns and asks:
- **cancel** (safe default)
- **inspect** (show what was found)
- **overwrite** (destructive — use with caution)

**Manual alternative:** create `storm/` + starter files yourself, then ask Claude to fill in `CLAUDE.md` from existing project context.

---

## Verification Checklist

After install + init, verify each works:

- [ ] `/storm-status` returns structured state report (expect "Pre-CAPTURE" on fresh project)
- [ ] `/storm-recover` runs 5-layer cross-check
- [ ] `/storm-capture` enters CAPTURE phase properly
- [ ] Framework docs readable: `cat ~/.claude/docs/storm/STORM-FRAMEWORK.md | head -20`
- [ ] Protocol loaded: ask Claude *"what phase are we in?"* — it should refer to STORM phases, not generic dev phases
- [ ] Per-project artifacts exist: `ls storm/capture/ storm/meta/` shows the starter files

---

## Upgrade (when STORM evolves)

Since skills, commands, rules, and docs are global, upgrading is just re-copying:

```bash
# From the new STORM release directory
cp -f storm-protocol.md ~/.claude/rules/
cp -f skills/storm-*.md ~/.claude/skills/
cp -f commands/storm-*.md ~/.claude/commands/
cp -f docs/*.md ~/.claude/docs/storm/
```

All existing STORM projects automatically pick up the new version on the next session. Projects that copied framework docs locally for version-freeze stay on their frozen version (project-local override).

---

## Uninstall

Remove global install:

```bash
rm ~/.claude/rules/storm-protocol.md
rm ~/.claude/skills/storm-*.md
rm ~/.claude/commands/storm-*.md
rm -rf ~/.claude/docs/storm/
```

Per-project artifacts (`CLAUDE.md`, `storm/`, `src/`, etc.) stay untouched. Remove them per project if desired.

---

## Troubleshooting

**"/storm-* command not found"**
→ Global install incomplete or Claude Code session started before install. Verify files exist at `~/.claude/commands/storm-*.md`. Restart the Claude Code session.

**"Framework reference STORM-FRAMEWORK.md not found"**
→ Rules loaded but docs missing. Check `~/.claude/docs/storm/STORM-FRAMEWORK.md` exists. Re-copy from source if not.

**"Claude doesn't follow STORM protocol"**
→ Rules file might not be auto-loaded. Verify `~/.claude/rules/storm-protocol.md` is readable (`cat` it to test). Rules in `~/.claude/rules/` load for every Claude Code session globally.

**"Wrong behavior in one project, right in another"**
→ Project-level `.claude/rules/storm-protocol.md` in the first project overrides global. Either sync it manually or remove the project-level file to inherit global.

**"Duplicate `/storm-*` commands showing up"**
→ Both global and project-level copies exist. Expected. Project-level takes precedence.

**"/storm-init complained about existing files"**
→ Safe default. Use `inspect` to see what was found, then decide. Never use `overwrite` without knowing what you're destroying.

---

## Next Steps

- New to STORM? → `USER-GUIDE.md`
- Need command / skill / file reference? → `MANUAL.md`
- Want the philosophy? → `STORM-FRAMEWORK.md`
- Implementation deep-dive? → `STORM-WORKFLOW.md`

---

*STORM v1.5.0 — field-validated against real multi-session projects. Log friction you encounter via `/storm-feedback`.*
