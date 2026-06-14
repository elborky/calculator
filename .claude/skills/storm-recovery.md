---
name: storm-recovery
description: Use at session start (first action, before any user request) and when context inconsistency is detected mid-session. Cross-checks STORM's 5 recovery layers (CLAUDE.md, git log, plan file markers, cross-check, session notes) and reports current state. Fresh project → skip recovery, announce CAPTURE start.
---

# STORM Session Recovery

Self-healing session start per CP-12. Multi-layer redundancy — no single point of failure.

## When to invoke

- **First action of every session** (before any user request is processed)
- `/storm:recover` invoked manually
- Mid-session when context inconsistency detected (e.g., CLAUDE.md says phase X but git says phase Y)

## Fresh-project detection (always check first)

If ALL of these are true:
- `CLAUDE.md` does not exist
- `storm/capture/01-braindump.md` is empty or only contains the default template
- No STORM commits in `git log`

→ Fresh project. Skip recovery. Announce:

> *"No prior STORM state detected. Entering CAPTURE (human-led).*
> *Pour ideas into `storm/capture/01-braindump.md` or tell me directly — what are you building?"*

Stop here. Do not proceed to cross-check.

## Recovery cross-check (5 layers)

### Layer 1: CLAUDE.md (AI-maintained state summary)

Read `CLAUDE.md`. Extract from `## Current State`:
- **Phase:** [e.g., BUILD]
- **Sub-context:** [e.g., module `invoicing`, task-004]
- **Last decision:** [...]
- **Next step:** [...]
- **Load these files:** [canonical docs for current context]

### Layer 2: git log (commit history)

Run `git log --oneline -20` (or `git log --oneline --since="1 week ago"`). Extract most-recent `storm:PHASE:MODULE:MILESTONE:TASK` commits. Derive implied phase/module/task from those.

### Layer 3: Plan file status markers

Find `build/*/_plan.md` and similar task-tracking files. Scan for markers:
- `[DONE]`
- `[IN PROGRESS]`
- `[PENDING]`
- `[BLOCKED]` (with reason)

Extract active task(s) from `[IN PROGRESS]` markers.

### Layer 4: Cross-check across layers

Compare Layers 1, 2, 3:
- Does CLAUDE.md `Phase:` match most-recent commit phase?
- Does CLAUDE.md `Sub-context:` match `[IN PROGRESS]` marker?
- Does "Last decision" align with recent commit messages?
- Any orphaned `[IN PROGRESS]` markers in plan files but not in CLAUDE.md?
- Any recent commits not reflected in CLAUDE.md?

## Inconsistency resolution

If layers disagree, use this priority:

1. **Git log is authoritative for what happened** — atomic commits are immutable history.
2. **Plan files are authoritative for in-flight work** — task state derives from markers.
3. **CLAUDE.md is AI-maintained summary** — rebuild from Layers 2+3 when stale.
4. **Session notes** inform decisions not yet committed — flag for formal doc update.

Reconstruction algorithm:
1. Latest `storm:PHASE:...` commit determines last-completed action
2. `[IN PROGRESS]` markers determine current active work
3. Phase = most-recent commit's phase; Sub-context = active task
4. Update CLAUDE.md to reflect reconstructed state
5. Report discrepancy to user explicitly

## Report to user (always)

After recovery, always report:

> *"Session recovered. Current state:*
> - *Phase: [X]*
> - *Sub-context: [module, task]*
> - *Last decision: [summary]*
> - *Next step: [what to do next]*
> - *[Discrepancies found and resolved, if any]*
>
> *Ready?"*

## Partial recovery (uncertainty)

If some layers are missing or uncertain (e.g., can't determine active task from ambiguous plan markers), flag it:

> *"Recovery partial. Unclear: [what's ambiguous].*
> *Possible states:*
> - *[A] — based on [evidence]*
> - *[B] — based on [evidence]*
> *Can you confirm which, or should we review together?"*

Do NOT guess state; ask when uncertain.

## Post-recovery: when to update CLAUDE.md

AI writes to CLAUDE.md proactively after:
- Task completion
- Phase transition
- Significant decision
- Module milestone
- Parking lot triage action
- Any event that shifts "Current State"

User never maintains CLAUDE.md by hand. If user's request implies state change, AI captures it in CLAUDE.md without being asked.

## Recovery + sync-cascade interplay

If recovery detects that a canonical doc was edited externally (e.g., user edited `structure/vision.md` between sessions), invoke `storm-sync-cascade` skill next — the cascade process handles the propagation.

## Report template

```
=== STORM Session Recovery ===

Layers checked:
- CLAUDE.md: [present/missing/stale]
- git log: [N recent STORM commits]
- plan files: [M IN PROGRESS markers]
- cross-check: [consistent | N discrepancies]
- session notes: [present/absent]

Reconstructed state:
  Phase: [X]
  Sub-context: [module/task]
  Last decision: [summary]
  Next step: [action]

[Discrepancies resolved:]
- [list, if any]

Ready?
```
