---
description: Enter SPECIFY phase for a module — JIT per CP-9, just before BUILD starts; concern drafts dispatched to forked opus sub-agents
argument-hint: [module-name (optional; if blank, AI suggests next per build-order)]
model: opus
---

Enter STORM SPECIFY phase for a module.

**Tier discipline (per #FF-003 + v1.4 W-G27 — field-validated on dealflow Phase 1, zero overload recurrence):**

| Concern | Tier |
|---|---|
| `_index.md`, `02-flows.md`, `03-rules.md`, `04-ui.md`, `05-edge-cases.md`, `07-acceptance.md` | sonnet |
| `01-data-model.md`, `06-tech-choices.md` | opus |
| `04-ui/mockup-v[1-3].html` | sonnet × 3 parallel (per W-G26) |
| `_briefing.md` | no tier (orchestrator-authored) |
| `_decisions.md` | no tier (sub-agents append; orchestrator collates) |
| `_audit.md` | opus (cross-file audit per #FF-007) |

Main session handles UX interpretation dialogue, approval, orchestrator-level reads + briefing, Domain Lens re-validation, mockup pick dialogue.

**DISPATCH RULE (measurement integrity, per #FF-017):** every Agent tool dispatch from this command MUST:
1. Pass an explicit `model:` param on the Agent tool call matching the tier-table value for that concern (`"sonnet"` or `"opus"`). **NEVER omit** — silent inheritance from parent session corrupts the `Model:` trailer measurement signal.
2. Substitute every `{TIER}` placeholder in the prompt template below with the same value passed to `model:`.
3. Sub-agent's commit trailer MUST be `Model: {TIER}` matching the dispatch. Orchestrator post-check rejects on mismatch.

Target module: $ARGUMENTS

## Execution (orchestrator)

1. **Invoke `storm-recovery`** to verify state.
2. **Invoke `storm-phase-guard`** to verify STRUCTURE complete (or validate re-specify).
3. **Resolve module target:**
   - If `$ARGUMENTS` has a module name → use that.
   - If blank → consult `storm/structure/06-build-order.md`, propose next unspecified module: *"Next per build-order: [X]. Specify? (yes / different module / discuss)"*
   - **Scope-verification gate (per #FF-006):** re-read `storm/structure/03-modules.md` + `storm/structure/06-build-order.md` verbatim. Confirm module name + scope match target. Prevents wrong-scoped dispatches (m8/m9 swap pattern).
3a. **Domain Lens re-validation gate (v1.4 W-G24 — cheap-loop lever per INV-01):** orchestrator reads `storm/structure/00-domain-lens.md` and surfaces: *"Domain Lens for module [X]: [framing]. Confirm or revise before drafting?"* If user revises → dispatch opus sub-agent to redraft `00-domain-lens.md`, then cascade affected downstream artifacts BEFORE proceeding to step 4. Without this gate, each module re-infers framing → opus token burn + scope drift risk.
4. **Orchestrator upstream-read gate (per #FF-016 — MANDATORY before any sub-agent dispatch):** orchestrator personally reads (NOT delegated):
   - `storm/capture/01-braindump.md` full text
   - `storm/structure/03-modules.md` target module section verbatim
   - `storm/structure/02-user-roles.md` full text (if role-sensitive permissions apply)
   - `storm/structure/04-scope.md` full text
   - `storm/structure/08-design-system.md` (for 04-ui.md inputs)
   - All dependency module `storm/specify/<dep>/_index.md` + `01-data-model.md` (for FK targets)

   Then synthesize a `storm/specify/<NN>-<module-slug>/_briefing.md` with citations to upstream + canonical facts + 12-ish open questions if any contradictions surface between upstream sources. Commit briefing atomically:
   ```
   storm:SPECIFY:<module>::briefing - <N canonical facts, M open questions>
   Trailers: Model: opus, Felt: <ok|long>
   ```
   If briefing surfaces conflicts → surface to user, RESOLVE before proceeding to step 5.
5. **Drafting loop — 8 concern files per module:**
   `_index.md → 01-data-model.md → 02-flows.md → 03-rules.md → 04-ui.md → 05-edge-cases.md → 06-tech-choices.md → 07-acceptance.md`

   For EACH concern file:
   a. **If concern is `04-ui.md`:** run UX Interpretation Protocol in orchestrator first (elicit intent, announce interpretation in **L3-03 canonical 4-bullet format**, validate interpretation with user). Then dispatch sonnet sub-agent with validated interpretation inlined. **THEN trigger Step 5.5 (parallel mockup dispatch) — do NOT skip.**
   b. Dispatch sub-agent (template below) at the concern's tier with concern-specific context.
   c. Wait; verify commit landed with `Model: <tier>` trailer matching declared tier.
   d. Surface draft gist to user: *"Drafted storm/specify/<NN>-<module>/<concern>.md: [1-line gist]. Approve / adjust / discuss?"*
   e. On adjust → dispatch again with feedback.
   f. **If sub-agent makes an autonomous decision** (per L2-05 sub-agent decision discipline): sub-agent appends entry to `_decisions.md` with format below. If sub-agent returns BLOCKED on a business decision → orchestrator surfaces to user, gets pick, dispatches re-draft with decision inlined.
5.5. **Parallel mockup dispatch (v1.4 W-G26 — canonical §1.1.2 example):** after `04-ui.md` validated and committed, dispatch **3 sonnet sub-agents in a single Agent tool-call batch** (parallel, no inter-dependency):
   - sub-agent A → `04-ui/mockup-v1.html` Conservative
   - sub-agent B → `04-ui/mockup-v2.html` Bold
   - sub-agent C → `04-ui/mockup-v3.html` Wildcard

   Each reads `04-ui.md` + `08-design-system.md` + `00-domain-lens.md`, generates HTML mockup via `/frontend-design` (preferred — official Claude Code marketplace plugin (`claude-plugins-official/frontend-design`), D4 baseline; see Tool Preferences in `.claude/rules/storm-protocol.md` — the rule applies to ad-hoc design exploration off this happy path too, per #FF-019) OR direct render only if `/frontend-design` unavailable. Each commits atomically with `Model: sonnet` trailer. Orchestrator waits for all 3, then surfaces: *"Three mockup variants ready: v1 Conservative, v2 Bold, v3 Wildcard. Pick which resonates."* On human pick → orchestrator writes `04-ui/_picked.md` with pick + rationale (verbatim or paraphrased from human) + lockstep DAG citations.
6. **Task breakdown (orchestrator responsibility):** after all concerns approved AND mockup picked, orchestrator ensures `_index.md` contains a task list honoring granularity discipline (≤ 1.5 min/task, ≤ 1 file or 1 logical unit, no "and"-joined tasks). If sub-agent's draft violates this, dispatch a re-draft targeting `_index.md` only.
7. **Exit marker (main session commit):** `storm:SPECIFY:<module>::approved - 8 concerns + 3 mockups + pick approved` with Model:/Felt: trailers. **NEVER delegated to a sub-agent (per #FF-009b).**

## `_decisions.md` Format (v1.4 L2-05)

Append-only log of sub-agent autonomous decisions across the module's SPECIFY lifecycle:

```markdown
---
storm-phase: specify
storm-module: <slug>
storm-depends-on:
  - storm/specify/<NN>-<slug>/_briefing.md
storm-canonical: false
---
# Sub-Agent Decision Log — module `<slug>`

## Autonomous Decisions (per CP-7 technical scope, L2-05)

### D-001 — Schema choice: native ENUM vs text+CHECK for status field
- **Sub-agent:** 01-data-model.md drafter (opus)
- **Decision:** native PostgreSQL ENUM
- **Rationale:** indexing performance + type safety; project already on PostgreSQL 16
- **Cross-cite:** 03-rules.md uses ENUM values verbatim

### D-002 — Lib choice: better-auth vs next-auth
- **Sub-agent:** 06-tech-choices.md drafter (opus)
- **Decision:** better-auth
- **Rationale:** profile-fit override per L2-12 — better-auth higher-level, ~40% less bespoke code
- **Verification:** Context7 /websites/better-auth as of 2026-05; WebFetch cross-check confirmed shipping

## BLOCKED Returns (kicked back to orchestrator for human pick)

### B-001 — Approval flow: single-step vs 2-step manager approval
- **Sub-agent:** 02-flows.md drafter (sonnet)
- **Why blocked:** business decision per CP-7 — affects user-roles + flow latency
- **Resolved at:** turn 14 (human picked: 2-step manager approval)
- **Cascade:** updated 02-flows.md + 01-data-model.md (added approval_status field) + 04-ui.md
```

## UX Interpretation Protocol (orchestrator-side, before ui.md dispatch) — v1.4 L3-03

1. Elicit human intent in business language: *"What does the user need to see / do here?"*
2. **Hat-switch to UX designer** (narrate to user).
3. Interpret intent → concrete UX pattern. Announce in **canonical 4-bullet format (L3-03)**:
   - **You said:** *"[verbatim quote or close paraphrase]"*
   - **I interpret as:** [concrete UX pattern w/ design-vocabulary]
   - **Why this fits:** [1-2 sentences grounded in Domain Lens + design-system + flow constraints]
   - **Validate?** [explicit checkpoint — confirm interpretation, redirect, or discuss]
4. User validates **interpretation** (not design choice).
5. Inline the validated 4-bullet interpretation in the ui.md sub-agent prompt verbatim.

## Sub-agent dispatch template (Agent tool)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY per-concern** (per #FF-003 + #FF-017) — `"sonnet"` for `_index/flows/rules/ui/edge-cases`; `"opus"` for `data-model/tech-choices/_audit`. Never omit.
- `description`: `STORM SPECIFY draft <concern> for <module>`
- `prompt`: fill template below — substitute every `{TIER}` with the value passed to `model:`

**Sub-agent timeout fallback (per #FF-008):** if a forked sub-agent times out ≥2× for the same concern, orchestrator falls back to direct-draft on the same tier (preserves tier discipline via `Model: <tier>` trailer; commit body notes the deviation).

```
You are a STORM SPECIFY sub-agent running on {TIER} tier. Draft ONE concern file.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

MODULE: <module name> (folder: storm/specify/<NN>-<module-slug>/)
CONCERN FILE TO DRAFT: storm/specify/<NN>-<module-slug>/<concern>.md
UPSTREAM CONTEXT (must read):
- storm/structure/03-modules.md
- storm/structure/06-build-order.md
- storm/structure/08-design-system.md (for 04-ui.md)
- storm/specify/<prior-modules>/_index.md (patterns, tech already chosen)
- storm/specify/<NN>-<module-slug>/<prior-concerns-already-drafted>.md (if any)

CONCERN-SPECIFIC REQUIREMENTS:
<inline based on which concern — see storm-specify.md reference for what each concern should contain:
- _index.md: summary, links, task list honoring granularity (≤1.5 min/task, ≤1 file/unit, no "and"-join). **§0 Inheritance block (Shared-Thread Inheritance convention, WORKFLOW §3.3):** if this module inherits a cross-cutting mechanism owned by a canonical home (permission gate, event-emit helper + taxonomy, audit-field tuple, UTC rule), open _index.md with: `## §0 Inheritance` then one line per inherited mechanism — *"INHERITED from `<home> §<rule-ID>` — `<mechanism>` not restated here; this module owns only `<its domain-specifics>`."* Cite the home's stable rule-ID; do NOT restate the mechanism. If the module inherits nothing, OMIT the block entirely (no-op, not a violation — convention is unenforced per the 0%-re-statement evidence).
- 01-data-model.md: schema + relationships, AI-decided per CP-7. **Embed a Mermaid `erDiagram` as the CANONICAL source for entities/FK/cardinality (#E4 Item 4a, WORKFLOW §3.2); prose = annotation only (the "why"/conditionals the notation can't show). Renders natively on GitHub.**
- 02-flows.md: user flows, business options
- 03-rules.md: business rules (explicit from human-approved decisions)
- 04-ui.md: UX interpretation rendered as concrete pattern + mockup — validated interpretation inlined by orchestrator: <PASTE>
- 05-edge-cases.md: enumerated + handled
- 06-tech-choices.md: INVOKE CP-6 verification gate — Context7 primary, WebFetch time-anchored secondary
- 07-acceptance.md: authored AC oracle per #E4 Item 4b — one User-Story + observable acceptance-criteria block per role×flow (see WORKFLOW §7.4 for format). Capstone: drafted last, synthesizes concerns above. NO-OP stub if infra-only module (no user-facing role×flow).>

PRE-APPROVED DECISIONS (inline from orchestrator): <paste relevant decisions>

VERIFICATION GATE (for tech-choices.md only):
1. For each library candidate: `npx ctx7@latest library "<name>" "<question>"` → pick ID → `npx ctx7@latest docs <id> "<question>"`
2. Cross-check with WebFetch if ambiguous: `"latest <X> as of <Month Year>"`, `"<X> deprecated merged abandoned <Month Year>"`
3. Cite source in tech-choices.md body.
4. If no confident answer → surface uncertainty. Do NOT fabricate.

LATEST-STABLE + PROFILE-FIT RULE (per #FF-004):
5. **Latest-stable, no version floors:** pick the latest stable release (latest active LTS for runtimes). Do NOT add conservative "version-floor" caveats at SPECIFY time — those are SHIP-phase concerns. Verify currency via Context7/WebFetch; do not default-down.
6. **Head-to-head for non-trivial picks:** for any auth/session/infra/framework concern (anything where a higher-level option might exist), compare ≥2 candidates side-by-side in tech-choices.md before picking. Document bench score, snippet count, source reputation, and bespoke-LOC delta.
7. **Profile-fit weighting:** prefer the higher-level option that reduces bespoke code unless a documented architectural constraint prevents it. User profile = zero-coding, chaotic-mind, demotivated-when-stuck — bespoke code AI must own forever is a cost the user cannot debug. *Never pick a lower-level primitive over a higher-level framework without a head-to-head comparison documented in the proposal.*

STEPS:
1. Read upstream files.
2. Draft the concern file with proper frontmatter (storm-phase: specify, storm-module: <NN>-<module-slug>, storm-canonical: true, storm-depends-on: [upstream list]).
3. Commit atomically:
   Subject: storm:SPECIFY:<module>::<concern> - <1-line gist>
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE concern file. ONE commit. Trailers mandatory.
- NO user interaction. Orchestrator handles all dialogue.
- **FORBIDDEN from firing any exit/PASS/APPROVED marker commit (per #FF-009b).** Return DONE or BLOCKED to orchestrator with your draft; orchestrator owns exit markers.
- **DENSITY-AT-SOURCE (per #FF-027 — keep the file lean at the source; Tier-1 work-loaded, soft-cap ~700):**
  - Your CP-13 7-dim audit goes in the **commit body ONLY — NEVER inside this concern `.md` file.** The deliverable carries spec content for the builder; the audit is process metadata. (Embedding it inflated moscow files 50–130 lines each.)
  - **Cite, don't restate.** Facts owned by a sibling concern (schema in `01-data-model`, rules in `03-rules`) are referenced ("per `01-data-model` §X"), not copied. No coverage / enforcement-map / cross-ref table that merely re-lists what each rule/flow already states.
  - **No boilerplate padding.** Drop empty "None" rows; don't repeat design tokens per-screen (cite `design-system.md` once); no implementation pseudocode in declarative files (`03-rules` states rules, it doesn't implement them).
  - Write the essence, not ceremony. If your draft exceeds ~700 lines, first apply the above; if STILL over, return to orchestrator flagging a split-by-concern candidate (do NOT split unilaterally).

RETURN: file path, commit hash, 1-line gist, any verification citations used, any ambiguities surfaced.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

## Post-dispatch checks (orchestrator)

1. Verify commit subject + `Model:` trailer matches the value passed to `model:` Agent-tool param at dispatch (per #FF-017 — reject on mismatch; do NOT accept the dispatch silently).
2. Read concern file to have context for approval dialogue.
3. For task breakdown in `_index.md`: scan for granularity breach ("and"-joined, multi-file, "implement the whole X"). If found, loop.
4. **Density check (per #FF-027):** if a concern file is >700 lines OR contains a `[Self-critique pass]` / `[CP-13 audit]` block (audit leaked into the deliverable), loop: re-dispatch density-at-source (extract audit to commit body, cite-not-restate, cut overhead) BEFORE split. Only after density, if still >700, decide split-by-concern → `_index` fallback per WORKFLOW §2 ladder.

## Cross-file consistency audit (per #FF-007 — MANDATORY before APPROVED marker)

After all 8 concerns are drafted and individually approved, BEFORE firing the module APPROVED marker commit, spawn a fresh opus auditor sub-agent:

```
You are a STORM SPECIFY cross-file consistency auditor.

UPSTREAM: storm/structure/*.md (read all 8 files for cross-module references)
SUBJECTS: storm/specify/<NN>-<module-slug>/_index.md, 01-data-model.md, 02-flows.md, 03-rules.md, 04-ui.md, 05-edge-cases.md, 06-tech-choices.md, 07-acceptance.md

CHECK every divergence between concern files within the module:
- FK references (table.column names match across data-model + rules + flows)
- Enum values + types (native ENUM vs text+CHECK consistent across all files)
- Function signatures (arity + arg names match between data-model + rules + edge-cases)
- Column names (post-cascade renames propagated to ALL files, not just data-model)
- Library/version pins (tech-choices versions match any version cited in other files)
- Shared-resource contracts when this module touches them (audit-outbox pattern, Redis keyspace, BullMQ queue names, UI primitive numbers from design-system §7)
- Cross-module pattern adherence: if any first-mover module established a shared pattern, this module conforms or explicitly departs (with rationale + user-approval note).
- **Diagram entity-coverage (#E4 Item 4a):** where a Mermaid diagram is canonical (the `01-data-model` `erDiagram`), verify every entity referenced in `02-flows`/`03-rules` appears in the diagram and the diagram is well-formed. Catches silent omission (the diagram's one real failure mode). Do NOT check "diagram == prose" — the canonical diagram has no prose-copy to diff.
- **Acceptance coverage-gate (#E4 Item 4b, HARD):** auditor verifies every role×flow in `02-flows.md` (vs `02-user-roles.md`) has a story + ≥1 observable AC in `07-acceptance.md`; any gap = FIX-REQUIRED, blocks SPECIFY exit. No-op for infra-only modules (no role×flow).

OUTPUT: storm/specify/<NN>-<module-slug>/_audit.md with PASS or FIX-REQUIRED verdict + numbered findings.

HARD RULE: ANY divergence = FIX-REQUIRED. Orchestrator MUST loop on fixes before APPROVED marker.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param — `"opus"` for this audit). Commit as: storm:SPECIFY:<module>::audit - <PASS|FIX-REQUIRED N findings>
Trailers: Model: {TIER}, Felt: <ok|long>

HARD RULE: FORBIDDEN from firing the module APPROVED/exit marker (per #FF-009b). Only the audit commit. Orchestrator fires the APPROVED marker after PASS.
```

Orchestrator loops on FIX-REQUIRED findings until audit returns PASS, then fires APPROVED marker.

## Exit (per module) — v1.4 W-G29

All 8 concern files approved. No TBDs on `03-rules.md` / `02-flows.md`. `06-tech-choices.md` has verification citations. `07-acceptance.md` exists with every role×flow covered (≥1 observable AC each); acceptance coverage recorded in `_audit.md`. Task list in `_index.md` passes granularity discipline. **Cross-file consistency audit PASS recorded in `_audit.md`.** **Visual baseline locked: `04-ui/_picked.md` exists w/ human's pick + rationale; all 3 mockup variants drafted.** `_decisions.md` reflects all sub-agent autonomous decisions taken. Main session fires exit marker.

## Principles in play

- CP-1 counselor (approval per concern)
- CP-2 hat-switch (per concern domain)
- CP-5 fragmentation (per-concern files)
- CP-6 tech discipline (verification gate inside sub-agent)
- CP-7 decision split (human validates interpretation, AI drafts)
- CP-9 JIT detail (per-module, not up-front)
- CP-11 exit
- CP-12 recovery (atomic commits + mandatory trailers)
- Model tiering — **enforced via forked opus dispatch**
