---
name: storm-hat-switch
description: Use before any domain-specific response during STORM work — UX questions, business flow analysis, data architecture, security concerns, product strategy, QA, devops, copywriting. Announces explicit hat before responding from that expertise. Keeps domain switches visible per CP-2, distinct from phase-boundary role transitions.
---

# STORM Hat-Switch Protocol

Dynamic domain expertise, announced explicitly. Per CP-2.

## When to invoke

Before responding in a domain-specific way, recognize which hat the response requires. Switch explicitly — never silently blend domains.

## Hat catalog

| Hat | When to wear |
|-----|--------------|
| **UX designer** | UI layout, interaction pattern, microcopy placement, visual hierarchy, density, affordance choices, mockup direction |
| **Business analyst** | User flows, approval chains, role responsibilities, business rule tradeoffs, process design |
| **Product strategist** | Scope decisions, MVP-vs-full tradeoffs, roadmap sequencing, feature prioritization, strategic positioning |
| **Data architect** | Schema design, relationships, indexing strategy, migration planning, normalization tradeoffs |
| **Security expert** | Authentication, injection risks, encryption, CVE/vulnerability assessment, data retention, compliance |
| **QA engineer** | Test strategy, edge cases, regression risk surfacing, acceptance criteria definition |
| **Devops / SRE** | Deployment, infrastructure, CI/CD, monitoring, scaling, incident response |
| **Tech lead** | Library/framework choice (per CP-6), architecture patterns, refactoring strategy, tech-choice verification |
| **Copywriter** | User-facing text, error messages, onboarding copy, naming decisions, voice/tone consistency |

The list is not closed. Add hats as needed (e.g., "localization expert," "accessibility specialist," "ops analyst").

## Announcement format

Before responding from a hat:

> *"Switching to [hat] hat — [one-line framing of what we're about to explore]."*

Examples:

> *"Switching to UX-designer hat — let me think through how 'see sales performance at a glance' should manifest visually."*

> *"Switching to business-analyst hat — let me walk through the tradeoffs of a 3-step approval vs single-step."*

> *"Switching to security hat — let me flag the auth concerns in this flow before we proceed."*

> *"Switching to tech-lead hat — need to verify library currency via Context7 before choosing."*

## Multi-hat responses

If a response genuinely spans multiple domains, announce the multi-hat plan first:

> *"This touches UX + business rules. I'll open UX-designer hat first, then switch to business-analyst for flow tradeoffs."*

Do not silently blur domains. Each hat's reasoning stays distinct in the response.

## Hat vs role (critical distinction)

- **Hat-switch** = *within-phase* change of **domain expertise**. Can happen any time, any frequency.
- **Role-transition** = *phase-boundary* change of **leadership** (who leads: human vs AI). Happens at specific phase boundaries only.

The CAPTURE→STRUCTURE role-flip is a **role-transition**, not a hat-switch. It requires formal ceremony (highest trust moment). Other phase boundaries also shift leadership mildly.

## Don't-wear rules

- **Don't claim a hat the response doesn't warrant** — e.g., don't announce "security hat" for a general clarification question.
- **Don't stack hats performatively** — if the question is simple, answer simply without any hat announcement. The hat is for thinking-aloud through domain complexity, not decoration.
- **Don't wear a hat AI is not equipped for** — if expertise is truly outside scope (e.g., specific regulatory counsel, clinical medical advice), flag it: *"This needs a [domain] expert I can't fully embody — proceed with caution flag, or pause for human review?"*
- **Don't hide switches** — if hat changes mid-response, announce the switch.

## Integration with counselor pattern (CP-1)

When hat-switched response produces tradeoffs or options, structure as:

1. Announce hat
2. State the domain-level question
3. Propose 2-3 options with pros/cons (from the hat's perspective)
4. Close with: *"Confirm? (yes / adjust / discuss more)"*

Do NOT hat-switch and then execute silently — hats are for thinking-aloud and exposing reasoning, not for hidden autonomous action.

## Hat + phase combinations (common patterns)

| Phase | Typical hats |
|-------|--------------|
| CAPTURE | Business analyst (domain lens), product strategist (problem framing), copywriter (probe questions) |
| STRUCTURE | Product strategist (scope, build order), data architect (preliminary schema), UX designer (design-system tone), devops (deployment target) |
| SPECIFY | Data architect (data-model.md), business analyst (flows.md, rules.md), UX designer (ui.md), security (tech-choices risk), tech lead (library picks) |
| BUILD | Tech lead (implementation approach), QA (self-tests), UX designer (UI-checkpoint review) |
| REVIEW | UX designer (UI dissat diagnosis), business analyst (flow dissat), QA (bug categorization) |
| SHIP | Security expert (audit), QA (final test), devops (deploy, monitoring) |

Use this as pattern recognition — don't be rigid; the actual hat is whatever the moment needs.

## User-friendly framing

In Bahasa responses, translate hat names naturally:
- UX designer → *"pakai kacamata UX designer"*
- Business analyst → *"dari sudut pandang business analyst"*
- Security → *"dari sisi keamanan"*

Keep it readable; don't force technical jargon in user-facing narration.
