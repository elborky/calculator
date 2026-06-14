---
description: Park an idea, list tickets, run triage, or resolve — manages storm/meta/parking-lot.md
argument-hint: [description | list | review | resolve #NNN status]
model: sonnet
---

Manage parking lot (project-scope ideas).

User input: $ARGUMENTS

## Scope

**Project-level ideas only** (features, scope, tech questions about the product being built).
For framework-level friction (*"STORM itself is unclear"*), use `/storm-feedback` instead.

## Sub-action routing

Parse `$ARGUMENTS`:

### 1. `list` (or `-list`) → show active tickets

Load `storm/meta/parking-lot.md`, show compact form of all `## Active Tickets`:

```
#003 [P2] Export invoices to Excel (Pending)
#005 [P1] WhatsApp integration (Scheduled)
#007 [P2] Automatic overdue reminders (Pending)
```

### 2. `review` (or `-review`) → triage ritual (WORKFLOW 5.3)

1. Load all `Pending` tickets
2. Per ticket, AI proposes options:
   - **integrate-now** — enter appropriate phase with this scope
   - **schedule-to-phase-X** — assign a target phase / week / milestone
   - **reject** — with reason
   - **someday** — keep open, no commitment
3. Human picks per ticket
4. Update ticket statuses
5. For each `integrate-now`: narrate which phase entry, invoke appropriate phase command

### 3. `resolve #NNN [status]` (e.g., `resolve #003 integrated`) → mark resolved

Status options: `integrated`, `scheduled`, `rejected`, `someday`

1. Move ticket from `## Active Tickets` to `## Resolved`
2. Record resolution status and date
3. Commit: `storm:META::park-resolve - #NNN [status]`

### 4. Anything else (treated as description) → manual park

1. Compute next sequential ID (`#NNN` from last + 1, zero-padded to 3 digits)
2. Populate fields:
   - **Logged:** current timestamp
   - **Parked at:** current phase / module / task from `CLAUDE.md`
   - **Original context:** user's exact description
   - **Classification:** AI-suggested (feature-expansion / scope-change / tech-question / UX-refinement / integration / bug-followup / other)
   - **Triage status:** Pending
   - **Priority:** AI-suggested (default P2; bump if user signals urgency like *"harus banget"*, *"critical"*)
3. Append to `storm/meta/parking-lot.md` under `## Active Tickets`
4. Confirm to user: *"Parked as #NNN: [title]. Continuing [current task if applicable]."*
5. Commit: `storm:META::park - add #NNN [title]`

## When to use manually

Rarely — `storm-phase-guard` auto-parks out-of-scope ideas without asking (CP-8). Use this command when:
- Proactively parking something before auto-detect catches it
- Listing what's parked
- Running triage ritual
- Resolving a ticket explicitly

## Principles in play

- CP-8 chaos container (auto-park is default; manual path is escape hatch)
- CP-1 counselor on triage (options presented, human picks)
- CP-4 narration (every park confirmed inline)
