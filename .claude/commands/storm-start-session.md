---
description: THE session opener — recover state, read last handoff, report continuity (symmetric with /storm-end-session)
model: sonnet
---

Open a STORM work session. This is the routine session opener — symmetric with `/storm-end-session`.

It recovers state, reads the last session's handoff, and reports continuity so the user knows
exactly where they left off. For a quick mid-session peek use `/storm-status`; to repair a
suspected-bad state use `/storm-recover`.

## Execution

1. **Read STORM version** (relocated from `/storm-status` per parking #004) — load the first line of the loaded `storm-protocol.md` to surface the active framework version. Resolution order matches the rules-loader precedence:
   - Project-local first: `.claude/rules/storm-protocol.md`
   - Global fallback: `~/.claude/rules/storm-protocol.md`
   - If neither exists: report `STORM version: unknown (protocol file not found)`
   - Extract the version token from the header line (e.g. `# STORM Protocol v1.4.5` → `v1.4.5`). Note which path loaded (project / global) so the user can spot stale local freezes.
   - **Header-vs-tag decoupling (anti-stale-doubt):** the header version is the last **graduated** release; an in-flight checkpoint above it lives only as a **git tag** (e.g. header `v1.5.0` but the repo is at `v1.6.0-rc.1`). Run `git describe --tags 2>/dev/null` to read the nearest tag. If the tag exists AND its version differs from the header → surface BOTH in the report so the gap reads as *intentional*, not stale (this is the exact doubt that the bare header triggered in the field). If no tag, or the tag matches the header → show the header alone.

2. **Invoke `storm-recovery` skill** — full 5-layer cross-check (CLAUDE.md, git log, plan files, cross-check, session handoff).

3. **Read the last handoff** — read ONLY the TOP entry of `storm/meta/session-handoff.md` (bounded read, e.g. `Read` with `limit` ~40 lines). Do NOT read the whole file — entries below the top are the project journey, read on demand only.

4. **Continuity check (VISIBLE)** — compare the handoff top-entry `anchor: <commit-SHA>` plus its `➡️ Next` / `⏳ Pending` against:
   - `git log` (authoritative for history),
   - plan-file `[IN PROGRESS]` / `[BLOCKED]` markers (authoritative for in-flight work),
   - `CLAUDE.md` current state.
   Report `✅ continuity selaras` if aligned, or `⚠️ beda → reconciled from git (authoritative)` if the handoff is stale, and reconstruct the correct state.

5. **Carry-forward** — surface any unresolved `⏳ Pending — needs YOUR decision` items from the top entry. These MUST be re-declared every session until the user resolves them — do not drop them. **Items tagged `[conversation-claim]` (#F-012)** — verbal-only decisions/open-questions bridged in via the prior session's outbox — get explicit treatment: re-surface them flagged as *"belum dikonfirmasi (dari obrolan sesi lalu)"* and invite the user to confirm or correct. Once confirmed, the claim becomes durable (it lands in the relevant artifact / next handoff untagged); until then it keeps carrying forward.

6. **Read module-status tracker (#FF-023)** — if `storm/meta/module-status.md` exists, read it (on-demand; do NOT inject into CLAUDE.md). Reconcile the grid's `Prod SHA` against git ship-tags/commits (claim-vs-truth, same pattern as the handoff anchor). Surface a compact pipeline line in the report (which modules are PROD / STAGING / in-flight). If the grid is stale vs git → note `⚠️ module-status reconciled from git`. Skip silently if the file doesn't exist (pre-SHIP projects).

7. **Report** (structured, human-facing, Bahasa-friendly):

```
=== STORM Session Start ===

Framework:   STORM Protocol vX.Y.Z (loaded from <project | global>)
             # when a higher git tag exists, show the decoupling explicitly, e.g.:
             # STORM v1.5.0 (graduated) — git checkpoint v1.6.0-rc.1 (loaded from project)

Last handoff: [top-entry date] — [phase / module] — anchor [SHA]
- ✅ Done last session: [summary]
- ⏳ Pending — needs YOU: [carried-forward decisions, or "none"]
- ➡️ Next: [concrete next action]

Pipeline (module-status.md, if present): [N modules — X PROD, Y STAGING, Z in-flight; or "n/a (pre-SHIP)"]

Continuity: ✅ selaras | ⚠️ beda → reconciled from git (authoritative)

Ready?
```

If continuity is clean AND there are no pending decisions → add a brief congratulation / encouragement (CP-10 dopamine for the ADHD profile, e.g. *"State bersih, nyambung mulus dari sesi lalu. Lanjut santai. 💪"*).

## When to run

- At the start of every work session (the routine opener).
- After any break long enough that you've lost the thread.

## Tone

Fast, scannable, reassuring. The whole point is continuity confidence — the user must feel the
thread is unbroken before any new work begins.

**Match the learned register from turn-1 (Tone Learning, C2).** The auto-loaded `MEMORY.md`
surfaces learned tone preferences (e.g. `feedback_plain_language` → simple Bahasa + analogies);
consult them so the opener already speaks in the user's register rather than re-deriving it each
session. No memory yet → mirror the register of the user's first message; never ask how to talk.

## Principles in play

- CP-4 transparent narration (continuity check is visible)
- CP-10 small wins (clean-continuity congratulation)
- CP-12 recovery-by-design (5-layer cross-check + handoff)
