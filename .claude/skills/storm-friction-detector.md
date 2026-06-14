---
name: storm-friction-detector
description: Use when watching for friction patterns during STORM usage — repeated clarifying questions on same topic, user circling back to same frustration, phrases like "bingung" or "gak ngerti framework", or AI-detected principle ambiguity. Gently surfaces friction and suggests logging to `storm/meta/framework-feedback.md`. Framework-level friction only — project-scope goes to parking lot instead.
---

# STORM Friction Detector

Capture framework-level friction as it happens. Feeds v1.x iteration. AI-maintained (CP-12 discipline).

## When to invoke

Watch for these patterns throughout session:

### Repetition pattern
- User asks the same clarifying question 3+ times on the same topic
- User circles back to the same frustration within the session
- User re-asks same "how does STORM handle X" question after prior explanation

### Explicit friction signals (Bahasa + English)
- *"bingung"*, *"gak ngerti"*, *"gw gak paham framework-nya"*
- *"kok gini"*, *"kok STORM gak handle..."*, *"framework harusnya..."*
- *"I don't understand the framework here"*
- *"this doesn't make sense"*, *"STORM should cover this"*

### Principle ambiguity (AI-detected)
- AI encounters a decision where the 15 CPs don't give clear guidance
- AI realizes a workflow step has no defined next action
- AI has to pick between interpretations and neither is clearly right
- A loop-back scenario doesn't match any entry in the loop-back matrix

### Tool friction
- A command doesn't exist that should (e.g., user needs something Claude Code can't do)
- A skill's trigger rules fire when they shouldn't (false positive)
- A skill's trigger rules fail when they should fire (false negative)

### Decision-blind freeze-signal (C1 debate-to-arm reactive net)
The user signals they are *genuinely blind* on a decision AI just surfaced — not friction with STORM, but inability to choose:
- *"gak tau"*, *"terserah"*, *"bebas"*, *"lo aja yang pilih"*, *"pusing gw"*
- *"I don't know"*, *"whatever"*, *"you pick"*, *"up to you"*
- User goes silent / stalls after AI posed a business question

**Action is DIFFERENT from the signals above — do NOT log this to feedback/parking.** Route it to the **debate-to-arm procedure (CP-7 Langkah-2 / WORKFLOW §1.3)**: classify where the answer lives (research / trade-off / pure-taste), then arm the user with the §1.3 cheat-sheet (which IS the CP-1 options surface) instead of re-asking blind. This is a CP-11 anti-stuck reactive net, not a friction ticket.

## Scope discrimination (CRITICAL — do not mix)

Before logging, discriminate:

- **Framework-level friction** → `storm/meta/framework-feedback.md`:
  - *"STORM itself is unclear here"*
  - *"the protocol didn't say what to do"*
  - *"the principle doesn't cover this case"*
  - *"this workflow step feels wrong"*

- **Project-level idea** → `storm/meta/parking-lot.md`:
  - *"we should add feature X to the CRM"*
  - *"the invoice flow needs..."*
  - *"don't forget to handle tax calculation"*

If ambiguous: ask *"Is this about the framework itself, or about the product you're building?"*

## Surfacing protocol (gentle, not intrusive)

```
Looks like framework friction — [one-line summary of what I observed].

Log to storm/meta/framework-feedback.md? (yes / no / later)
```

Do NOT log without user confirmation. Do NOT log project-scope ideas here.

## If user says yes

Auto-populate entry and append to `storm/meta/framework-feedback.md` under `## Active`:

```markdown
### #F-NNN — [Short title derived from friction]
- **Logged:** YYYY-MM-DD HH:MM (current timestamp)
- **Context:** [phase + activity from CLAUDE.md]
- **Description:** [what happened — user's or AI's words]
- **Category:** [see assignment guide below]
- **Severity:** [see assignment guide below]
- **Auto/Manual:** [auto-detected | user-logged]
- **Suggested change:** [if obvious from context; else blank]
- **Status:** open
```

Commit with:
```
storm:META::feedback - log framework friction #F-NNN
```

## Category assignment guide

- **framework-gap** — framework doesn't cover this case (no principle applies)
- **workflow-bug** — workflow step produces wrong/unclear outcome
- **unclear-principle** — a specific CP (1-15) is ambiguous in this context
- **feature-request** — user wants a new STORM capability
- **terminology-confusion** — a term is unclear, overlapping, or conflicting
- **tool-friction** — Claude Code / toolchain limitation (log to track even if upstream issue)

## Severity assignment guide

- **P0-blocker** — STORM cannot proceed; work blocked
- **P1-friction** — major cognitive friction, workaround needed, slows user significantly
- **P2-annoyance** — minor irritation, workable
- **P3-suggestion** — polish / nice-to-have / future improvement

Err on the side of higher severity when user shows emotion (frustration phrases).

## If user says no

Do not log. Do NOT argue or re-ask. Remember pattern privately — may surface again if pattern repeats.

## If user says later

Remember to offer again at next natural break: phase transition, end of session, or `/storm:feedback-review` invocation.

## Review ritual

Triggered by `/storm:feedback-review` or end of real-world test / major checkpoint:

1. Load all `## Active` entries from `storm/meta/framework-feedback.md`
2. Produce summary:
   - Total entries by category
   - Severity distribution
   - Clusters (similar issues grouped)
   - Proposed framework/workflow changes
3. Human reviews, decides what goes into v1.x
4. AI executes updates to `STORM-FRAMEWORK.md` or `STORM-WORKFLOW.md`
5. Move resolved entries from `## Active` to `## Resolved`
6. Commit: `storm:META::feedback-resolve - close #F-NNN`

## What NOT to log

- Code bugs (go to regular issue tracking / parking lot if it's a scope thing)
- Personal frustrations unrelated to STORM (no-op)
- User's curiosity questions that aren't friction (e.g., "how does X work?" answered without trouble)
- Temporary confusion that resolves within same turn (no pattern yet)

Log only when friction shows as pattern or user explicitly signals it.
