---
description: Enter SHIP phase — security audit, QA, staged deploy, production cutover, monitoring, runbook; artifact drafting dispatched to forked opus sub-agents
model: opus
---

Enter STORM SHIP phase.

**Tier discipline:** each ship artifact (security audit, QA report, runbook, docker build) drafted by forked **opus** sub-agent. Deploy command narration (user executes) stays in orchestrator.

**DISPATCH RULE (measurement integrity, per #FF-017):** every Agent tool dispatch from this command MUST:
1. Pass explicit `model: "opus"` on the Agent tool call. **NEVER omit** — silent inheritance from parent session corrupts the `Model:` trailer measurement signal.
2. Substitute every `{TIER}` placeholder in each prompt template with `opus`.
3. Sub-agent's commit trailer MUST be `Model: opus` matching the dispatch. Orchestrator post-check rejects on mismatch.

## Execution (orchestrator)

1. **Invoke `storm-recovery`**.
2. **Invoke `storm-phase-guard`** — verify all modules completed REVIEW.
3. **Dispatch opus sub-agent: Security audit** (Template A). Wait, verify commit. Surface business-side items to user for approval.
4. **Dispatch opus sub-agent: QA report** (Template B). Wait, verify commit. If P0/P1 failures → loop-back to BUILD/REVIEW before continuing.
5. **Deployment topology resolution (v1.4 W-G37):** read `storm/structure/07-deployment-target.md`. **If missing or contains TBD → HARD BLOCKER. Loop-back to STRUCTURE.** No further steps until topology resolved upstream (CP-6 #5: architecture must match target from day 1).
6. **Schema migration pre-flight gate (v1.4 W-G36 — re-ordered to BEFORE deploy prep, per #FF-014):**
   - **Inspect each pending migration** — classify as `expand` (additive: ADD COLUMN nullable, ADD TABLE, ADD INDEX), `contract` (destructive: DROP COLUMN, DROP TABLE, DROP CONSTRAINT), `tighten` (NOT NULL ADD, NOT NULL on existing column, narrowing CHECK), or `rename` (column/table rename = expand-then-contract sequence).
   - **For `expand` migrations:** apply migration FIRST → deploy code that uses new column. Order: migrate → push → Dokploy redeploy → verify.
   - **For `contract` migrations:** deploy code that does NOT reference the dropped column FIRST → wait for prod container to be running new image hash → THEN apply migration. Order: push → Dokploy redeploy → verify new container hash → migrate.
   - **For `tighten` migrations (NOT NULL ADD):** ensure migration applied BEFORE code that INSERTs without the value (otherwise INSERTs fail). Equivalent to expand timing.
   - **For `rename`:** decompose into 3 deploys — (1) add new column, dual-write code; (2) backfill + dual-read; (3) drop old column. Never single-shot a rename in prod.
   - **Hard gate:** AI MUST state classification + ordering plan + verify-prod-hash step BEFORE running any psql/migrate command against prod. User confirms classification before proceeding. **Ordering plan feeds directly into step 8 deploy sequencing.**
7. **Dispatch opus sub-agent: Smoke-test plan (Template D below — v1.4 W-G38 canonical artifact)** → `storm/ship/03-smoke-test-plan.md`. Wait, verify commit. MUST land BEFORE deploy commands generated.
8. **Deployment prep + staging/production cutover** (orchestrator — user executes commands):
   - Step-by-step narration per deployment target (resolved at step 5) + migration ordering (step 6).
   - AI produces each command → human runs it → AI verifies output.
   - Staging first → smoke test (using `03-smoke-test-plan.md`) → production.
9. **Dispatch opus sub-agent: Runbook** (Template C). Wait, verify commit. Lands as `storm/ship/05-runbook.md` (D2 sequential renumber).
10. **Monitoring setup** (light compute, orchestrator): set up logs/alerts/backups/health checks per runbook. Goes into `storm/ship/04-deployment-config/`.
11. **Final commit (main session):** `storm:SHIP:::vX.Y.Z - v<ver> shipped` with Model:/Felt: trailers. Celebrate CP-10.

## Sub-agent dispatch templates

### Template A: Security audit

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"opus"`. Never omit (#FF-017).
- `description`: `STORM SHIP security audit`

```
You are a STORM SHIP sub-agent running on {TIER} tier. Produce security audit.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

TASK: Write storm/ship/01-security-audit.md.

SCOPE:
- **Technical items (autonomous — CP-7):** auth flow review, CVE scan via live tools (e.g., npm audit / equivalent), injection risks (SQLi / XSS / CSRF), encryption (at-rest + in-transit), dependency audit, secret-handling in code + config.
- **Business items (propose, human decides — CP-7):** data collection policy, retention periods, compliance scope (GDPR / local privacy laws / PDP Indonesia), user consent flows.

STEPS:
1. Read all module code in src/.
2. Run dependency audit (e.g., `npm audit` if Node; equivalent for other stacks). Capture output.
3. Manually scan for injection / XSS / CSRF / secrets-in-code patterns.
4. Write storm/ship/01-security-audit.md with frontmatter (storm-phase: ship, storm-canonical: true, storm-depends-on: [src/, storm/build/, storm/specify/]).
5. Sections: Technical findings (severity P0-P3), Business items (options for human), Overall posture.
6. Commit atomically:
   Subject: storm:SHIP:::security-audit - <posture summary>
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE file. ONE commit. Trailers mandatory. NO user interaction.

RETURN: file path, commit hash, posture (CLEAR / WARN / BLOCK), 1-line top findings, list of business items needing human decision.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template B: QA report

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"opus"`. Never omit (#FF-017).
- `description`: `STORM SHIP QA report`

```
You are a STORM SHIP sub-agent running on {TIER} tier. Produce QA report.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

TASK: Write storm/ship/02-qa-report.md.

STEPS:
1. Read acceptance criteria across all modules (storm/specify/<NN>-<module-slug>/03-rules.md + scenario ACs if available).
2. Run end-to-end tests across all modules (unit + integration + e2e as applicable).
3. Categorize failures: P0-blocker / P1-fix-before-ship / P2-deferrable.
4. Write storm/ship/02-qa-report.md with frontmatter, findings, pass/fail per acceptance criterion.
5. Commit atomically:
   Subject: storm:SHIP:::qa-report - <verdict>
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE file. ONE commit. Trailers mandatory. NO user interaction.

RETURN: file path, commit hash, verdict (CLEAR / FIX-REQUIRED / BLOCK), P0/P1 count.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template D: Smoke-Test Plan (v1.4 W-G38 — canonical artifact)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"opus"`. Never omit (#FF-017).
- `description`: `STORM SHIP smoke-test plan`

```
You are a STORM SHIP sub-agent running on {TIER} tier. Produce canonical smoke-test plan.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

TASK: Write storm/ship/03-smoke-test-plan.md — human-led smoke test plan for production deploy.

CONTEXT (must read):
- storm/specify/<NN>-<slug>/_index.md per module (top user goals)
- storm/structure/07-deployment-target.md (deployed URL pattern)
- storm/structure/02-user-roles.md (which roles to test)
- storm/ship/01-security-audit.md + 02-qa-report.md (open watch-items)

PLAN STRUCTURE (concrete, no hand-wave):

```markdown
---
storm-phase: ship
storm-canonical: true
storm-depends-on:
  - storm/structure/07-deployment-target.md
  - storm/ship/01-security-audit.md
  - storm/ship/02-qa-report.md
---
# Smoke-Test Plan — <product> @ <prod URL>

## Pre-checks
- [ ] App reachable: open <actual URL> in browser
- [ ] Auth: sign in with <test account / OAuth provider>
- [ ] No console errors on landing page
- [ ] Backend health: GET <health endpoint> → 200

## Critical Flow 1: <name>
**Why this matters:** <what would break if this fails>
**Steps:**
1. <click actual button label>
2. <fill actual field name with Z>
3. <click submit>
**Expected:** <what user should see — actual text/state>
**Red flags:** <what would mean failure>
**Result:** [ ] PASS  [ ] FAIL — notes:

## Critical Flow 2: <name>
... (3-7 flows total, one per top user goal per module)

## Edge cases to spot-check
- <edge 1, concrete>
- <edge 2, concrete>

## Failure handling
- Capture screenshot, note which step failed
- Paste back to AI → AI investigates
- Rollback decision held with user
```

PLAN CONTENT RULES:
- Concrete: actual URLs, actual button labels, actual expected text/state. No hand-wave.
- One critical flow per top user goal in each module's _index.md. Typical 3-7 flows total.
- Each flow has a "why this matters" line.
- Result checkboxes per flow so human marks PASS/FAIL inline.

STEPS:
1. Read context files.
2. Draft storm/ship/03-smoke-test-plan.md per structure above.
3. Commit atomically:
   Subject: storm:SHIP:::smoke-plan - <N flows>
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE file. ONE commit. Trailers mandatory. NO user interaction.
- FORBIDDEN from running the smoke test itself (per L4-02 Verification Boundary — human owns execution).

RETURN: file path, commit hash, N flows drafted.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template C: Runbook

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"opus"`. Never omit (#FF-017).
- `description`: `STORM SHIP runbook`

```
You are a STORM SHIP sub-agent running on {TIER} tier. Produce runbook.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

TASK: Write storm/ship/05-runbook.md — ongoing operations guide (D2 sequential renumber).

CONTEXT (must read):
- storm/structure/07-deployment-target.md
- All src/ relevant to ops (Dockerfile, docker-compose if present, env handling, DB persistence)

CONTENT:
- How to deploy updates (step-by-step)
- How to rollback
- Where logs live, how to read them
- Backup procedure + restore
- Common issues + fixes (inferred from code structure + known gotchas)
- On-call / escalation (if applicable; may be "solo operator" for self-host)

STEPS:
1. Read context files.
2. Write storm/ship/05-runbook.md with frontmatter + all sections.
3. Commit atomically:
   Subject: storm:SHIP:::runbook - ops guide ready
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE file. ONE commit. Trailers mandatory. NO user interaction.

RETURN: file path, commit hash, 1-line gist.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

## Post-dispatch checks (orchestrator)

After each sub-agent returns:
1. Verify commit subject + `Model:` trailer matches the value passed to `model:` Agent-tool param at dispatch (per #FF-017 — reject on mismatch).
2. Read artifact for context.
3. For security audit: surface business-side items to user for decision.
4. For QA: if verdict ≠ CLEAR → halt, loop-back. Do not proceed to deploy.

## Deployment narration (orchestrator, step-by-step CP-4)

- AI produces each command in a code block.
- User runs it, pastes output.
- AI verifies output matches expectation → next command.
- Staging first → smoke test → production.

## Post-deploy smoke test (v1.4 W-G38 + W-G39 — canonical plan, human-led)

The smoke-test plan is now a **canonical committed artifact** at `storm/ship/03-smoke-test-plan.md` (drafted at step 7 via Template D). NOT a chat message improvised at handoff (v1.3 behavior).

**Handoff to human:**
> *"Smoke-test plan committed at `storm/ship/03-smoke-test-plan.md`. Open it, work each flow against <prod URL>. Mark PASS/FAIL inline per flow. I'll assist on request — screenshot, curl probe, log tail — but you drive."*

**During execution:** AI assists on request — take screenshot, run curl probe, navigate alongside, tail prod logs. AI does NOT drive the test session (per L4-02 Verification Boundary).

**Acceptance:** human marks PASS/FAIL inline in the plan file per flow. PASS on all critical flows = production deploy verified. AI re-reads the file to confirm before firing the SHIP exit commit.

## Exit (v1.4)

- `07-deployment-target.md` resolved (no TBD) — verified at step 5
- Security audit business-section human-approved
- QA report CLEAR (no P0/P1)
- Schema migration classification + ordering committed BEFORE deploy
- `03-smoke-test-plan.md` exists as canonical artifact
- Production deploy verified (human-marked PASS per flow in `03-smoke-test-plan.md`)
- Runbook (`05-runbook.md`) landed + committed
- **Module-status tracker updated (#FF-023):** set this module's `Prod SHA` + `SHIP date` and `Phase` → `PROD` in `storm/meta/module-status.md` (create the file from the §6 grid schema if it doesn't exist yet). Atomic — fold into the final SHIP commit. This is STORM's claim of what shipped; prod truth stays with the deploy platform.
- Main session fires final SHIP commit

## Post-SHIP

No separate maintenance phase. Re-entrant via:
- New ideas → `/storm-park`
- Triage → integrate / schedule / reject / someday
- Integrated tickets re-enter at appropriate phase

Celebrate (CP-10):
> *"Shipped. [Product] live. Here's what you built: [summary]. Next: monitor, iterate, expand via parking-lot triage."*

## Principles in play

- CP-2 hat-switch (security / QA / devops hats inside sub-agents or orchestrator)
- CP-4 step-by-step deploy narration
- CP-6 live verification (dependency audit, not training-data claims)
- CP-7 decision split (tech autonomous, business human-approved)
- CP-10 shipment celebration
- CP-11 exit (verifiable: audit CLEAR, QA CLEAR, smoke pass)
- CP-12 recovery (atomic commits per artifact + runbook = ongoing recovery artifact)
- Model tiering — **enforced via forked opus dispatch**
