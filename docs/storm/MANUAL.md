# STORM Reference Manual

Quick-lookup reference for STORM v1.5.0.

- For narrative walkthrough → `USER-GUIDE.md`
- For installation → `INSTALLATION.md`
- For philosophy → `STORM-FRAMEWORK.md`
- For implementation detail → `STORM-WORKFLOW.md`

---

## Principle Quick Index (CP-1 to CP-15)

| # | Principle | One-liner |
|---|-----------|-----------|
| CP-1 | Counselor, not Executor | Reflect → options → execute after user picks |
| CP-2 | Domain-Expert Hat-Switch | Dynamic expertise, announced explicitly |
| CP-3 | Anti-Abandonment Guard | Scoped encouragement; honor "stop" |
| CP-4 | Transparent Navigation | User always knows phase / doc / decision authority |
| CP-5 | Fragment-First | Small single-concern files, index-tied |
| CP-6 | Tech Choice Discipline | Latest stable, verified via live tools |
| CP-7 | Decision Authority Split | Technical = AI; Business = Human |
| CP-8 | Chaos Container | Auto-park pop-up ideas; no "park?" question |
| CP-9 | Progressive Detail (JIT) | Breadth first; depth only when phase demands |
| CP-10 | Small Wins by Design | Visible achievement at every sub-unit |
| CP-11 | Verifiable Exit | Every phase has observable exit criteria |
| CP-12 | Recovery Built-In | Multi-layer, AI-maintained, self-healing |
| CP-13 | Pre-Action Self-Critique Pass | 7-dim audit (YAGNI/over-eng/broken/gaps/inconsist/contradict/friction) before any proposal |
| CP-14 | Context Economy & Session Hygiene | Context is the scarce resource; spend tokens to protect it (forked dispatch, manifest-only, lean CLAUDE.md, dense work-loaded docs) |
| CP-15 | Co-Owner Posture | Active co-owner: proactive synthesis, duty to disagree, name the sacrificed axis, no decision over-claim |

Deep dive: `STORM-FRAMEWORK.md` Section 4.

---

## Phase Lifecycle

```
CAPTURE ──→ STRUCTURE ──→ SPECIFY ──→ BUILD ──→ REVIEW ──→ SHIP
                                                    ↑
                         (loop-back to SPECIFY/STRUCTURE when needed)
```

**Role transitions (leadership shifts at phase boundaries):**
- CAPTURE (human-led) → STRUCTURE (AI-led) = role-flip ceremony
- STRUCTURE → SPECIFY → BUILD → REVIEW → SHIP: all AI-led with human approval gates on business decisions

**Role transitions ≠ Hat-switches.** Hat-switches happen any time within a phase; role transitions only at phase boundaries.

---

## Phase Exit Criteria

| Phase | Exit |
|-------|------|
| CAPTURE | Human declares *"nothing left to add"* + `storm/capture/03-ideation-coverage.md` confirmed |
| STRUCTURE | All 8 storm/structure files approved + no TBDs + `08-design-system.md` has ≥3 reference apps |
| SPECIFY (per module) | All spec files exist + no TBDs on rules/flows + tech-choices verified + human confirms intent |
| BUILD (per module) | All planned tasks `[DONE]` + end-to-end flow runs + self-tests pass |
| REVIEW | All non-trivial feedback addressed or deferred + human says *"this module is done"* |
| SHIP | Security audit approved + QA clean (no P0/P1) + prod deploy verified + runbook exists |

Full per-phase detail: `STORM-WORKFLOW.md` Section 3.

---

## Loop-Back Matrix

**Direct loop-backs (interrupt current phase, return to earlier):**

| From | To | Trigger |
|------|-----|---------|
| BUILD | SPECIFY | Spec turned out wrong during implementation |
| REVIEW | SPECIFY | Built per spec, but spec itself was wrong |
| REVIEW | STRUCTURE | Foundation is wrong |
| REVIEW | BUILD | Implementation bug (no spec change needed) |
| SHIP | BUILD or REVIEW | Security or QA audit failure |

**Indirect loop-back (does NOT interrupt current phase — scheduled for future work):**

| From | To | Trigger |
|------|-----|---------|
| Any phase | CAPTURE | New scope → parking lot → triaged into a later cycle |

All loop-backs are AI-initiated with explicit reasoning and user approval.

---

## Command Reference

### Project Lifecycle

| Command | Purpose | Args |
|---------|---------|------|
| `/storm-init` | Bootstrap new project | None (interactive) |
| `/storm-capture` | Enter/resume CAPTURE | None |
| `/storm-structure` | Enter/resume STRUCTURE | None |
| `/storm-specify` | Enter SPECIFY for a module (JIT per CP-9) | `[module]` optional; AI suggests if blank |
| `/storm-build` | Enter/resume BUILD for active module | None |
| `/storm-review` | Enter REVIEW for current module | None |
| `/storm-ship` | Enter SHIP phase | None |

### Self-Critique (CP-13)

| Command | Purpose | Args |
|---------|---------|------|
| `/storm-audit` | User-summoned 7-dim audit on proposal/artifact/decision | `[last \| filename \| "decision: <text>" \| cascade]` |

Auto-fire triggers usually handle audit (per CP-13). Use this command for retroactive audit or mid-discussion sanity check.

### Test Harness

| Command | Purpose | Args |
|---------|---------|------|
| `/storm-run-scenario` | Run frozen STORM scenario end-to-end (tier-purity guaranteed via forked sub-agents) | `<scenario-name>` |

### State

| Command | Purpose | Args |
|---------|---------|------|
| `/storm-status` | Current state report (5-layer cross-check summary) | None |
| `/storm-recover` | Force full recovery cross-check with report | None |

### Parking Lot (project-scope ideas)

| Command | Purpose | Args |
|---------|---------|------|
| `/storm-park "desc"` | Manual park | Description string |
| `/storm-park list` | Show active tickets | — |
| `/storm-park review` | Triage ritual | — |
| `/storm-park resolve #NNN status` | Mark ticket resolved | Ticket ID + status |

Statuses: `integrated`, `scheduled`, `rejected`, `someday`.

**Note:** auto-park (via `storm-phase-guard` skill) handles most cases. Manual park is rare escape hatch.

### Framework Feedback (framework-level friction)

| Command | Purpose | Args |
|---------|---------|------|
| `/storm-feedback "desc"` | Log friction | Description string |
| `/storm-feedback list` | Show active entries | — |
| `/storm-feedback review` | Review ritual (end-of-test) | — |
| `/storm-feedback resolve #F-NNN status` | Mark entry resolved | Entry ID + status |

Statuses: `addressed-in-v1.x`, `deferred` (with reason), `invalid`.

**Scope:** framework-level ONLY. Project-scope ideas go to parking lot.

---

## Skill Reference

Skills auto-trigger by context or are invoked explicitly. In Claude Code, skills are loaded from `~/.claude/skills/` (global) or `.claude/skills/` (project override).

| Skill | Triggers | Purpose |
|-------|----------|---------|
| `storm-phase-guard` | Before phase transitions; out-of-phase requests | Enforce phase invariants, verify exit criteria, route loop-backs, apply anti-stuck protocols |
| `storm-sync-cascade` | Canonical doc change (direct edit OR conversation intent) | Walk DAG, compose propagation plan, get comprehension-check approval, execute atomic cascade, support rollback |
| `storm-recovery` | Session start (first action); `/storm-recover`; detected inconsistency | 5-layer cross-check, fresh-project detection, state reconstruction, discrepancy reporting |
| `storm-friction-detector` | Repeated user confusion; circling frustration; principle ambiguity | Surface framework friction for logging; discriminate scope (framework vs project) |
| `storm-hat-switch` | Before domain-specific response | Announce domain-expert hat explicitly (UX / BA / data architect / security / QA / devops / tech lead / copywriter / product strategist) |

---

## File Structure Reference

### Global (`~/.claude/`)

```
~/.claude/
├── rules/storm-protocol.md          # Always-loaded behavioral rules
├── skills/storm-*.md                # 5 skill files
├── commands/storm-*.md              # 15 command files
└── docs/storm/
    ├── STORM-FRAMEWORK.md
    ├── STORM-WORKFLOW.md
    ├── INSTALLATION.md
    ├── USER-GUIDE.md
    └── MANUAL.md                    # (this file)
```

### Per-Project

```
[project-root]/
├── CLAUDE.md                        # Project memory (AI-maintained)
├── storm/                           # All STORM working artifacts (v1.3 — phase-grouped)
│   ├── capture/                     # CAPTURE phase
│   │   ├── 01-braindump.md          # CAPTURE canonical input
│   │   ├── 02-ai-questions.md       # CAPTURE Q&A log (appears mid-CAPTURE)
│   │   └── 03-ideation-coverage.md  # CAPTURE exit artifact
│   ├── structure/                   # STRUCTURE outputs (v1.4 - 9 files)
│   │   ├── 00-domain-lens.md        # Canonical cross-phase artifact (L3-01)
│   │   ├── 01-vision.md
│   │   ├── 02-user-roles.md
│   │   ├── 03-modules.md
│   │   ├── 04-scope.md
│   │   ├── 05-dependency-map.md
│   │   ├── 06-build-order.md
│   │   ├── 07-deployment-target.md
│   │   └── 08-design-system.md
│   ├── specify/                     # SPECIFY outputs (per module, JIT)
│   │   └── <NN>-<module-slug>/      # NN = ordinal from 06-build-order.md
│   │       ├── _index.md
│   │       ├── _briefing.md
│   │       ├── _audit.md
│   │       ├── 01-data-model.md
│   │       ├── 02-flows.md
│   │       ├── 03-rules.md
│   │       ├── 04-ui.md             # Includes 04-ui/mockup-v[1-3].html + _picked.md (L3-05)
│   │       ├── 05-edge-cases.md
│   │       ├── 06-tech-choices.md
│   │       └── _decisions.md        # Sub-agent decision log (L2-05)
│   ├── build/                       # BUILD phase
│   │   └── <NN>-<module-slug>/
│   │       ├── _plan.md             # Task plan with [DONE]/[IN PROGRESS]/[PENDING]/[BLOCKED]
│   │       └── <NNN>-task-name/     # Per task (3-digit ordinal)
│   │           ├── context.md
│   │           └── test-results.md
│   ├── review/                      # REVIEW records
│   │   ├── <NN>-review-<module-slug>.md
│   │   └── evidence/<module-slug>/  # Screenshot evidence per flow
│   ├── ship/                        # SHIP artifacts (v1.4 - sequential renumber)
│   │   ├── 01-security-audit.md
│   │   ├── 02-qa-report.md
│   │   ├── 03-smoke-test-plan.md    # Canonical smoke plan (v1.4 W-G38)
│   │   ├── 04-deployment-config/
│   │   └── 05-runbook.md
│   └── meta/                        # Cross-phase artifacts
│       ├── parking-lot.md           # Pop-up idea backlog
│       └── framework-feedback.md    # Framework friction log
└── src/                             # Actual code (AI-managed)
```

**Optional per-project (for override):**
```
.claude/
├── rules/storm-protocol.md          # Override global rules
├── skills/storm-*.md                # Override global skills
├── commands/storm-*.md              # Override global commands
└── settings.json                    # Project-specific permissions
```

Project-level files take precedence over global when both exist.

---

## Frontmatter Schema

Every canonical doc declares:

```yaml
---
storm-depends-on:
  - path/to/upstream.md
storm-phase: [capture|structure|specify|build|review|ship|meta]
storm-canonical: [true|false]
storm-module: [module-name]       # For SPECIFY+ phase docs only
---
```

- **`storm-depends-on`**: upstream docs this file derives from; drives DAG walk for sync cascade.
- **`storm-phase`**: which phase this doc belongs to.
- **`storm-canonical`**: `true` = authoritative source; `false` = AI-derivative.
- **`storm-module`**: scopes SPECIFY/BUILD artifacts to a specific module.

---

## STORM Commit Convention

```
storm:PHASE:MODULE:MILESTONE:TASK - [short description]

[optional body]
```

Fields can be empty (:: with nothing between) but position matters.

**Examples:**
```
storm:META::init - STORM v1 initialized
storm:CAPTURE:::braindump - log initial product concept
storm:STRUCTURE:::modules - propose initial module list
storm:SPECIFY:invoicing::ui - add visual mockup
storm:BUILD:invoicing:m1:task-003 - implement invoice form
storm:REVIEW:invoicing::feedback - resolve UI dissat
storm:SHIP::::deploy-prod - production cutover
storm:SYNC:flows:cascade - propagate approval requirement
storm:ROLLBACK::reverted - task-005 caused regression
storm:META::feedback - log framework friction #F-001
storm:META::park - add #007 export excel
```

**Why it matters:** `git log` is Recovery Layer 2 — atomic commits = authoritative project history.

---

## Parking Lot Ticket Format

```markdown
### #NNN — [Short title]
- **Logged:** YYYY-MM-DD HH:MM
- **Parked at:** [phase + module + task context]
- **Original context:** [user's exact words if relevant]
- **Classification:** feature-expansion | scope-change | tech-question | UX-refinement | integration | bug-followup | other
- **Triage status:** Pending | Scheduled | Rejected | Someday | Integrated
- **Priority:** P0-blocker | P1-important | P2-nice | P3-someday
- **Notes:** [optional AI observations, dependencies, risk flags]
```

Tickets numbered sequentially from `#001`, never reused.

---

## Framework Feedback Entry Format

```markdown
### #F-NNN — [Short title]
- **Logged:** YYYY-MM-DD HH:MM
- **Context:** [phase X, activity Y]
- **Description:** [what happened, in user's or AI's words]
- **Category:** framework-gap | workflow-bug | unclear-principle | feature-request | terminology-confusion | tool-friction
- **Severity:** P0-blocker | P1-friction | P2-annoyance | P3-suggestion
- **Auto/Manual:** auto-detected | user-logged
- **Suggested change:** [if obvious; else blank]
- **Status:** open | in-review | resolved
```

Entries numbered sequentially from `#F-001`, never reused.

---

## Domain-Expert Hat Catalog

Hats announced before domain-specific responses (CP-2). Format: *"Switching to [hat] hat — [one-line framing]."*

| Hat | Scope |
|-----|-------|
| UX designer | UI layout, interaction pattern, microcopy, mockups, density, affordance |
| Business analyst | User flows, approval chains, role responsibilities, business rule tradeoffs, process design |
| Product strategist | Scope decisions, MVP tradeoffs, roadmap sequencing, feature prioritization |
| Data architect | Schema design, relationships, indexing, migrations, normalization |
| Security expert | Authentication, injection, encryption, CVEs, data retention, compliance |
| QA engineer | Test strategy, edge cases, regression, acceptance criteria |
| Devops / SRE | Deployment, infra, CI/CD, monitoring, scaling, incident response |
| Tech lead | Library/framework choice (per CP-6), architecture patterns, refactoring |
| Copywriter | User-facing text, error messages, onboarding copy, naming, voice/tone |

List is not closed; add hats as needed (localization expert, accessibility specialist, etc.).

---

## Recovery Layers (CP-12)

Per CP-12. Each independent, self-sufficient:

| # | Layer | Source | Authority |
|---|-------|--------|-----------|
| 1 | `CLAUDE.md` | AI-maintained summary | Quick reference; may be stale |
| 2 | Git log | `storm:*` commits | Authoritative for history |
| 3 | Plan file markers | `[IN PROGRESS]` / `[BLOCKED]` in `storm/build/*/_plan.md` | Authoritative for in-flight work |
| 4 | Cross-check | Compare Layers 1-3 | Resolves inconsistencies; writes to Layer 1 |
| 5 | Session notes | `storm/meta/session-notes.md` | Informal decisions not yet in formal docs |

---

## UX Interpretation Model (CP-2 + CP-7)

STORM's approach to UI/UX:

```
Human expresses INTENT (in business language)
       ↓
AI wears UX-expert hat — interprets intent → UX pattern
       ↓
AI announces interpretation: "I interpret X as [UX form]. Confirm or redirect?"
       ↓
Human validates INTERPRETATION (not design choice)
       ↓
AI wears UI-designer hat — renders visual, guided by `design-system.md`
       ↓
Human validates VISUAL
```

**Why:** a non-coder doesn't have vocabulary to pick between "scorecard vs chart vs leaderboard". Asking them to decide is theater. Asking them to validate that AI captured *intent* is meaningful.

---

## Detection Triggers (Friction)

Auto-detected by `storm-friction-detector`:
- Same clarifying question asked 3+ times on same topic
- User circles back to same frustration
- User explicitly says *"gw bingung"*, *"gak ngerti"*, *"framework harusnya..."*, *"STORM gak handle..."*, *"I don't understand the framework here"*
- AI encounters a decision where CPs don't give clear guidance
- AI has to pick between interpretations and neither is clearly right
- A loop-back scenario doesn't match any entry in the loop-back matrix

---

## Glossary

**Canonical doc** — authoritative source for a concern at a given phase. Downstream docs derive from it.

**DAG** — directed acyclic dependency graph built from `storm-depends-on` frontmatter. Drives cascade walk.

**Domain Lens** — business framing AI uses in CAPTURE (e.g., *"B2B CRM for Indonesian SMEs"*). Declared and confirmed early; carried through downstream phases.

**Fragment** — small single-concern `.md` file. STORM avoids monolithic specs.

**Hat-Switch** — AI announcing a shift in domain expertise (e.g., *"Switching to UX-designer hat"*). Per CP-2. Distinct from role-transition (which is a phase-boundary leadership shift).

**JIT (Just-In-Time)** — specifying a module only when it's next to build, not all up-front. Per CP-9.

**Parking Lot** — AI-maintained backlog of pop-up ideas that surfaced mid-execution. Tickets triaged at phase boundaries or on demand.

**Role-Flip** — phase boundary where leadership shifts (e.g., CAPTURE human-led → STRUCTURE AI-led). Distinct from hat-switch.

**Sync Cascade** — propagation of a canonical doc change to all downstream dependents. Announced, approved, atomic-commit, revertible.

**Ticket** — single parking lot entry with ID, context, classification, triage status, priority.

**UX Interpretation** — STORM's UI/UX model: human says intent in business language; AI wears UX-expert hat and interprets into UX pattern; human validates interpretation (not design choice); AI renders.

**Valley of Despair** — motivation dip between *"lots of work done"* and *"nothing visible yet"*. STORM prevents via CP-10 (small wins) + CP-11 (clear phase exits).

---

## FAQ

**Q: Can I skip STRUCTURE and go straight to SPECIFY?**
A: No. STRUCTURE establishes build order, deployment target, and design-system. Skipping creates downstream chaos.

**Q: What if I realize my vision is wrong mid-BUILD?**
A: Loop-back to STRUCTURE or SPECIFY is built-in. Claude narrates the loop-back with reasoning, waits for your approval, then executes.

**Q: Can I have multiple modules in BUILD at once?**
A: STORM favors one-at-a-time per CP-9 (JIT). Parallel works but increases coordination cost; not recommended for solo builders.

**Q: How do I handle tech debt later?**
A: Post-SHIP, new scope (including debt) goes to parking lot → triage → integrate or schedule. Same 6-phase cycle, scoped to the debt work.

**Q: What if STORM doesn't fit my situation?**
A: Log it as framework feedback (`/storm-feedback`). STORM v1.x evolves from real usage.

**Q: Does STORM work with teams?**
A: Designed for solo human + AI. Multi-human coordination adds overhead this framework doesn't currently address.

**Q: What's the difference between parking lot and framework feedback?**
A: **Parking lot** (`storm/meta/parking-lot.md`) = project-scope ideas (features, scope questions). **Feedback** (`storm/meta/framework-feedback.md`) = framework-scope friction (STORM itself is unclear). Don't mix.

**Q: How do I pause a project long-term?**
A: Just close. Atomic commits + `CLAUDE.md` preserve state. Next session (days / weeks / months later), `/storm-recover` picks up.

**Q: What if two sessions conflict on state?**
A: Git log is authoritative for history. Claude's cross-check resolves. Discrepancies reported transparently.

**Q: Can I version-freeze a project's framework docs?**
A: Yes — copy `STORM-FRAMEWORK.md` + `STORM-WORKFLOW.md` to the project root. Project copies override global references.

**Q: How does `/storm-init` know what my project is about?**
A: It asks one question: *"Apa yang mau lo build?"* and uses your answer to fill `CLAUDE.md > Project Identity`. Domain lens and deployment target are left to CAPTURE/STRUCTURE phases respectively (per CP-9 JIT).

---

## Cross-References

- **Philosophy:** `STORM-FRAMEWORK.md` (FRAMEWORK.md in some paths)
- **Implementation (Claude Code):** `STORM-WORKFLOW.md`
- **Installation:** `INSTALLATION.md`
- **Walkthrough:** `USER-GUIDE.md`
- **This file:** reference lookup

---

*STORM v1.5.0 — reference current as of 2026-06-02 (source branch; 15 Core Principles incl. CP-14 Context Economy + CP-15 Co-Owner Posture, #E4 cluster Items 1–5). Continued iteration via `feedback-aggregate.md` + `ROADMAP.md`.*
