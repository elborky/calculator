# Session Delta — verbal-only outbox (#F-012)

> Written by orchestrator at session EXIT. Overwritten each exit. Sub-agent reads this to fold in
> [conversation-claim] items. Bounded (CP-14) — a delta, not a journal.

## Session: 2026-06-15 (SPECIFY M3 complete → BUILD M3 started, gate-blocked)

### Verbal decisions (not yet in any committed artifact)

1. **BUILD M3 execution strategy = per-file-unit batching (CP-7 technical, AI-autonomous).**
   The `_index.md` deliberately split M3 into 44 micro-tasks (T-201..T-244) for *planning legibility*
   (decision D-008). For EXECUTION, the orchestrator collapses same-file/one-logical-unit rows into
   ~8 forked-sonnet dispatches = ~8 atomic commits (e.g. T-201..205 = one "tape data module" commit;
   T-206..208 = one "state.ts seam" commit; T-223..230 = one "tape CSS" commit). Each commit still
   traces to its T-range, stays tier-pure sonnet, recovery stays atomic. Rationale: 44 serial forks
   = over-ceremony + wall-clock grind that hits the CP-13 friction dim for the restless/ADHD profile.
   Tradeoff named: literal-44-commit measurement granularity sacrificed for momentum (per-unit commits
   keep full traceability, so the loss is minimal). **Not yet recorded in any durable doc** — fold into
   the BUILD `_plan.md` header or `_decisions.md` next session if continued.

2. **Parallel-wave bookkeeping ownership (CP-7 technical).** When BUILD waves run forked sub-agents in
   parallel, the agents do NOT edit the shared `_plan.md` / `CLAUDE.md` (would race/conflict). The
   orchestrator owns those updates centrally after each wave + runs the deterministic sieve-2 verify.
   Agents commit only their code + unique per-unit `context.md`/`test-results.md`. Adaptation of the
   storm-build template's per-task plan-marking, for safe parallelism.

### Open question carried (needs owner action next session)

3. **#FF-037 credits-gate BLOCKS BUILD M3 — must resolve before any forked dispatch.** At BUILD M3 start
   the 3 Wave-1 forks were rejected: *"Usage credits required for 1M context."* (Same gate as REVIEW M2,
   #FF-008/#FF-037 — environmental/late-session, correlates with the orchestrator at 1M; not a code bug.)
   Owner picked **option A (switch session to standard context via `/model`)** as the fix — BUT the
   `/model` invocation **kept** Opus 4.8 (1M context) (the standard option wasn't selected), then owner
   ended the session. So the gate is STILL active and BUILD M3 cannot dispatch forks yet.
   **Resolution options for next session (owner picks):**
   - **(A, recommended)** `/model` → actually select a **standard (non-1M)** context → forks resume free.
   - **(B)** `/usage-credits` ON → forks run at 1M (costs credits).
   - **(C)** "gas inline" → orchestrator runs tasks inline (no cost; pollutes context = dumb-zone risk +
     degrades tier measurement; stamp `Intended: sonnet (forced-inline — #FF-037)` on those commits).

4. **(Carried from prior session, still open, non-blocker)** Re-run REVIEW M2 forked once credits enabled,
   for a clean tier-measurement baseline (this session's REVIEW ran inline `Model: opus`). Verdict PASS
   stands regardless.
