---
description: Report current STORM state — phase, module, task, last decision, next step
model: haiku
---

Report current STORM project state — a lightweight, READ-ONLY mid-session peek.

> Quick mid-session peek. For session open use `/storm-start-session`; to repair suspected-bad state use `/storm-recover`.

This command does NOT cross-check or reconstruct. It just reads the current durable state and the
last handoff and reports them fast. No writes, no recovery-skill invocation.

## Execution

**Guard:** if `CLAUDE.md` or `storm/` does not exist → report *"Project not STORM-initialized. Run `/storm-init` first."* and stop.

1. **Read current state** — read the `## Current State` section of `CLAUDE.md`.
2. **Read last handoff** — read ONLY the TOP entry of `storm/meta/session-handoff.md` (bounded read).
3. **Read module-status (#FF-023)** — if `storm/meta/module-status.md` exists, read the grid (on-demand; no reconcile, no writes — this is a peek). Skip silently if absent.
4. **Report in structured format:**

```
=== STORM Status ===

Phase:        [X]
Sub-context:  [module / task / review event]
Last decision: [summary]
Next step:    [concrete next action]

Last handoff: [top-entry date — phase / module]

Pipeline (module-status.md): [N modules — X PROD, Y STAGING, Z in-flight; or "n/a"]

Backlog:
- Parking lot (storm/meta/parking-lot.md):       [N active tickets]
- Framework feedback (storm/meta/framework-feedback.md): [M active entries]

Ready?
```

5. **Lightweight nudges** (do not require action):
   - If parking lot >5 active tickets: *"Consider `/storm-park review` at next phase boundary."*
   - If framework-feedback >3 active entries: *"Consider `/storm-feedback review` at next checkpoint."*
   - If `[BLOCKED]` markers in plan files: *"Task [X] is blocked — root cause?"*

## When to run

- User asks *"where are we?"* / *"di mana sekarang?"* mid-session
- A quick glance at current state — NOT the session opener (use `/storm-start-session`)
- Before major decisions (phase transitions, scope changes)

For session open use `/storm-start-session`; to repair suspected-bad state use `/storm-recover`.

## Tone

Fast, scannable, visibly-progressive. This is a checkpoint, not a deep report — keep it tight.
