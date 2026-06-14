---
description: Log framework friction, list entries, run review ritual, or resolve — manages storm/meta/framework-feedback.md
argument-hint: [description | list | review | resolve #F-NNN status]
model: sonnet
---

Manage framework-feedback log (STORM framework-level friction).

User input: $ARGUMENTS

## Scope (CRITICAL)

**Framework-level friction ONLY:**
- *"STORM itself is unclear here"*
- *"the protocol didn't say what to do"*
- *"the principle doesn't cover this case"*

**Project-level ideas** (CRM features, product scope) → `/storm-park` instead (writes to `storm/meta/parking-lot.md`).

If ambiguous: ask *"Is this about the framework itself, or about the product?"* before logging.

## Sub-action routing

Parse `$ARGUMENTS`:

### 1. `list` → show active entries

Load `storm/meta/framework-feedback.md`, show compact form of `## Active`:

```
#F-001 [P1, unclear-principle] CP-3 ambiguous when user pauses vs abandons
#F-002 [P2, workflow-bug] CAPTURE exit unclear for side projects
#F-003 [P3, terminology-confusion] "Role-flip" vs "Hat-switch" sometimes blurred
```

### 2. `review` → end-of-test review ritual (WORKFLOW 11.3)

1. Load all `## Active` entries
2. Produce summary:
   - Total entries by category
   - Severity distribution (P0 / P1 / P2 / P3 counts)
   - Clusters / patterns (similar issues grouped)
   - Proposed framework/workflow changes
3. Human reviews, decides which enter v1.x
4. AI executes updates to `STORM-FRAMEWORK.md` or `STORM-WORKFLOW.md` as decided
5. Move resolved entries in `storm/meta/framework-feedback.md` from `## Active` to `## Resolved`
6. Commit: `storm:META::feedback-review - v1.x updates`

### 3. `resolve #F-NNN [status]` → mark resolved

Status options: `addressed-in-v1.x`, `deferred` (with reason), `invalid`

1. Move entry from `## Active` to `## Resolved`
2. Record resolution status and date
3. Commit: `storm:META::feedback-resolve - close #F-NNN`

### 4. Anything else (treated as description) → log entry

Invoke `storm-friction-detector` skill:
1. Skill confirms scope (framework vs project)
2. If framework → auto-populate entry via skill's template, append to `## Active`
3. If project → redirect to `/storm-park`, do NOT log here
4. Commit: `storm:META::feedback - log #F-NNN [title]`

## When to use manually

- Explicit log without auto-detection
- Running review ritual at end of real-world test
- Resolving entries after framework update
- During a retrospective

Auto-detection via `storm-friction-detector` handles most cases during normal work.

## Principles in play

- CP-12 AI-maintained recovery-like artifact (user never writes these directly by hand)
- Scope discrimination prevents noise (framework vs project never mixed)
