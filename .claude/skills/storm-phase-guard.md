---
name: storm-phase-guard
description: Use before proposing phase transitions, when user requests something that may not fit current phase, or when verifying phase exit criteria. Enforces STORM's 6-phase lifecycle (CAPTURE → STRUCTURE → SPECIFY → BUILD → REVIEW → SHIP), with loop-backs AI-initiated and explicit verifiable exit criteria per phase.
---

# STORM Phase Guard

Enforce phase invariants. Validate exit criteria. Handle out-of-phase requests per CP-8 auto-park.

## When to invoke

- Before narrating a phase transition
- When user requests something that may not fit current phase
- Before marking a phase exit
- After session recovery (to verify current phase is consistent)
- When about to begin a new phase's activities

## Current phase resolution

1. Read `CLAUDE.md` → `## Current State` → `Phase:` field
2. If missing or stale, cross-check with `git log --oneline -20` recent `storm:PHASE:` commits
3. If inconsistent between CLAUDE.md and git → invoke `storm-recovery` skill first

## Phase catalog (exit criteria summary)

| Phase | Exit Criteria |
|-------|---------------|
| **CAPTURE** | **Re-openable lock (#E6/M2):** human declares a **bounded slice** done + names the deferred items (NOT *"all ideas captured"*) — **AI never auto-exits** + projection part-4 **mechanical gap-check** (journal chunks with no `_index` anchor) surfaced so each unmapped idea is consciously mapped-or-deferred (#E6/M3, feeds tooth (a)) + `storm/capture/03-ideation-coverage.md` exists and confirmed *"yes, that's what I said"* + `00-domain-lens.md` confirmed. Re-entry to add more is first-class (see Loop-back matrix). |
| **STRUCTURE** | All 8 structure files exist + human-approved + no TBDs in `modules.md`/`scope.md`/`deployment-target.md` + `design-system.md` has ≥3 reference apps |
| **SPECIFY** (per module) | All spec files exist for module + no TBDs on `rules.md`/`flows.md` + tech-choices verified (CP-6 evidence) + human confirms *"this is what I want from user's perspective"* |
| **BUILD** (per module) | All planned tasks `[DONE]` + end-to-end flow runs (not half-done) + AI self-tests pass + module marked ready for REVIEW |
| **REVIEW** | All non-trivial feedback addressed OR explicitly deferred to parking lot + human says *"this module is done"* |
| **SHIP** | Security audit business-section human-approved + QA clean (no P0/P1) + production deploy verified (smoke test passing in prod) + runbook exists |

Full per-phase detail: `STORM-WORKFLOW.md` Section 3.

## Handling out-of-phase requests

When user asks for something that doesn't fit current phase:

1. **Scope expansion mid-phase** → auto-park per CP-8 (never ask). Respond: *"Parked as #NNN: [title]. Continuing [current task]."*
2. **Legitimate loop-back** per matrix (BUILD→SPECIFY, REVIEW→SPECIFY, REVIEW→STRUCTURE, REVIEW→BUILD, SHIP→BUILD/REVIEW) → AI-initiated, narrate reason, get approval, execute.
3. **Explicit phase-regression** (user says *"let's go back to X"*) → if regression is valid per loop-back matrix, honor. If not, surface: *"That would skip [Y]. Are you sure? (yes / adjust / discuss more)"*
4. **Post-SHIP new scope** → parking lot, then triage; integrated tickets re-enter lifecycle at appropriate phase.

## Loop-back matrix (direct loop-backs)

| From | To | Trigger |
|------|-----|---------|
| BUILD | SPECIFY | Spec turned out wrong during implementation |
| REVIEW | SPECIFY | Built correctly per spec, but spec itself was wrong |
| REVIEW | STRUCTURE | Foundational shape is wrong |
| REVIEW | BUILD | Implementation bug (no spec change needed) |
| SHIP | BUILD/REVIEW | Security or QA audit fails |

Re-entry loop-back (first-class — revolving door, #E6/M2): **Any phase → CAPTURE is a first-class move**, not a parking-lot-only back-door. On re-entry, AI computes the journal delta (new / built / deferred) and routes it through a CP-1-gated checkpoint (new module / extend existing / conflict), then re-validates the Domain Lens (re-open drift gate). Park-for-later (no re-entry now) still uses CP-8 parking-lot for a future cycle. See `STORM-WORKFLOW.md` §3.1 (revolving-door lifecycle).

## Phase transition narration

Before any transition:

> *"[Current phase] exits — criteria check: [PASS summary]. Entering [next phase] ([human-led | AI-led])."*

**CAPTURE → STRUCTURE** specifically requires role-flip ceremony (highest-trust moment):

> *"Switching to STRUCTURE-lead. Your continued authority: review, challenge, approve, trigger loop-back. Domain Lens carried from CAPTURE: [X]. I'll surface each structure file for review."*

## Exit check output format

```
Phase exit check: [phase name]
- ✅ [Criterion met]
- ✅ [Criterion met]
- ❌ [Criterion not met — why]
- ⚠️ [Ambiguous — what's needed to resolve]

[PASS → propose transition] OR [NOT READY → anti-stuck options below]
```

## Anti-stuck per phase (if exit not met in reasonable time)

| Phase | Anti-stuck protocol |
|-------|--------------------|
| CAPTURE | Switch to "show me" mode: describe 3 possible product versions, ask which resonates; if blank, ask *"Tell me about a problem you face every day at work"*; if circling, summarize + ask *"Is there something new beyond this?"* |
| STRUCTURE | If can't pick priorities → propose build order with 4-criteria reasoning (dependencies, risk, value visibility, foundation soundness); if scope too big → propose MVP slice + others → parking lot; if iteration stalls → offer loop-back to CAPTURE |
| SPECIFY | Unclear rule → propose 2-3 options with pros/cons; too complex → split module; repeated mind-changing → flag pattern, suggest parking conflicting ideas |
| BUILD | Task stuck >2 sessions → surface blocker, consider spec loop-back; tests failing repeatedly → propose approach change or spec adjustment; user lost in technical details → remind *"You don't review code. Let's look at the result."* |
| REVIEW | Endless dissat → surface pattern (CP-3 guard), propose explicit accept criteria; complete redesign ask → loop-back to STRUCTURE with confirmation |
| SHIP | Deploy fails → step-by-step diagnose with human running commands; infra issue → may loop-back to STRUCTURE (deployment target wrong) |

## Always narrate

Every response in-phase: *"We're at phase X, doing Y."* (or brief equivalent).

Never operate silently across phase boundaries.
