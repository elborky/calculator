---
storm-depends-on: []
storm-phase: meta
storm-canonical: false
---

# Framework Feedback

> AI-maintained. Logs friction with the STORM framework itself (not project ideas — those go to parking-lot.md).
> Entries feed back into STORM evolution.

## Detection Triggers

- Same clarifying question asked 3+ times on same topic
- Same frustration pattern circled back 2+ times in 5 turns
- Explicit "I don't understand the framework here"
- AI detects principle ambiguity during decision-making
- Workflow step with no clear next action

## Entry Format

```
### #NNN — [Short title]
- **Date:** YYYY-MM-DD
- **Phase:** [phase where friction occurred]
- **Category:** principle-ambiguity | missing-step | over-complexity | under-specification | other
- **Severity:** low | medium | high | blocking
- **Description:** [what happened, verbatim if possible]
- **Proposed fix:** [if obvious]
- **Status:** open | acknowledged | resolved
```

---

### #001 — storm-init .gitignore template omits node_modules despite provisioning test-tooling/node_modules
- **Date:** 2026-06-14
- **Phase:** CAPTURE (surfaced at CAPTURE exit commit)
- **Category:** missing-step
- **Severity:** medium
- **Description:** `/storm-init` auto-installs Playwright into `test-tooling/node_modules/` for non-Node projects, but the `.gitignore` it writes does NOT list `node_modules/` or `test-tooling/node_modules/`. At CAPTURE exit the orchestrator ran `git add -A` and swept ~357k lines of node_modules into a commit (f6f1d21). Two contributing causes: (a) **framework gap** — init's gitignore template should include `node_modules/` whenever it provisions Playwright in `test-tooling/`; (b) **orchestrator execution slip** — used `git add -A` for an exit-marker commit that should have been `--allow-empty` with no staging. Cleaned up in commit (untracked + gitignored).
- **Proposed fix:** (1) add `node_modules/` + `test-tooling/node_modules/` to the storm-init `.gitignore` template's Node block. (2) Reinforce in storm-capture/exit guidance: exit-marker commits use `--allow-empty`, never `git add -A`.
- **Status:** open

### #002 — Batched multi-task BUILD sub-agents leave _plan.md status rows stale (recovery hazard)

- **Date:** 2026-06-15
- **Phase:** BUILD (M1 calculation engine)
- **Category:** under-specification
- **Severity:** medium
- **Description:** To go faster, the orchestrator dispatched several BUILD sub-agents each handling a *batch* of tasks (e.g. T-064–T-074 in one dispatch) rather than one task per dispatch as the `storm-build` template assumes. The sub-agents reliably produced correct atomic commits (80 task commits, 59 tests green, exit marker fired), BUT did not reliably flip every `_plan.md` status row from `[PENDING]` → `[DONE]`. At session exit `_plan.md` showed 38 `[PENDING]` + 1 `[IN PROGRESS]` while git proved all tasks done. `_plan.md` `[IN PROGRESS]`/`[PENDING]` markers are a Recovery-Layer-3 source — a stale plan would make next-session cross-check falsely report unfinished work. Caught + reconciled at exit (orchestrator synced all 80 task rows to `[DONE]` against git ground truth). Root cause: the per-task `_plan.md` update is an in-band step the sub-agent owns, but with N tasks in one dispatch the agent treats the plan-sync as best-effort and drops rows under context pressure.
- **Proposed fix:** one of — (a) keep BUILD dispatches strictly one-task-per-agent (slower, but the template's plan-sync invariant holds), OR (b) if batching is allowed for speed, make the orchestrator do a **post-batch plan reconcile against git** as a mandatory step (don't trust the sub-agent's in-band row flips), OR (c) drop per-row plan status entirely and derive task completion from git task-NNN commits at recovery time (git is already ground truth — the `_plan.md` status column may be redundant bookkeeping that invites drift).
- **Status:** open

### #003 — #FF-037 credits-gate blocks ALL forked sub-agent dispatch when orchestrator runs in 1M context — pattern is recurring and fix is always the same
- **Date:** 2026-06-15
- **Phase:** BUILD (observed in M3, SHIP, and M4 Wave 1 — every BUILD/SHIP session)
- **Category:** missing-step
- **Severity:** high (blocking — every BUILD/SHIP session hits this until user manually turns off 1M context)
- **Description:** The #FF-037 credits-gate fires whenever the orchestrator session is in 1M context mode AND a forked sub-agent is dispatched via the Agent tool (e.g. `model: "sonnet"`). Error: *"API Error: Usage credits required for 1M context."* This has now happened in three separate sessions without fail — BUILD M3, SHIP, and BUILD M4 Wave 1. Every single time, turning off 1M context resolves it cleanly (forked dispatch succeeds 100% of the time in standard context). The framework documents #FF-037 and the `Intended:` trailer convention, and `storm-protocol.md §"Recommended runtime"` already recommends `orchestrator-1M / fork-200K` — but the documentation assumes the user understands these are separate credit concerns. In practice, when the user opens a 1M session, ALL Agent-tool dispatches hit the 1M credit reservation, blocking the fork. Result: the same diagnostic Q&A fires every BUILD session. User verbatim: *"selalu kena credits-gate FF-037 dan selalu jalan mulus kalo 1M context di matiin. perlu di pertimbangkan untuk ini di permanentkan sehingga tidak selalu muncul pertanyaan ini."*
- **Proposed fix:** Add a **mandatory pre-dispatch orchestrator context check** to `storm-build.md` and `storm-ship.md`: BEFORE dispatching any forked sub-agent, announce if the session appears to be in 1M context mode and recommend switching to standard context. This converts the recurring surprised-wall into a known, anticipated gate. Also add an explicit warning to `storm-protocol.md §"Recommended runtime"` that running the orchestrator in 1M AND dispatching forked sub-agents in the same session requires the user's Claude plan to support per-fork 200K billing independently of the 1M session reservation — and that if that billing path is unavailable, the fork will be blocked by the credits-gate; recommended mitigation is to run orchestrator at standard context during BUILD/SHIP phases.
- **Status:** open
