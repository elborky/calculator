---
description: THE session closer — synthesize a ground-truth session handoff so the next session resumes cleanly
model: inherit
---

Close a STORM work session. This is the routine session closer — symmetric with `/storm-start-session`.

It writes a session-handoff entry whose **facts** are reconstructed from GROUND TRUTH (git + plan files + CLAUDE.md), NOT from conversation memory — the AI's late-session context can drift into the "dumb-zone", so the factual reconstruction is regenerated fresh to stay accurate. **Verbal-only decisions and open-questions** (knowledge only the orchestrator holds, not yet in git) are bridged across via a bounded outbox file so they are not lost (#F-012). The next `/storm-start-session` reads this entry.

## Execution

1. **FLUSH verbal-only items to the outbox (#F-012) — BEFORE dispatch.** If any decision or open-question was made *verbally this session* and is NOT yet captured in git / CLAUDE.md (e.g. an execution-order choice, a just-locked design call), the orchestrator (main context) writes them — bounded, a few one-liners — to `storm/meta/session-delta.md`, OVERWRITING prior content. Each item notes whether it is a `decision` (→ 🔒 Decided) or an `open-question` (→ ⏳ Pending). This is the durable bridge for knowledge the ground-truth sub-agent is structurally blind to. **Skip this step only if no verbal-only items were made this session** (then write/leave the file empty). Keep it bounded (CP-14) — this is a delta, not a journal.

2. **DISPATCH a FRESH forked sub-agent** (Agent tool — set **`model: sonnet`** explicitly on the dispatch) to synthesize the handoff entry:
   - **Tier guard:** dispatch the handoff sub-agent via the **Agent tool** with `model: sonnet` (the command frontmatter stays `inherit` — do NOT add a command-level model switch). This keeps the fork at standard context. On dispatch failure, the step-5 `[unverified]` fallback is the backstop.
   - **FACTS — from ground truth ONLY:**
     - `git log` of this session's commits (history),
     - `storm/build/*/_plan.md` `[IN PROGRESS]` / `[BLOCKED]` markers (in-flight work),
     - `CLAUDE.md` current-state section (durable state).
   - **VERBAL-ONLY items — from the outbox:** read `storm/meta/session-delta.md`; fold each item into the matching field (decisions → 🔒 Decided, open-questions → ⏳ Pending) and **tag it `[conversation-claim]`** so the next session knows to confirm it. Treat these as already-trusted orchestrator input — do NOT try to re-verify them against git (they are verbal by nature; absence from git is expected, not a discrepancy).
   - **Explicitly instruct the sub-agent NOT to rely on conversation memory for facts** — reconstruct those only from the ground-truth artifacts above. The outbox is the ONLY channel for conversation-sourced content. This avoids the late-session context-bloat "dumb-zone" producing an inaccurate handoff while still capturing verbal decisions.
   - The sub-agent writes a NEW TOP entry into `storm/meta/session-handoff.md`, inserted immediately AFTER the `<!-- NEWEST ENTRY BELOW THIS LINE -->` marker (bounded write — never rewrite the whole file). Entry has the 4 fields + anchor:

   ```
   ## [YYYY-MM-DD HH:MM] — [phase / module] — anchor: <current HEAD SHA>
   - ✅ **Done this session:** ...
   - 🔒 **Decided:** ... (+ 1-line why each)
   - ⏳ **Pending — needs YOUR decision:** ... (carry forward unresolved items; "none" if clean)
   - ➡️ **Next:** ...
   ```

   - `anchor` = current `HEAD` SHA.
   - The sub-agent runs the **CP-13 7-dim audit** before committing (audit embedded in commit body). If verdict = `DO-NOT-PROCEED-AS-IS`, it does NOT commit and returns to the orchestrator with the failed dim + alternative.
   - The sub-agent commits with mandatory `Model:` / `Felt:` trailers (contiguous block, no blank line before `Co-Authored-By:`).

3. **Confirm with the user** — the orchestrator shows the user the drafted handoff summary and asks: *"Ada keputusan atau pending yang kelewat?"* The USER confirms the business / decision content (only the human owns vision + business decisions, per CP-7). The AI does not autonomously decide what counts as a pending decision. `[conversation-claim]` items are exactly what the user is best positioned to confirm or correct here.

4. **On confirm** → ensure the entry is committed; update `CLAUDE.md` durable state if the phase / module changed this session.

5. **FALLBACK (MANDATORY)** — if the sub-agent dispatch fails (e.g. a stream-idle-timeout or a 1M-context credit error), the orchestrator (main context) writes a MINIMAL handoff entry itself, tagged `[unverified — written by main context]`, noting the failure cause, so continuity is NEVER lost. Because step 1 already flushed verbal-only items to `storm/meta/session-delta.md`, the fallback reads that file off disk and folds those items (tagged `[conversation-claim]`) into the minimal entry — they survive the dispatch failure. Flag to the user that the entry was not reconstructed from a fresh context.

## When to run

- At the end of every work session (the routine closer).
- Before a deliberate context switch where the next session may be a different person / much later.

## Tone

Brief, reassuring. The user should leave the session confident the thread is captured.

## Principles in play

- CP-4 transparent narration (drafted handoff shown before commit)
- CP-7 decision split (human confirms business / decision content)
- CP-12 recovery-by-design (handoff = bounded resume anchor for next session)
- CP-13 self-critique (sub-agent audits before committing)
- CP-14 context economy (#F-012: verbal-decision outbox is on-demand `storm/meta/*.md`, never injected into auto-loaded CLAUDE.md; bounded, overwritten each exit)
