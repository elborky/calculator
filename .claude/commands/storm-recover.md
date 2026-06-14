---
description: Force STORM recovery cross-check and report current state (5 layers per CP-12)
model: sonnet
---

Force full STORM recovery cross-check.

> Use when state looks wrong / stale (mid-session, post-crash, or a botched start). NOT the routine opener — routine session open = `/storm-start-session`.

## Execution

**Guard:** if `CLAUDE.md` or `storm/` does not exist → report *"Project not STORM-initialized. Run `/storm-init` first."* and stop.

**Invoke `storm-recovery` skill** with full cross-check across 5 layers:

1. **Layer 1 — CLAUDE.md**: read current-state section
2. **Layer 2 — git log**: run `git log --oneline -20`, extract `storm:PHASE:...` commits
3. **Layer 3 — plan files**: scan `storm/build/*/_plan.md` for `[IN PROGRESS]` / `[BLOCKED]` markers
4. **Layer 4 — session handoff**: read the TOP entry of `storm/meta/session-handoff.md`; cross-check its `anchor: <commit-SHA>` plus its `➡️ Next` / `⏳ Pending` against git log + plan files
5. **Layer 5 — cross-check**: compare Layers 1/2/3/4 for inconsistencies

Resolve discrepancies per Layer 4 algorithm:
- Git log = authoritative for history
- Plan files = authoritative for in-flight work
- CLAUDE.md = AI-maintained summary, rebuild from Layers 2+3 if stale

Update `CLAUDE.md` if reconstruction needed. Report findings.

## Report format

Use the full template from `storm-recovery` skill:

```
=== STORM Session Recovery ===

Layers checked:
- CLAUDE.md:       [present / missing / stale]
- git log:         [N recent STORM commits]
- plan files:      [M IN PROGRESS markers]
- session handoff: [top entry date — anchor SHA matches git? Y/N; pending carried?]
- cross-check:     [consistent | N discrepancies]

Reconstructed state:
  Phase:         [X]
  Sub-context:   [module / task]
  Last decision: [summary]
  Next step:     [action]

[Discrepancies resolved:]
- [list, if any]

Ready?
```

## When to use

- Session feels off — state seems wrong, or a `/storm-start-session` open looked inconsistent
- After git operations (branch switch, revert, rebase) that changed visible commits
- After external doc edits (user edited canonical files directly)
- After a crash / hard interruption where the session never closed cleanly
- When multiple sessions have been interrupted/resumed and state is unclear

Most sessions don't need this — the routine opener `/storm-start-session` already runs the recovery cross-check. Reach for `/storm-recover` only when something looks wrong.

## Principles in play

- CP-4 transparent (always report findings)
- CP-12 recovery (AI-maintained, multi-layer, self-healing)
