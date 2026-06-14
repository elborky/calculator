---
description: Test-harness — run a frozen STORM scenario end-to-end with model tiering guaranteed via forked sub-agents (zero real-time user interaction)
argument-hint: <scenario-name> (e.g., scenario-01-urlshortener)
model: sonnet
---

# STORM Scenario Runner

**Test-harness command. NOT for production STORM runs.**

Execute a pre-scripted scenario from `testing/scenarios/` through all 6 STORM phases. Each phase dispatched to a **forked sub-agent with the phase's declared model tier**, guaranteeing measurement accuracy immune to the main-session default model.

Arguments: $ARGUMENTS (scenario name without `.md`)

## Preconditions

1. **CWD is a fresh git repo for the test project** (run this command from there, NOT from the storm-framework dir)
2. Scenario file exists at `~/Claude/code/storm-framework/testing/scenarios/<name>.md`
3. Global STORM runtime installed (`~/.claude/rules/storm-protocol.md` present)

If any precondition fails, abort and tell user what's wrong.

## Execution

### Step 0 — Validate + prep

1. Resolve scenario path:
   - If `$ARGUMENTS` is absolute path, use as-is
   - Else treat as name: `~/Claude/code/storm-framework/testing/scenarios/$ARGUMENTS.md`
   - Check file exists; abort with clear error if not
2. Read scenario file into memory. Parse sections:
   - `## 1. Braindump (paste verbatim when CAPTURE asks)` → BRAINDUMP_TEXT
   - `## 2. Business decision script (answer when asked)` → DECISION_TABLE (question → scripted answer)
   - `## 3. Acceptance criteria` → ACCEPTANCE_LIST
3. Verify CWD is git-initialized; if not, run `git init` (STORM convention).
4. Announce to user: *"Running scenario $ARGUMENTS. All 6 phases will execute in forked sub-agents. No interaction needed until complete. Expected duration: see scenario time budget."*

### Step 1-6 — Dispatch phases sequentially

For each phase in order `CAPTURE → STRUCTURE → SPECIFY → BUILD → REVIEW → SHIP`, dispatch a forked sub-agent via the **Agent tool** with:

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** per STORM tiering table below — `"sonnet"` or `"opus"`. Never omit (#FF-017 — silent inheritance corrupts measurement; this harness is the empirical baseline for tier purity).
- `description`: `"STORM <PHASE> for scenario $ARGUMENTS"`
- `prompt`: phase-specific template (see per-phase details below). Each prompt MUST include:
  - Scenario-file pre-scripted inputs inlined (braindump / relevant business decisions / acceptance criteria)
  - STORM protocol reference: `~/.claude/rules/storm-protocol.md`
  - Phase-specific STORM command reference: `~/.claude/commands/storm-<phase>.md` (the sub-agent should read it and follow the execution steps)
  - Working directory: current CWD (the test project dir — get this dynamically)
  - **Explicit no-user-interaction directive**: sub-agent must NOT ask the user anything. All inputs are in the prompt. Treat silence as "proceed with best judgment from scenario data."
  - **Commit instruction**: sub-agent uses STORM commit convention with `Model:` + `Felt:` trailers. Since sub-agent runs under declared model, trailer reflects that model correctly.

**Model per phase (STORM tiering):**

| Phase | Model |
|---|---|
| CAPTURE | sonnet |
| STRUCTURE | opus |
| SPECIFY | opus |
| BUILD | sonnet |
| REVIEW | sonnet |
| SHIP | opus |

**Between phases:**

- Wait for sub-agent completion (Agent tool blocks).
- Read sub-agent's summary.
- Run `git log --oneline -5` in CWD to verify commits were made.
- If no new commit for that phase, abort with diagnostic — phase failed to land work.
- Narrate to user: *"Phase <X> complete. <N> commits added. Proceeding to <Y>."*

### Per-phase prompt templates

Each template is inlined below. Sub-agent receives it verbatim plus scenario data.

#### CAPTURE prompt

```
You are executing the STORM CAPTURE phase for a test scenario.

WORKING DIRECTORY: <TEST_PROJECT_DIR>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md (load this first)
COMMAND REFERENCE: ~/.claude/commands/storm-capture.md (follow its execution steps)

NO USER INTERACTION. Use the pre-scripted braindump below as if the user typed it.

PRE-SCRIPTED BRAINDUMP:
---
<BRAINDUMP_TEXT from scenario>
---

TASK:
1. If this is a fresh project (no CLAUDE.md yet), run /storm-init equivalent first (create CLAUDE.md, storm/ starter files per v1.3 layout).
2. Create storm/capture/01-braindump.md and log the braindump text above.
3. Follow storm-capture.md execution steps to draft storm/capture/03-ideation-coverage.md and storm/capture/02-ai-questions.md (you don't need to ASK questions — just log the coverage based on the braindump; any "unknown" answers are fine for a test scenario).
4. Infer domain lens from braindump. Declare it explicitly.
5. Commit each canonical doc atomically using STORM convention with `Model: {TIER}` + Felt: <your-judgment> trailers — {TIER} is substituted by the harness orchestrator from the Agent-tool `model:` param.
6. Exit CAPTURE: final commit `storm:CAPTURE:::exit - domain lens locked`.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

#### STRUCTURE prompt

```
STORM STRUCTURE phase for test scenario.

WORKING DIRECTORY: <TEST_PROJECT_DIR>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md
COMMAND REFERENCE: ~/.claude/commands/storm-structure.md

NO USER INTERACTION. Pre-scripted business decisions provided below — use them when drafting structure files.

PRE-SCRIPTED BUSINESS DECISIONS:
<DECISION_TABLE relevant to STRUCTURE — aesthetic, deployment, tech stack preference>

TASK:
1. Read storm/capture/01-braindump.md and storm/capture/03-ideation-coverage.md from prior phase.
2. Follow storm-structure.md execution steps: draft storm/structure/01-vision.md, 02-user-roles.md, 03-modules.md, 04-scope.md, 07-deployment-target.md, 08-design-system.md, 06-build-order.md, 05-dependency-map.md.
3. Apply pre-scripted decisions verbatim — do NOT ask user, do NOT deviate.
4. **Scope discipline:** for this scenario, cap at 2 modules max. If your natural decomposition wants >2, consolidate.
5. Each file gets proper frontmatter (storm-depends-on, storm-phase: structure, storm-canonical: true).
6. Atomic commits: one per logical cascade, STORM convention, `Model: {TIER}` + Felt: trailers (orchestrator substitutes {TIER}).
7. Exit: `storm:STRUCTURE:::approved - N files approved`.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

#### SPECIFY prompt (invoked once per module, or batched)

```
STORM SPECIFY phase for test scenario.

WORKING DIRECTORY: <TEST_PROJECT_DIR>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md
COMMAND REFERENCE: ~/.claude/commands/storm-specify.md

NO USER INTERACTION. Pre-scripted detail decisions provided below.

PRE-SCRIPTED DETAIL DECISIONS:
<DECISION_TABLE relevant to SPECIFY — slug format, validation, persistence detail>

TASK:
1. Read storm/structure/03-modules.md and storm/structure/06-build-order.md.
2. For EACH module (per build-order), run storm-specify flow: create storm/specify/<NN>-<module-slug>/{_index.md, 01-data-model.md, 02-flows.md, 03-rules.md, 04-ui.md, 05-edge-cases.md, 06-tech-choices.md}.
3. **Task granularity discipline** (critical for measurement): in each _index.md, include a task breakdown where EACH task is ≤ 1.5 min of BUILD work and touches ≤ 1 file or 1 logical unit. If "and" appears in a task description, split it.
4. Tech verification: for each library choice, use Context7 (`npx ctx7@latest ...`) to verify current version + maintenance status. Cite source in tech-choices.md.
5. Apply pre-scripted decisions verbatim. Do not invent or expand beyond scenario scope.
6. One atomic commit per module's spec completion. STORM convention + `Model: {TIER}` + Felt: trailers.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

#### BUILD prompt

```
STORM BUILD phase for test scenario.

WORKING DIRECTORY: <TEST_PROJECT_DIR>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md
COMMAND REFERENCE: ~/.claude/commands/storm-build.md

NO USER INTERACTION. Approve your own work based on acceptance criteria below.

ACCEPTANCE CRITERIA TO SATISFY:
<ACCEPTANCE_LIST from scenario>

TASK:
1. For each module (per build-order), create storm/build/<NN>-<module-slug>/_plan.md with task list from storm/specify/<NN>-<module-slug>/_index.md (honor granularity: ≤ 1.5 min/task, ≤ 1 file/unit).
2. **CRITICAL: one atomic commit PER TASK, not per module.** Commit subject: `storm:BUILD:<module>:m<N>:task-<NNN> - <short desc>`. Do NOT batch tasks T1-T18 into a single commit — that defeats per-task metric. Each task = one commit.
3. Execute tasks sequentially. Write code in src/, run self-tests, update _plan.md state markers.
4. For UI-heavy tasks, skip human UI checkpoint — instead verify via programmatic check (HTML exists, endpoint responds, etc.) matching scenario acceptance criteria.
5. After each module completes, update CLAUDE.md current state.
6. STORM commit convention + `Model: {TIER}` + Felt: trailers on every commit.
7. Exit: all modules' _plan.md fully DONE, end-to-end acceptance criteria verifiable.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

#### REVIEW prompt

```
STORM REVIEW phase for test scenario.

WORKING DIRECTORY: <TEST_PROJECT_DIR>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md
COMMAND REFERENCE: ~/.claude/commands/storm-review.md

NO USER INTERACTION. AI self-review only — verify against scenario acceptance criteria.

ACCEPTANCE CRITERIA TO VERIFY:
<ACCEPTANCE_LIST from scenario>

TASK:
1. Read all spec files + build output. For each module, produce storm/review/<NN>-review-<module-slug>.md with rule×implementation cross-check: does code match rules? flows? edge-cases?
2. Run programmatic smoke test against acceptance criteria (e.g., start server, hit endpoint, verify response).
3. Categorize findings: P0/P1 = block SHIP; P2+ = park to storm/meta/parking-lot.md.
4. Write review/review-summary.md with final verdict (PASS/PARK-ONLY/FAIL).
5. Commit: `storm:REVIEW:<scope>:: - <verdict>` with `Model: {TIER}` + Felt: trailers.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}. REVIEW stays sonnet per tiering policy (no silent upshift, per CP-4 + #FF-017).
```

#### SHIP prompt

```
STORM SHIP phase for test scenario.

WORKING DIRECTORY: <TEST_PROJECT_DIR>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md
COMMAND REFERENCE: ~/.claude/commands/storm-ship.md

NO USER INTERACTION. Produce ship artifacts based on shipped code.

TASK:
1. Run storm-ship.md execution steps: storm/ship/01-security-audit.md, storm/ship/02-qa-report.md, storm/ship/04-runbook.md.
2. Build Docker image (if scenario deploys via Docker). Do NOT start a persistent production container — just verify build succeeds + smoke test via `docker run --rm <img> ...` as needed.
3. Ship artifacts under storm/ship/.
4. Final commit: `storm:SHIP::: - v1 ready` with Model: opus + Felt: trailers.
5. Update CLAUDE.md to reflect SHIP complete.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Step 7 — Extract metrics

1. Run: `bash ~/Claude/code/storm-framework/testing/scripts/extract-metrics.sh <CWD> <RUN_NAME>`
   - `RUN_NAME` = `$ARGUMENTS-<timestamp>` or sensible default
2. Read resulting `testing/runs/<RUN_NAME>/summary.md`
3. Report to user:
   - Total active duration vs 30 min target — PASS/FAIL
   - BUILD per-task avg vs 1.5 min target — PASS/FAIL
   - Model distribution (expect: clean per-phase tiering, minimal tier-deviations since each phase was forked)
   - Acceptance criteria status
4. Small-wins narration: *"Scenario $ARGUMENTS complete. Results: [summary]. Report saved to testing/runs/<RUN_NAME>/."*

## Error handling

- If any sub-agent fails (returns with task incomplete, no commits), halt pipeline. Report which phase failed. Do NOT auto-retry — user decides.
- If scenario file malformed (missing required sections), abort with clear error citing what's missing.
- If CWD isn't a git repo, auto-init before phase 1.

## Why this command exists

Production STORM runs are conversational — human makes business decisions in real time. For **framework testing**, we need deterministic repeatable runs where inputs are frozen. This command takes a scenario file (frozen inputs) and replays STORM end-to-end without real-time interaction, in forked sub-agents that honor declared model tiering (no session-default bleed).

**Production use: keep using the regular `/storm-*` commands conversationally. This is harness-only.**

## Principles

- CP-4 narration — orchestrator announces phase transitions to user (so user knows progress)
- CP-11 exit criteria — phase-to-phase verified via commit existence
- CP-12 recovery — normal git state; if pipeline fails mid-phase, user can `/storm-recover` in the test project and continue manually or restart
- Model tiering discipline — guaranteed via forked sub-agents, not aspirational
