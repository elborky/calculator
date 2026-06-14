---
description: Enter or resume BUILD phase for the active module — task-by-task implementation via forked sonnet sub-agents
model: sonnet
---

Enter or resume STORM BUILD phase.

**Tier discipline:** each task is implemented by a forked sonnet sub-agent (via Agent tool). This guarantees tier purity regardless of session default. Main session orchestrates, sub-agent executes one task at a time.

**DISPATCH RULE (measurement integrity, per #FF-017):** every Agent tool dispatch from this command MUST:
1. Pass explicit `model: "sonnet"` on the Agent tool call. **NEVER omit** — silent inheritance from parent session corrupts the `Model:` trailer measurement signal.
2. Substitute every `{TIER}` placeholder in the prompt template with `sonnet`.
3. Sub-agent's commit trailer MUST be `Model: sonnet` matching the dispatch. Orchestrator post-check rejects on mismatch.

## Execution (orchestrator)

**Orchestrator turn-budget (per #FF-013):** cap each orchestrator turn at **≤6 tool calls**. Decompose longer chains into per-task sub-agent dispatches. Prevents stream-idle-timeouts in the main BUILD context.

1. **Invoke `storm-recovery`** to verify state and identify active module.
2. **Invoke `storm-phase-guard`** to verify SPECIFY exit criteria are met.
3. **Ensure `storm/build/<NN>-<module-slug>/_plan.md` exists:**
   - If missing: draft from `storm/specify/<NN>-<module-slug>/_index.md` task list, honoring granularity discipline (≤ 1.5 min/task, ≤ 1 file or 1 logical unit). Mark each task `[PENDING]`. Commit this plan (main session, atomic) with STORM convention + Model:/Felt: trailers.
   - If exists: identify next `[PENDING]` task or resume `[IN PROGRESS]`.
4. **For EACH pending task, dispatch a sonnet sub-agent.** Template below. Wait for completion, verify commit landed, narrate small-win (CP-10).
5. **UI-heavy task — diff-vs-baseline (v1.4 W-G30/W-G55):** after sub-agent returns, main session:
   a. Reads `storm/specify/<NN>-<module-slug>/04-ui/_picked.md` → picked variant (e.g., `mockup-v2.html`).
   b. Screenshots the live built UI for this task's screen.
   c. Runs diff along axes: color / spacing / typography / layout / component-presence / motion / accessibility — each cited against `08-design-system.md` and baseline mockup.
   d. **If material divergence:** AI self-flags with structured options *"(a) accept divergence + update _picked.md rationale, (b) fix and re-diff, (c) escalate to SPECIFY loop-back."* Replaces vague *"matches your vision?"* checkpoint.
   e. On (b): dispatch follow-up sonnet sub-agent with diff-list as feedback; re-diff after.
   f. Once cleared OR (a)-accepted → proceed to next task.
6. **Session-end hygiene:** ensure CLAUDE.md reflects `[IN PROGRESS]` task; narrate stopping point.

## Sub-agent dispatch template (Agent tool)

Invoke via the Agent tool with:

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017).
- `description`: `STORM BUILD task <NNN> <module>`
- `prompt`: fill the template below with task-specific values — substitute every `{TIER}` with `sonnet`, AND paste the craft-floor *Operative core* inline (conditional on this task's output-type — code/UI/security/data; per WORKFLOW §8.7.3, keep it thin — operative core only, not the whole file).

```
You are a STORM BUILD sub-agent running on {TIER} tier. Execute ONE task.

WORKING DIRECTORY: <CWD of the STORM project>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md (load first for commit convention + recovery rules)

CRAFT FLOOR (C3 — iron-law, always-high, no dial; per protocol §"Caliber — Craft Floor", WORKFLOW §1.4 + §8.7.3):
Your output is held to the framework-universal craft floor. The orchestrator quotes the floor's *operative core* inline below, JIT and **conditional on this task's output discipline** (code / UI / security / data) — read the matching floor, not all of them (CP-14). The full standard is `~/.claude/docs/storm/craft-floor.md` (dev-time fallback: `docs/craft-floor.md`) — read it on demand for the per-discipline MUSTs/SHOULDs.
<orchestrator: paste the *Operative core* block from craft-floor.md here, conditional on output-type — code floor for a code task; do NOT paste the UI/security/data floors into a code agent. Cite the full standard by path.>
Self-check against the floor (sieve 1) before returning — but know your self-report is a DRAFT verdict only: the machine gate (REVIEW L7 static guards) + independent L8 reviewer (sieve 4) verify it, never trust it. Cite the check that ran, not the intention.

TASK: <task-NNN title from _plan.md>
MODULE: <module name> (folder: storm/build/<NN>-<module-slug>/)
SPEC REFERENCE: storm/specify/<NN>-<module-slug>/_index.md (read relevant sections)
PRIOR WORK CONTEXT: <brief — what existing files this task touches, related tasks already done>
ACCEPTANCE (for this task): <what "done" means for this task, 1-3 bullet points>

STEPS:
1. Create storm/build/<NN>-<module-slug>/<NNN>-task-name/context.md (what, why, spec refs).
2. Mark task [IN PROGRESS] in storm/build/<NN>-<module-slug>/_plan.md.
3. Update CLAUDE.md current task field (recovery hygiene).
4. Write the code in src/ — ≤ 1 file or 1 logical unit per STORM granularity discipline.
5. Run self-test (unit + integration as applicable). Log result to storm/build/<NN>-<module-slug>/<NNN>-task-name/test-results.md.
5b. **Runtime smoke (per #E4 axis-2, mandatory):** beyond the tests, actually EXERCISE the surface this task built once at runtime — load the page / hit the route / run the migration — and confirm zero runtime crash. Green tests ≠ verified: a unit test does not exercise the real render/SQL/wiring path (the class of within-module crash that otherwise only surfaces at REVIEW). Note the runtime-smoke result in test-results.md. (Not a new layer/file — it is what "verify the task works" means. Scoped to within-module runtime; cross-module/deploy seams are SHIP staging-smoke's job.)
6. Mark [DONE] in _plan.md.
7. Commit atomically with STORM convention:
   Subject: storm:BUILD:<module>:m<N>:task-<NNN> - <short desc>
   Trailer (mandatory):
     Model: {TIER}
     Felt: <your honest assessment: ok | snappy | long>

HARD RULES:
- ONE commit. Do NOT batch this task with any other. If work spans multiple files, they all go in this one commit.
- Trailers MUST be present. No exceptions.
- NO user interaction. If context is insufficient, return a diagnostic to the orchestrator and stop.
- **FORBIDDEN from firing any module-exit, REVIEW-trigger, or BUILD-complete marker (per #FF-009b).** Only this task's atomic commit. Orchestrator owns the exit marker after cross-task validation.

RETURN to orchestrator: task status (DONE | BLOCKED), commit hash, 1-line summary, any blockers surfaced.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

## Post-dispatch checks (orchestrator)

After each sub-agent returns:

1. Run `git log -1 --pretty='%s %(trailers:key=Model,valueonly=true)'` → verify commit subject matches expected pattern AND Model trailer matches the value passed to `model:` Agent-tool param at dispatch (per #FF-017 — reject on mismatch).
2. If no new commit or trailer wrong → flag as regression, halt loop, surface to user.
3. Small-win narration: *"Task N/M complete in module <X>: <1-line summary>."*
4. Continue loop to next pending task.

## Exit (per module)

- All tasks `[DONE]` in `storm/build/<NN>-<module-slug>/_plan.md`
- End-to-end flow runs (not half-done) — **"runs" means it was actually run**: every built surface exercised once at runtime with zero crash (per step 5b), not merely "tests green"
- Self-tests pass
- Module marked ready for REVIEW
- Main session commits exit marker: `storm:BUILD:<module>:: - module complete, ready for REVIEW` with Model:/Felt: trailers (main session's tier)

## Anti-stuck

- Task sub-agent returns BLOCKED → surface to user with diagnostic; consider SPECIFY loop-back.
- Sub-agent fails (no commit, no response): halt orchestrator, surface error. Do NOT silently retry — user decides.
- Two sub-agents in a row failing on same module → invoke `storm-phase-guard` anti-stuck protocol.

## Principles in play

- CP-4 narration (orchestrator announces each dispatch + result)
- CP-7 decision split (user reviews RESULTS, not code)
- CP-10 small wins (per-task narration)
- CP-11 exit (per module, verifiable)
- CP-12 recovery (atomic commits per task + CLAUDE.md updated)
- Model tiering discipline — **enforced via forked dispatch**, not aspirational
