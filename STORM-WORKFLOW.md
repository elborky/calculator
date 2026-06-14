# STORM Workflow v1.5.0

## Implementation Guide: Claude Code

> How STORM is operationalized with Claude Code as the AI-pair toolchain.

---

## Status: v1.5.0

v1.4.5 shipped 2026-05-25 — patch on top of v1.4.4. (1) **#FF-018 trailer-format regression closed**: pre-commit hook tightened from regex-based scan to `git interpret-trailers --parse` so it now catches the malformed pattern where a blank line between `Felt:` and `Co-Authored-By:` truncates the parseable trailer block (75% extraction coverage in dealflow test-8 — Hook said PASS, parser saw only `Co-Authored-By:`). Commit templates updated to emit ALL trailers in one contiguous block. §1.1.6 gains 5th invariant making format-canonicalization mandatory. (2) **Parking #004 resolved**: `/storm-start-session` now reports the loaded protocol version + source (project / global) at the top of every session-open report.

v1.4.4 shipped 2026-05-25 — measurement integrity hardening (#FF-017 from dealflow field-test). DISPATCH RULE block in all 8 dispatch commands enforces explicit `model:` Agent-tool param; hardcoded tier literals replaced with `{TIER}` variable interpolation pattern; `.githooks/commit-msg` gate rejects `storm:` commits missing `Model:`/`Felt:` trailers (project opt-in via `scripts/install-storm-hooks.sh`); new §1.1.6 Measurement Integrity Contract documents 4 invariants. Trailer is now ≥95% trustworthy as a tier-validation signal.

v1.4.3 shipped 2026-05-25 — STRUCTURE hero mockup (#F-010): single `storm/structure/09-hero-mockup.html` added as visual anchor manifestation of `08-design-system.md`. Inspirational reference only (no diff-vs-hero enforcement); SPECIFY per-module 3-variant pattern untouched.

v1.4.2 shipped 2026-05-24 — CP-13 introduced with §1.2 operational detail (7-dim self-critique, 9 auto-fire triggers, sub-agent CP-13 contract, anti-ritual rules). See `STORM-FRAMEWORK.md §Framework Status` for the full graduation note.

v1.4.x lifecycle-review pass shipped 2026-05-24 — 95-item changelog across 10 batches: CAPTURE 2-stage entry + PRD 4-mode (#F-004 resolved), CP refinements (CP-1/3/4/6/7/8/11), Domain Lens canonical at `storm/structure/00-domain-lens.md`, 8-layer REVIEW auto-verification with P0-P3 severity, 3-mockup variant + `_picked.md` baseline lock, B2.1 forked sub-agent dispatch hardened across all 6 phase commands, Recovery refactored to 4 Layers + Foundation, SHIP W-G36-39 re-ordered (topology→migration→smoke-plan-canonical). See `storm/meta/CHANGELOG-v1.4.md` for batch-level detail. v1.4.1 doc polish: scenarios §9.1-9.6.

v1.3 shipped 2026-05-23 — structural reorganization of the prescribed file/folder layout (all phase artifacts under `storm/<phase>/`, numbered file prefixes, `<NN>-<slug>/` module folders, `storm/meta/` for cross-phase artifacts). See §2 for the full tree. Migration guide: `docs/MIGRATION-v1.2-to-v1.3.md`.

v1.2 shipped 2026-05-23 (same day as v1.3 — accumulated DealFlow backport graduated together with structural reorg). 16 framework-feedback tickets resolved. 12 became new rules (per-concern tier, scope-verify, upstream-read gate + `_briefing.md`, cross-file audit, sub-agent exit-marker prohibition, schema-migration expand-then-contract, verification phase ownership, Context7 lag awareness, orchestrator turn-budget, latest-stable + profile-fit, verify-before-flag, timeout fallback). 3 log-only resolutions. 1 parked. See `STORM-FRAMEWORK.md` §Framework Status for the full graduation note and `feedback-aggregate.md` for ticket-level detail.

v1.1 shipped 2026-04-18 after 3 field run-tests resolving #F-001, #F-002, #F-003, #F-006.

**Feedback loop:** A framework-feedback mechanism (see Section 11) captures friction points as they surface. Review feeds into continued v1.x iteration.

---

## Table of Contents

1. [Relationship to Framework](#1-relationship-to-framework)
2. [File & Folder Structure](#2-file--folder-structure)
3. [Per-Phase Operational Detail](#3-per-phase-operational-detail)
4. [The Sync Implementation](#4-the-sync-implementation)
5. [Parking Lot Implementation](#5-parking-lot-implementation)
6. [Recovery Layers](#6-recovery-layers)
7. [UI/UX Workflow](#7-uiux-workflow)
8. [Claude Code Integration](#8-claude-code-integration)
9. [Scenario Walkthroughs](#9-scenario-walkthroughs)
10. [Framework Feedback Mechanism](#10-framework-feedback-mechanism)
11. [Quick Reference Card](#11-quick-reference-card)

---

## 1. Relationship to Framework

| Framework (Part 1) says | Workflow (Part 2) delivers |
|------------------------|---------------------------|
| CP-5 Fragment-First | Concrete file structure, naming conventions, split thresholds |
| CP-11 Every Phase Has Exit | Per-phase exit checklists, anti-stuck protocols |
| CP-12 Recovery Is Built-In | Multi-layer recovery implementation (CLAUDE.md + git + plan files + session handoff + self-healing protocol) |
| Sync Contract | DAG tracking format, detection via file-watch + session-start, cascade commands, rollback via git |
| Parking Lot | Ticket schema, slash commands, triage ritual at phase boundary |
| UI/UX Interpretation | Mockup format, `design-system.md` structure, `ui.md` template, checkpoints |

**Rule of thumb when reading:** If Framework states *what* and *why*, Workflow states *how*.

---

## 1.1 Speed as a WORKFLOW Cross-Cutting Principle

Speed is not a phase or a feature — it is a discipline that touches every command, every dispatch, and every commit. Slow loops kill motivation (CP-3 risk). Fast loops compound dopamine (CP-10 leverage). This section makes the speed levers explicit so they are honored across all phases.

### 1.1.1 Model Tiering (per-concern)

| Tier | Use for | STORM commands |
|---|---|---|
| **Haiku** | Mechanical read + format; status reports; index regeneration | `storm-status` |
| **Sonnet** | Conversational turns; classification; routine code execution; demo + feedback collection | `storm-capture`, `storm-build`, `storm-review`, `storm-init`, `storm-feedback`, `storm-park`, `storm-recover` |
| **Opus** | Heavy reasoning; architecture decisions; deep audits; tech verification gates | `storm-structure`, `storm-specify`, `storm-ship` |

**Per-concern override (#FF-003):** even within a single phase, a sub-agent can be dispatched at a different tier than its parent command. STRUCTURE may dispatch mechanical file-tree drafting to sonnet while keeping Domain Lens inference on opus. SPECIFY may dispatch audit-only sub-agents on sonnet while reserving opus for tech-choice verification. The tier table above is the *command default*; sub-agent dispatch picks tier per sub-task.

### 1.1.2 Forked Sub-Agent Dispatch (B2.1 architecture)

Heavy compute work — artifact drafting, code writing, audit generation, security review — is dispatched to **forked sub-agents** with declared `model:` tier via the Agent tool. The orchestrator (main session) stays conversational: interview, approval gates, demo, deploy narration.

**Why it matters for speed:**

1. **Tier purity.** Sub-agent honors its declared tier regardless of the parent session's default. Without forked dispatch, follow-up turns inherit the session default (often opus), poisoning measurement and overspending on mechanical work (root cause of test-7 trailer breach + tier drift).
2. **Context isolation (the core reason — CP-14).** Sub-agent only sees its `_briefing.md` + scoped reads — the orchestrator's accumulated history is not paid for again on every dispatched turn. This protects the orchestrator's context window, which is the AI's scarce runtime resource (FRAMEWORK Core Belief §1 / CP-14). When a session's context fills, the AI enters the **dumb-zone**: it loses the thread, contradicts earlier decisions, and its output stops matching intent — catastrophic for a non-coder who can't read the code to catch the drift. Forking heavy work to a fresh sub-agent (clean context) trades cheap tokens for scarce context. This is the dominant motive, not just a speed perk.
3. **Parallel dispatch.** Independent sub-tasks (e.g., audit + draft) can fork concurrently; serial only when there is true data dependency.

Full architecture in §8.7. Honor the contract there for every dispatch. The context-economy discipline this serves is codified as **CP-14** (FRAMEWORK §4).

### 1.1.3 Turn-Budget ≤6 (per orchestrator command, per #FF-013)

Each orchestrator command has a soft turn budget of **6 conversational turns** with the user. Beyond 6 turns inside one command = signal of one of:

- Sub-agent dispatch missed an opportunity (too much done in orchestrator)
- Counselor pattern fatigue (too many serial options-passes; batch per CP-1 anti-fatigue)
- Phase boundary crossed silently (loop-back warranted)

When turn 6 lands without exit criteria met → orchestrator MUST surface the budget overrun and propose: (a) dispatch remaining work to a sub-agent, (b) batch outstanding decisions into one options-pass, or (c) exit the command and re-enter fresh.

### 1.1.4 Eliminate-Loop Levers (INV-01)

Speed is also won by **not running** unnecessary loops:

- **Granularity discipline** — `≤ 1.5 min/task, ≤ 1 file/unit` (test-4 validated; coarser slicing was the test-3 culprit, not missing parallelism).
- **YAGNI scope guard** — braindump's *"lo pilih aja"* defaults to SKIP, not BUILD-the-full-module (test-7 root cause #002).
- **Atomic per-artifact commit** — ONE task = ONE commit, never batch (per CP-12 Layer 2 recovery; test-7 root cause).
- **No silent upshift** — match work to tier, do not paper over wrong tier by going opus (poisons measurement; see §8.7).

### 1.1.5 Measurement

Every STORM commit carries `Model:` and `Felt:` trailers. Extract with:

```sh
git log --pretty='%ci %h %s%n  M=%(trailers:key=Model,valueonly=true) F=%(trailers:key=Felt,valueonly=true)'
```

Use this for per-phase / per-task duration analysis and to validate that declared tiering matches actual usage in the field. If `Felt: long` recurs for a given command → log to `framework-feedback.md`; signals the default tier needs a permanent bump or the granularity discipline is slipping.

### 1.1.6 Measurement Integrity Contract (v1.4.4 per #FF-017, extended v1.4.5 per #FF-018)

The `Model:` trailer is the **ground-truth signal** for tier-validation loops (`#FF-003` upshift detection, cost optimization, CP-4 no-silent-upshift enforcement). To remain trustworthy, four invariants MUST hold:

1. **Explicit dispatch param.** Every `Agent` tool call MUST pass an explicit `model:` param (`"sonnet"` / `"opus"` / `"haiku"`). Omitting it causes silent inheritance from the parent session model → trailer becomes fiction. Every storm-*.md command has a `DISPATCH RULE` block enforcing this at the top.

2. **No hardcoded tier strings in prompt templates.** Every sub-agent prompt template uses `{TIER}` as a placeholder for the dispatched tier. Orchestrator substitutes `{TIER}` with the same value passed to the `model:` param at dispatch time. NEVER hardcode `"running on OPUS tier"` or `Model: opus` literal in the template — the literal will leak when the same template is dispatched with a different tier.

3. **Post-dispatch verification.** After each sub-agent commit, orchestrator runs `git log -1 --pretty='%(trailers:key=Model,valueonly=true)'` and compares against the dispatched tier. Mismatch → reject the dispatch, surface to user, do NOT proceed silently.

4. **Pre-commit gate.** Project enables `.githooks/commit-msg` (via `bash scripts/install-storm-hooks.sh`) which rejects any `storm:`-prefixed commit unless `Model:` and `Felt:` are present as PARSEABLE trailers — i.e. they survive `git interpret-trailers --parse`. Catches both absent-trailer regressions AND malformed trailer blocks (per Invariant 5) at write time, not via post-hoc audit.

5. **Contiguous trailer block (v1.4.5 per #FF-018).** All trailers — `Model:`, `Felt:`, and any `Co-Authored-By:` — MUST appear in ONE contiguous block at the very end of the commit message, no blank lines between them. git's canonical trailer parser (`git interpret-trailers --parse`, used by `git log --pretty='%(trailers:key=...)'`) only recognizes the LAST contiguous block as trailers; a blank line truncates Model/Felt out of the parseable set and silently poisons the extraction pipeline. The hook tightened in Invariant 4 enforces this format; commit templates ship the contiguous form.

**Limitation acknowledged:** the trailer remains *self-reported* by the sub-agent — there is no harness-level introspection API today. Invariants 1–4 reduce the failure surface to (a) honest dispatch + (b) honest self-report aligned with the substituted `{TIER}`. A future `ActualModel:` trailer injected by a hook with access to Anthropic API metadata could close the residual gap — deferred to v1.5 (per #FF-017 Fix 3, P1).

**If you observe a `Felt: long` on a declared-sonnet commit OR depth-of-reasoning that does not match the declared tier:** log a measurement-integrity defect to `framework-feedback.md` with the commit hash. This is the field-validation feedback loop made possible by Invariants 1–3.

---

## 1.2 Pre-Action Self-Critique Gate (CP-13 operational)

Operational implementation of CP-13. Every AI recommendation/decision/proposal that affects state runs a 7-dimension audit BEFORE surfacing — visible compact pass in the same turn.

**"Affects state" definition** — see FRAMEWORK CP-13 spec for the canonical table. Operational short form: **trigger fires iff** action will (a) produce a commit, (b) write/edit canonical artifact, (c) propose user-acceptable action, (d) lock a decision, (e) transition phase, (f) compose cascade plan, (g) dispatch sub-agent with task, (h) auto-park, (i) make tech choice, or (j) activate anti-stuck. **Trigger does NOT fire** on file reads, status reports, clarifying questions, exploratory thinking-aloud, tool result narration, input acknowledgement.

### 1.2.1 Trigger Detection

AI MUST self-detect trigger condition before composing response:

| Trigger | Detection cue |
|---|---|
| Artifact completion | Sub-agent reports written file ready to commit |
| Recommendation surfaced | About to say "I propose / Let's do / I recommend / Best option is" |
| Cascade plan composed | About to execute multi-file sync per §4.3 |
| Phase transition | About to invoke `/storm-<next-phase>` or narrate phase exit |
| Tech choice | About to name specific library/framework/component |
| Scope change | About to add/remove module, expand/shrink phase scope |
| Decision authority shift | About to ask user to approve OR autonomously decide |
| Anti-stuck activation | About to invoke CP-11 anti-stuck protocol |
| User summon | User said `/storm-audit` or *"audit dulu"* / *"self-critique dulu"* / *"push back diri lo"* |

If trigger fires → heavyweight visible 7-dim audit. If no trigger → lightweight silent 1-dim premise check (fail → upshift to visible).

### 1.2.2 7-Dimension Audit Procedure

For each dimension, AI MUST:
1. State the question explicitly in own reasoning (not skipped).
2. Check against concrete artifacts: CLAUDE.md (current state), git log (prior decisions), affected docs (cascade reach), user profile (friction cost).
3. Produce 1-line concrete reasoning per dimension — pass or fail.
4. Identify **strongest concern** (most-likely-to-fail dimension, even if it still passes).

### 1.2.3 Visible Output Format (compact, anti-sugarcoat)

```
[Self-critique pass — 7-dim]
Strongest concern: [DIM] — [concrete reasoning, ≤2 lines, may cite known anomaly]
Other 6 dims: clean (rationale: [1-line summary covering remaining checks]) 
   | ⚠️ [DIM] — [1-line concrete reasoning if any other concern]
Cascade: [files affected if proposal accepted, ≤3 lines]
Verdict: [PROCEED | PROCEED-WITH-CAVEAT | DO-NOT-PROCEED-AS-IS]
```

**Anti-ritual rules (hard):**
- NEVER output 7 ✅ without reasoning. Ritual = theater = violates CP-13 spirit.
- On clean pass: identify highest-failure-probability dim + cite concrete artifacts that verified it. Do NOT manufacture concerns. If genuinely all-clean → state `Strongest concern: none — all 7 dims verified against [artifacts]`.
- Concrete examples preferred over abstract assertions (dealflow msg 66 precedent).
- If verdict = `DO-NOT-PROCEED-AS-IS` → AI MUST NOT execute. Propose adjusted alternative OR escalate to user with the failed dimension.

### 1.2.4 Lightweight Silent Pass (default for non-trigger actions)

For routine actions (file reads, status reports, narration, command execution), AI runs internal 1-dim premise check: *"Is my premise verified against actual current state (CLAUDE.md, git, files)?"*

- **Pass:** silent, proceed.
- **Fail:** upshift to visible 7-dim audit before proceeding.

This prevents conversation-bloat while keeping safety gate active at decision moments.

### 1.2.5 Cascade Discipline Hook

Per dealflow source (msg 77): *"Apa yang kita hapus di diskusi ini, hapus juga dari document lain (cascade) agar tidak menjadi residual yang membingungkan."*

When audit changes the proposal:
- Identify all downstream artifacts referencing the changed/removed content.
- Compose cascade plan in same turn (per §4.3 multi-author cascade if multiple sub-agents needed).
- No orphan references allowed — residuals = ambiguity = future audit failures.

### 1.2.6 Interaction Ordering (avoid CP collision)

| Scenario | Order |
|---|---|
| CP-1 counselor surfaces 2-3 options | Each option passes its own CP-13 audit BEFORE counselor presents them |
| CP-6 tech choice proposal | CP-13 subsumes verification-cite (dimensions 5+6 cover it) |
| CP-7 decision authority check | CP-13 friction dim auto-detects theater (asking non-coder to approve technical detail) |
| CP-8 auto-park | CP-13 fires before park — verify ticket scope correct, not premature |
| CP-11 anti-stuck activation | CP-13 fires first — verify trigger is real pattern, not false positive |
| CP-4 narration | CP-13 visible pass IS narration (two-sided narration satisfied via audit output) |

### 1.2.7 Slash Command

`/storm-audit [target]` — user-summoned visible 7-dim audit on a target (last proposal, named artifact, or specified decision). See `.claude/commands/storm-audit.md`.

### 1.2.8 Measurement

CP-13 audit failures (verdict ≠ PROCEED) are signal:
- Track via `Felt:` trailer — audit-triggered rework should mark `Felt: long` (visible self-correction takes time).
- If `DO-NOT-PROCEED-AS-IS` verdict recurs >3 times in one session on same dimension → log to `framework-feedback.md` as pattern signal.

---

## 1.3 Debate-to-Arm (horizontal anti-stuck procedure, CP-11)

A cross-cutting procedure — like §1.1 (Speed) and §1.2 (CP-13), it is not bound to one phase. It can fire in any phase, every time AI is about to hand the user a *business* question. Its job: never throw the user a naked question they cannot answer. When the answer lives outside the user's head, AI **arms the decision** (researches, or maps the trade-off) instead of asking blind. "The user can't answer" is literally a stuck-state — hence CP-11.

**Scope is global, trigger is not.** It may activate anywhere (global SCOPE), but only when the user is genuinely blind — NOT on every question (gated TRIGGER). The gate (§1.3.1) is the anti-fatigue guard.

### 1.3.1 Gate — "Langkah-2" on the CP-7 theater-gate

The CP-7 Decision Authority gate already has Langkah-1: *technical vs business* → technical = AI decides alone. Debate-to-arm adds **Langkah-2** on the business branch — one question: **"where does the answer live?"**

| Where the answer lives | Route |
|---|---|
| In the user's head, sayable now (vision / rules / roles) | **Ask normally** (CP-1 options) |
| Outside the head, findable (norms / thresholds / what-others-do) | **Cheat-sheet ON — research mode** |
| Outside the head, needs weighing consequences (fast vs durable) | **Cheat-sheet ON — trade-off mode** |
| In the head but not yet felt (pure taste) | **Do NOT force** — framing only (a forced debate here manufactures a fake winner) |

Discriminator (research/trade-off vs don't-force): **"is there an objective measure (cost / risk / time / durability)?"** Yes → trade-off (cheat-sheet allowed); pure feel → don't-force.

**Trigger = proactive (primary) + reactive net.** AI classifies proactively before asking; a freeze signal ("I don't know / whatever / you pick / what's best") — a CP-3 sibling — fires a late cheat-sheet if the proactive guess missed.

### 1.3.2 Debate machine — two modes, dynamic seats, persona-not-cosplay

The danger is theater: (a) fake even-handedness ("well, it depends"); (b) **a fake winner** = yes-man laundering — worse than an honest "I don't know."

**Two modes (inherited from the gate's reason-for-blindness, not a new classifier):**

- **Research** → "find the answer"; a winner is **allowed** if the data points to one. Often **one research pass** suffices — no multi-agent drama.
- **Weigh** → "map the costs/benefits"; a winner is **forbidden** — the machine is structurally barred from choosing. This is what kills yes-man drift *by design*, not by hoping the agents behave. Multi-agent contention earns its keep here.

**Seats are dynamic** — as many as there are genuinely *distinct interests* in this question (e.g. feature decision → 3: product-user / developer / CEO; a threshold → 1: researcher). Anti-balloon gears: (a) one seat only per angle that **says something different** — duplicates merge; (b) sane ceiling **~4–5** (beyond that the user is overwhelmed again = back to the original problem).

**Persona = the interest defended, NOT cosplay.** "Be the CEO" as vibes is theater; a persona picks an INTEREST (CEO = business impact/cost; dev = build cost/technical risk; user = will-they-use-it) and every seat MUST carry real substance (concrete consequence / research), not style. Personas are drawn from the project **Domain Lens** + the question type (reuse, not invented from scratch).

**Substrate = forked sub-agents (§8.7) + the REVIEW skeptic-contention pattern.** NOT agent-teams (experimental; collides with CP-6/CP-14).

### 1.3.3 Cheat-sheet — a compact map, not a transcript

One scannable screen. The full debate is kept "behind" (manifest-only, CP-14), expandable on request.

- **Content (weigh question):** Option A/B {✅ gains / ❌ sacrifices} + "what each seat said" (compressed) + "what others usually do" (if research found it) + a **conditional bottom-line**.
- Every option MUST carry its "sacrifices" — the CP-13 Tradeoff discipline lent to the *user's* decision (never sell only the upside).
- **Bottom-line:** research → MAY recommend ("norm is X; follow unless you have a specific reason"); weigh → MUST NOT recommend, give instead **"if you prioritize X → A, Y → B"**. Only the user knows their priority.
- The cheat-sheet is marked **"undecided"** until the user picks; on pick → recorded permanently (anti over-claim, #FF-028).

### 1.3.4 Placement & reuse — zero new CP

Reuses: theater-gate **CP-7** (the gate), **CP-3** (freeze-detect), forked sub-agents **§8.7** + adversarial-verify **REVIEW** (the machine), **Domain Lens** (personas), manifest-only **CP-14** (cheat-sheet), **CP-13 Tradeoff** (sacrifices), **CP-7 + #FF-028** (user-decides / anti-over-claim).

**Ordering vs CP-1 — no double-ceremony.** C1 fires at the *classify* step (CP-7 Langkah-2: *where does the answer live?*). When it routes to research- or trade-off-mode, the resulting **cheat-sheet IS the CP-1 options surface** — not a second pass layered on top of CP-1. The user sees **one** options prompt, never two for the same decision. Firing sequence for a decision: **CP-13** self-critique → **CP-7 Langkah-1** (technical-or-business; technical → AI decides, no ask) → **C1 Langkah-2** (where the answer lives) → render as **CP-1** options (plain options if in-head/sayable; the armed cheat-sheet if findable/weighing; framing-only if pure-taste).

New: this single procedure, registered as a **CP-11 anti-stuck procedure** ("you can't answer" = stuck-state) + a sharpened **CP-7** (records Langkah-2). Honest caveat: "zero new CP" is accurate; "zero new concept" is not — the 4-way where-the-answer-lives sort + the winner-rule are new content, but they ride CP-7 + one procedure, not a CP-16.

---

## 1.4 Craft Floor (caliber, C3 — cross-cutting quality enforcement)

The craft **principle** lives in `storm-protocol.md` → *Caliber — Craft Floor (C3)* + FRAMEWORK CP-7: craft is iron-law, always-high, no dial, AI-autonomous, *enforced never self-attested*. This section is the **operative wiring** — how the bar reaches the work and how it's held. The bar itself is the framework-universal standard **`~/.claude/docs/storm/craft-floor.md`** (project-root `docs/craft-floor.md` fallback at dev time), loaded JIT — never always-loaded (CP-14).

**Loading (rides `_briefing.md`, §8.7.3).** Every BUILD/output sub-agent's `_briefing.md` carries the craft floor **conditional on output-type** — a code agent gets the code floor, not the UI floor (context economy, CP-14). The floor's **operative core** (the self-check + "don't-trust-self-report" block at the end of `craft-floor.md`) is quoted **inline**; the full standard is referenced **by path**. Breadth = one universal **spine** + per-discipline **floors**; non-code floors (UI/security/data) are authored **JIT** when a module first produces that output (CP-9), not pre-written.

**Sieves (each rides an existing gate — no new machinery):**

| Sieve | Where | Mechanism | Strength |
|---|---|---|---|
| **1 — per-output** | BUILD, sub-agent | self-check against the floor's operative core before returning | weakest (self-report) |
| **2 — per-task** | commit-msg hook + CP-13 | deterministic measurement-integrity hook (`Model:`/`Felt:` trailers) + the per-commit CP-13 7-dim audit | narrow but deterministic |
| **3 — per-module (machine)** | REVIEW **Layer 7** | **deterministic static guards** (tsc / lint / test / module-smoke / nav-coverage / resource-existence) — already NEVER-opt-out; the floor **mandates extending** L7 / CI with SAST / secret-scan / CVE / lockfile-integrity (not all auto-run today) | strongest (can't be fooled) |
| **4 — per-module (judgement)** | REVIEW **Layer 8** | **independent adversarial reviewer** (fresh-context opus, briefed to *find craft-floor violations*) — for what a machine can't grade (clarity, design) | strong (cross-context) |
| **5 — per-owner** | REVIEW report | **plain-language craft report** to the owner (cures "craft is invisible to a non-coder") | legibility |

**Two-tier core principle — never trust self-report.** LLMs can't reliably self-correct (self-correction illusion, Huang et al. arXiv:2310.01798), so the load-bearing tiers are the **deterministic machine** (sieve 3 = REVIEW Layer 7 static guards — can't be fooled) and the **independent reviewer** (sieve 4 = Layer 8, fresh context > same-session self-check). Sieve 1 self-attestation is never trusted alone; sieve 2 is a narrow deterministic gate (measurement + CP-13); sieve 5 makes the result legible to the owner. This is the same enforcement spine STORM already runs — caliber sharpens what L7 and L8 are *briefed to look for* (and names the machine checks L7/CI should grow toward), it does not add a gate. *(Honest scope: today L7 runs tsc/lint/test deterministically; SAST/secret-scan/CVE/lockfile are floor-mandated extensions, not yet all wired — #FF-028 no-overclaim.)*

**Placement & reuse — zero new CP.** Reuses **CP-7** (craft = AI-autonomous authority), **commit-gate + CP-13** (machine tier), **REVIEW Layer 8 + §8.7 forked reviewer** (independent tier), **`_briefing.md` §8.7.3** (loading), **CP-9** (JIT discipline floors), **CP-14** (conditional load, by-path). New content = the standard `craft-floor.md` + the "iron-law GOAL / tunable PROXY" classification; both ride existing authority + gates, not a CP-16.

---

## 2. File & Folder Structure

```
project-root/
├── CLAUDE.md                         # Project memory (STORM-structured, auto-loaded)
├── STORM-FRAMEWORK.md                # Part 1 (reference)
├── STORM-WORKFLOW.md                 # Part 2 (this doc)
│
├── .claude/                          # Claude Code configuration
│   ├── settings.json                 # Permissions, hooks, env
│   ├── settings.local.json           # Local overrides (gitignored)
│   ├── rules/
│   │   └── storm-protocol.md         # Always-loaded STORM rules
│   ├── commands/
│   │   ├── storm-capture.md          # /storm-capture
│   │   ├── storm-structure.md        # /storm-structure
│   │   ├── storm-specify.md          # /storm-specify
│   │   ├── storm-build.md            # /storm-build
│   │   ├── storm-review.md           # /storm-review
│   │   ├── storm-ship.md             # /storm-ship
│   │   ├── storm-init.md             # /storm-init (bootstrap new project)
│   │   ├── storm-park.md             # /storm-park
│   │   ├── storm-status.md           # /storm-status
│   │   ├── storm-feedback.md         # /storm-feedback
│   │   ├── storm-recover.md          # /storm-recover
│   │   └── storm-run-scenario.md     # /storm-run-scenario (test harness — forks each phase to declared-model sub-agent)
│   ├── skills/
│   │   ├── storm-phase-guard.md      # Enforce phase boundary, exit criteria
│   │   ├── storm-sync-cascade.md     # Auto-cascade on doc change
│   │   ├── storm-recovery.md         # Session-start self-healing
│   │   ├── storm-friction-detector.md # Detect friction patterns for feedback log
│   │   └── storm-hat-switch.md       # Announce domain-expert hat switches
│   └── hooks/
│       └── (tool-specific scripts, see Section 8)
│
└── storm/                            # All STORM working artifacts (v1.3 — phase-grouped)
    ├── _index.md                     # Top-level phase navigator
    │
    ├── capture/                      # CAPTURE phase — two-layer substrate (#E6/M1)
    │   ├── _index.md                 # PROJECTION (Layer 2) — REGENERATED, never hand-edited.
    │   │                             #   Producer = /storm-capture (regenerates at CAPTURE
    │   │                             #   entry + exit). 4 parts: (1) line-anchor map into the
    │   │                             #   journal, (2) themes, (3) roadmap-ledger (status/idea),
    │   │                             #   (4) gap-check — mechanical anchor-coverage (#E6/M3).
    │   ├── 01-braindump.md           # JOURNAL (Layer 1) — append-only, raw, user's own words,
    │   │                             #   NEVER overwritten. Canonical CAPTURE input (raw dump
    │   │                             #   OR pasted PRD). One-way arrow: journal → projection.
    │   ├── 02-ai-questions.md        # AI's probing questions + answers
    │   ├── 03-ideation-coverage.md   # CAPTURE exit: human-validated coverage
    │   └── 04-prd-review.md          # v1.4 (L1-07): conditional — present ONLY when user
    │                                 #   entered with structured PRD; covers 4-mode output
    │                                 #   (FULL REVIEW / GAP-ONLY / DISCUSS / SKIP)
    │
    ├── structure/                    # STRUCTURE phase
    │   ├── _index.md
    │   ├── 00-domain-lens.md         # v1.4 (L3-01): AI's inferred domain framing, evidence,
    │   │                             #   AI-synthesized flags, hat-switch implications.
    │   │                             #   Drafted at CAPTURE→STRUCTURE role flip.
    │   │                             #   Re-validated at every SPECIFY entry, REVIEW scope
    │   │                             #   drift, post-loop-back from CAPTURE.
    │   ├── 01-vision.md
    │   ├── 02-user-roles.md
    │   ├── 03-modules.md             # Module map (per #F-008 slug convention)
    │   ├── 04-scope.md
    │   ├── 05-dependency-map.md
    │   ├── 06-build-order.md         # Build sequence — defines module folder ordinals
    │   ├── 07-deployment-target.md
    │   ├── 08-design-system.md       # Aesthetic direction (project-wide)
    │   └── 09-hero-mockup.html       # v1.4.3 (#F-010): visual manifestation of design-system,
    │                                 #   inspirational anchor (NOT baseline — per SPECIFY 04-ui
    │                                 #   variants stay independent, rooted in 08-design-system.md
    │                                 #   + this hero as visual reference; no diff-vs-hero gate)
    │
    ├── specify/                      # SPECIFY phase (per module, JIT per CP-9)
    │   ├── _index.md                 # Cross-module specify navigator
    │   └── <NN>-<module-slug>/       # NN = ordinal from 06-build-order.md; slug per #F-008
    │       ├── _index.md             # Module summary + task list
    │       ├── _briefing.md          # v1.2 (#FF-016): orchestrator-synthesized canonical
    │       │                         #   facts + citations + open questions, drafted
    │       │                         #   BEFORE any concern sub-agent dispatch
    │       ├── _decisions.md         # v1.4 (L2-05): sub-agent autonomous decisions log
    │       │                         #   (tech picks, schema choices) + BLOCKED returns
    │       │                         #   on business decisions kicked back to orchestrator
    │       ├── 01-data-model.md      # Schema + relationships (opus tier)
    │       ├── 02-flows.md           # User flows (sonnet tier)
    │       ├── 03-rules.md           # Business rules (sonnet tier)
    │       ├── 04-ui.md              # UX interpretation (sonnet) — L3-03 canonical format
    │       ├── 04-ui/                # v1.4 (L3-05): visual mockup variants subdir
    │       │   ├── mockup-v1.html    #   Conservative — closest to design-system baseline
    │       │   ├── mockup-v2.html    #   Bold — stretches aesthetic in domain direction
    │       │   ├── mockup-v3.html    #   Wildcard — different paradigm sanity check
    │       │   └── _picked.md        #   Human's pick + rationale; LOCKS visual baseline
    │       │                         #   for BUILD diff-vs-baseline + REVIEW Layer 5
    │       ├── 05-edge-cases.md      # Enumerated + handled (sonnet tier)
    │       ├── 06-tech-choices.md    # Libraries/frameworks per CP-6 (opus tier)
    │       ├── 07-acceptance.md   # v1.5 (#E4 Item 4b): authored AC oracle — User Story + observable AC; REVIEW L1 verifies app vs THIS
    │       └── _audit.md             # v1.2 (#FF-007): cross-file consistency PASS verdict
    │                                 #   from fresh opus auditor; MANDATORY before APPROVED
    │
    ├── build/                        # BUILD phase
    │   ├── _index.md
    │   └── <NN>-<module-slug>/       # mirrors specify/ ordering
    │       ├── _plan.md              # Task list with [PENDING]/[IN PROGRESS]/[DONE]
    │       └── <NNN>-<task-name>/    # 3-digit ordinal per task (build can exceed 99)
    │           ├── context.md        # What, why, references to specs
    │           └── test-results.md   # Unit + integration results
    │
    ├── review/                       # REVIEW phase
    │   ├── _index.md
    │   ├── <NN>-review-<module-slug>.md  # Feedback log + verdict (PASS/FIX-REQUIRED/LOOP-BACK)
    │   └── evidence/                 # v1.2 (#FF-015): AI auto-smoke evidence
    │       └── <module-slug>/        # No NN prefix — keyed by slug for lookup
    │           └── <flow-name>.png   # Screenshot per critical flow — HARD GATE for PASS
    │
    ├── ship/                         # SHIP phase (v1.4: sequential renumber per D2)
    │   ├── _index.md
    │   ├── 01-security-audit.md
    │   ├── 02-qa-report.md
    │   ├── 03-smoke-test-plan.md     # v1.4 (W-G38, #FF-015): canonical smoke-test plan
    │   │                             #   emitted BEFORE handoff; human-runs-AI-assists
    │   ├── 04-deployment-config/
    │   └── 05-runbook.md
    │
    └── meta/                         # Cross-phase artifacts (v1.3)
        ├── parking-lot.md            # Pop-up idea backlog (CP-8)
        ├── framework-feedback.md     # Framework-level friction log
        ├── session-handoff.md        # v1.4.x (#FF-024): Recovery Layer 5 — append-only,
        │                             #   newest-on-top. Written at session-end by a fresh
        │                             #   sub-agent from ground truth. Top entry = AI recovery;
        │                             #   history = user assurance / project journey.
        ├── session-delta.md          # v1.4.x (#F-012): bounded outbox for THIS session's
        │                             #   verbal-only decisions/open-questions. Orchestrator
        │                             #   writes it BEFORE the exit-ritual dispatch so the
        │                             #   ground-truth sub-agent can fold them in tagged
        │                             #   [conversation-claim]. On-demand, NOT in CLAUDE.md.
        └── module-status.md          # v1.4.x (#FF-023): deploy-pipeline tracker (grid:
                                      #   module → staging/prod SHA + ship date). AI-maintained
                                      #   at REVIEW-PASS + SHIP-exit; read on-demand by session
                                      #   commands (NOT auto-loaded — kept out of CLAUDE.md).

└── src/                              # Actual code (managed by AI; outside storm/)
    └── ...
```

**Naming conventions (v1.3):**

- **All STORM artifacts use lowercase-kebab-case.**
- **Phase folders live under `storm/`** — `storm/capture/`, `storm/structure/`, `storm/specify/`, `storm/build/`, `storm/review/`, `storm/ship/`. Cross-phase artifacts in `storm/meta/`.
- **Numbered prefix on files:** `01-<name>.md`, `02-<name>.md`, etc. Files ≤99 use 2-digit zero-padded; files (e.g., BUILD tasks) that may exceed 99 use 3-digit (`001-`, `002-`). Number = drafting/reading order within the phase.
- **Underscore-prefix files (NO number)** = orchestration / synthesized artifacts: `_index.md`, `_briefing.md`, `_audit.md`, `_plan.md`. They sort to top in alphabetical listings, signaling "read this first."
- **Module folders under `storm/specify/` and `storm/build/`** = `<NN>-<module-slug>/` where:
  - `NN` = 2-digit ordinal from `storm/structure/06-build-order.md` (NOT row order in modules.md). Numbering = "kapan saya kerja ini," ADHD-friendly progress sequence.
  - `<module-slug>` = human-readable kebab-case per #F-008 (e.g., `01-identity-access/`, `02-audit-trail/`, `03-lead-management/`). NEVER opaque (`01-m1`, `01-cc-1`).
- **`storm/review/` files** = `<NN>-review-<module-slug>.md`. Multiple review events for same module accumulate sequential NN.
- **`storm/review/evidence/<module-slug>/` subdir** = NOT numbered (lookup-keyed by slug for fast match with review log).
- **Parking lot tickets** = numbered `#NNN` starting at `001`.
- **Framework feedback tickets** = `#F-NNN` (framework-dev project) or `#FF-NNN` (per-project, backportable).
- Framework feedback tickets: `#F-NNN` (framework-dev project) or `#FF-NNN` (per-project, backportable)

**Fragmentation thresholds (v1.4 per L5-01; tiered + density-first per #FF-027, 2026-06-02 — concrete numbers, not vibes):**

Thresholds are **tiered by load-behavior**, not raw size — a doc's danger depends on whether the AI loads it during active phase work (dumb-zone risk, CP-14) or reads it deliberately on consultation.

| Tier | What | Cap |
|---|---|---|
| **Tier-1 — work-loaded** | docs the AI loads while doing phase work: SPECIFY concern files (`01-data-model`/`02-flows`/`03-rules`/`04-ui`/`05-edge-cases`/`07-acceptance`), structure files, `design-system.md` | **soft-warn ~700, HARD ~1000** |
| **Tier-2 — reference-on-demand** | read deliberately in full when consulted: `STORM-WORKFLOW.md`, `STORM-FRAMEWORK.md`, archives | **soft / optional** (>800 OK; split only for readability, not enforced) |
| **CAPTURE / raw human dump** | `capture/01-braindump.md`, PRD inputs | **uncapped** — capping a raw human dump chills capture. Fix consumption, not size: large CAPTURE docs are consumed via `_index` targeted-section reads, NOT full-read (see §3 #FF-016 gate). |

- **<100 lines:** DO NOT fragment further (micro-fragmentation = navigation cost without comprehension gain).

**Density-then-split LADDER (#FF-027 — order is mandatory; split is the tail, not a parallel lever).** When a Tier-1 doc trips the soft-warn:

1. **Density-at-source FIRST.** Most Tier-1 bloat is NOT flabby prose (essential content is ~52–65% — empirically, an 8-file moscow+dealflow audit 2026-06-02); it is *structural*: (a) the per-sub-agent CP-13 audit block leaking into the deliverable file (it belongs in the commit body — see §8.7.2 rule 6; observed inflating moscow files 50–130 lines each), (b) cross-ref / coverage / enforcement-map tables restating sibling-file content → **cite, don't restate**, (c) template / boilerplate overhead (empty "None" rows, per-item heading skeletons, design tokens repeated per-screen) and implementation leaking into declarative docs (pseudocode in `03-rules.md`). Apply density first — in the audit, 3/5 files dropped to ≤~700 with no split at all.
2. **Split by-concern (CP-5 semantic)** — ONLY if still over after density. Split into genuine sub-concerns, not by line count: `02-flows.md` → `02a-buyer-flows.md` + `02b-seller-flows.md`, NOT `02-flows-part-1` / `part-2`. An oversized single concern is usually a signal the concern itself decomposes.
3. **`_index` fallback** — ONLY when the content is one genuinely indivisible concern that is merely long (can't split without breaking coherence). The file stays whole; add an `_index` (section map + line anchors) so downstream loads target sections, not the full file. `_index` does not shrink the file — it changes how it is consumed.

**Enforcement (drift-control — ride existing machinery, NO new lint):** the Tier-1 size check folds into the `_audit.md` cross-file consistency pass (§8.7.5) + sync-cascade. **Scope: going-forward** — the discipline applies to new work; frozen test-project artifacts are not retrofitted (owner-decided 2026-06-02).

**Anti-pattern (forbidden):** numbering for the sake of numbering. If two adjacent files would each be <100 lines and cover one cohesive concern, KEEP THEM MERGED. Numbering signals reading order, not file-count theater. And: reaching for split BEFORE density — it just spreads the same bloat across more files (the failure the ladder exists to prevent).

---

## 3. Per-Phase Operational Detail

Each phase has: inputs, activities, outputs, exit criteria, anti-stuck protocol. The per-phase anti-stuck protocols below handle *exit-stuck* (criteria not met in time). A *question-stuck* state — the user can't answer a business question AI is about to ask — is cross-phase and handled by the horizontal **Debate-to-Arm** procedure (§1.3), not repeated per phase.

### 3.1 CAPTURE

**Two-layer substrate (#E6/M1).** CAPTURE persists into two layers with a one-way arrow between them:

- **Layer 1 — Journal (`storm/capture/01-braindump.md`):** append-only, raw, the user's own words. **NEVER overwritten** — every dump appends. This is the source of truth.
- **Layer 2 — Projection (`storm/capture/_index.md`):** a **REGENERATED** summary, **never hand-edited**. Holds 4 parts: (1) `_index` — a line-anchor map into the journal (*"idea X at journal lines 40–92"*); (2) themes; (3) roadmap-ledger — status per idea; (4) **gap-check (#E6/M3)** — a **mechanical anchor-coverage** check: every journal chunk must anchor in ≥1 place in parts 1–3; a chunk with NO anchor is a gap. Part 4 just **lists** the unanchored chunks (start-thin — no tiers, no weighting). Deterministic, not AI judging importance (subjective = cry-wolf noise). It rides part-1's anchor map, so its reliability **hangs on the producer's map quality** — a sloppy map weakens coverage; the antidote is the one-way-arrow full regeneration from the journal (no new machinery).
- **One-way arrow = safety net:** the projection never writes back to the journal. If the projection drifts or breaks, **discard and regenerate from the journal** — the raw is impossible to lose.
- **Producer = `/storm-capture`,** which regenerates the projection at **CAPTURE entry** and **CAPTURE exit** (named steps — this fixes the previously producer-less `_index.md`, e.g. moscow's 3600-line braindump with no index).
- **Regenerate = hybrid:** incremental per-visit (cheap, rides the git delta — CP-14) with an occasional full-rebuild reset; the one-way arrow makes drift always recoverable. **No new versioning machine** — rides git + the existing `braindump→ROADMAP→status` pattern.

**Revolving-door lifecycle (#E6/M2) — "lock-on-exit, free-on-entry."** CAPTURE is a **re-openable** phase, not a one-way door. This is the canonical home for re-entry; §9.3 is a worked example pointing back here.

- **The lock = EXIT (the forcing-function).** CAPTURE exits when the **human declares a bounded slice** (*"build X; defer Y, Z to the journal"*). **AI NEVER auto-exits** — it may offer/draft the slice boundary, but the human declares it (auto-lock = CP-7 theater; the declared slice is the convergence forcing-function CP-11 quality-bar #3 names). **3 anti-scope-creep teeth** (this owner's over-engineering trait): (a) the exit MUST **name the deferred items** — brakes the slice from absorbing everything; (b) the roadmap-ledger (projection part 3) makes stagnation **visible** (*"47 ideas / 12 themes / 0 built"*) — CP-10 inverted into informational pressure; (c) cheap re-entry removes the excuse to over-stuff one pass.
- **Re-entry = FREE + first-class.** Re-entering CAPTURE from any later phase is the **same door** (not a parking-lot back-door). Re-openability is NOT the enemy of convergence — it's what makes convergence psychologically cheap: an ADHD/shiny-object builder can declare "this slice is done" only when "done" stops meaning "permanent loss." On re-entry AI:
  1. **Computes the delta** against the journal — what is *new* (journal entries since the last projection commit), what is *already built*, what is *still deferred*. The roadmap-ledger + line-anchor map (projection parts 1+3) are the substrate.
  2. **Routes the delta through a CP-1-gated checkpoint** — for each new item: **new module** / **extend an existing module** / **conflict with built work**. Routing is a **conscious gate, NOT auto** (stress-test #3: if routing is forced fully-automatic, the user's doubt just migrates from the door to *"did it route me right?"*). Smooth intake, gated routing.
  3. **Re-validates the Domain Lens (re-open drift gate, stress-test #5).** A lifelong-growing journal means the Domain Lens can **drift** after modules were built under an older lens. Re-entry is continuous drift, not a discrete re-check: AI re-reads `storm/structure/00-domain-lens.md`, surfaces *"Domain Lens still: [X]. New material suggests [drift / no drift]. Confirm or revise?"* before routing proceeds (cascades downstream if revised, per L3-01).
- **mini-CAPTURE (promoted to first-class here).** When the re-entry slice is small (one feature, bounded Q&A), CAPTURE runs in a **mini** form: a single bounded Q&A round on the new scope, journal-appended, then the delta routes as above. This is the same revolving-door mechanic at small scale — not a separate path. (§9.3 shows a worked post-SHIP example.)
- **STRUCTURE-delta (named pattern, referenced from §3.2).** When re-entry routing lands on "new module" or "extend existing," STRUCTURE re-runs as a **module-delta only** — it adds/extends the affected `03-modules.md` + `05-dependency-map.md` entries, NOT a full re-draft of all 8 structure files. Named here as the canonical pattern; §3.2 consumes it; §9.3 shows it in flow.
- **One-timer = the degenerate case, default OFF (#E6/M4).** The revolving-door machinery is **available but invisible** — it imposes **zero overhead** on a builder who just wants to *dump once → build it all → done*. There is **no toggle and no "one-time vs gradual?" question** (asking it would manufacture the very doubt #E6 deletes — onboarding stays simply *"tell me your ideas"*). Default-OFF is realized structurally, not by a flag: the one-timer is the **degenerate path** through the same door — they dump everything → the declared slice = *"build all of it"* → deferred items = none → the gap-check is trivially clean → they build → done. The revolving-door features only **engage when there is real gradual behavior**: the delta-compute, roadmap-ledger stagnation pressure, and deferred-item ceremony all key off *something actually deferred* or *an actual re-entry*. No deferral, no re-entry → none of that machinery ever surfaces. So one-timer and gradual are **the same door, different usage** — not two modes the user must choose between.

**Inputs:** Human's head. Prior notes. Voice memos. Competitor screenshots. **Pre-structured PRD/spec** (Notion doc, markdown, Google doc, written brief).

**Entry Protocol (v1.4 — addresses #F-004 + L1-04..08):**

CAPTURE is human-led. AI's role is extraction without domination. On CAPTURE entry, AI performs a **2-stage branching protocol**:

#### Stage 1 — Input Detection (W-G19)

AI inspects the input the user provided OR points to (`storm/capture/01-braindump.md`, attached PRD, pasted spec, prior `briefing.md`, etc.):

- **Raw input detected** (chaotic head-dump, voice-memo transcript, scattered bullet list, "let me just talk") → **Raw Branch (2-mode A/B)**, behavior below.
- **Pre-structured input detected** (PRD with sections, written spec, design doc, PM-shaped brief) → **PRD Branch (4-mode)**, behavior below.

Detection signal: presence of structural headings, deliberate sectioning ("Problem / Solution / Users / Scope"), goal-oriented phrasing, or user explicitly says *"gw udah punya PRD / spec / doc"*.

When ambiguous → AI surfaces detection result and asks: *"I see [signals]. Treat as raw braindump or pre-structured PRD?"*

#### Stage 2A — Raw Branch (2-mode A/B)

Same as v1.3 behavior. AI offers:

- **Mode A — Passive Listen:** AI captures silently with ≤1 line acknowledgment per turn. No probes, no commentary, no scope-lock narration. User dumps freely. When user declares done (*"udah / selesai / done / lanjut"* or equivalent), AI produces a summary, then interviews from the summary to surface aspects user may not have considered.
- **Mode B — Interview:** conversational Q&A from the start. One open probe per turn. Short, conversational.

**Single governing rule — Dump-done gate = user.** AI does NOT transition from dump/capture to summary, probe, or phase-exit without an explicit user signal.

#### Stage 2B — PRD Branch (4-mode, L1-06)

AI announces detection + **critical-reviewer hat** (per CP-2 lexicon, L1-05) + offers 4 modes:

| Mode | Intent | AI behavior | Exit |
|---|---|---|---|
| **(a) FULL REVIEW** | Audit + challenge + gap-fill | Critical-reviewer: audit completeness, challenge premise, surface gaps. Single bounded round. | Gaps locked in `04-prd-review.md` |
| **(b) GAP-ONLY** | Identify missing pieces, no challenge | List 3–5 most-critical gaps prioritized. No premise challenge. | Gaps acknowledged in `04-prd-review.md` |
| **(c) DISCUSS** | Open dialogue, 2nd opinion, sparring partner | Conversational mode, no fixed agenda. User drives. | Human says *"cukup, lanjut"* → conversation log in `04-prd-review.md` |
| **(d) SKIP** | Accept PRD as-is | None. PRD is the source of truth. | Direct to Domain Lens + STRUCTURE; no `04-prd-review.md` produced |

**Bounded scope rules (L1-08, anti-fatigue per CP-1):**

- **Max 3–5 gaps surfaced per round** — prioritized by impact, not exhaustive.
- **Single round default** — not iterative deep-dive. Modes a/b complete in one pass.
- **Exit signal — user says *"cukup, lanjut / good enough, proceed"*** → AI immediately closes the review and moves to Domain Lens.
- **Anti-stuck (CP-11)** — if >2 rounds happen without lock, AI MUST announce and force a proposal:
  > *"Anti-stuck triggered: PRD review at round 3 without lock. Options: (a) freeze + proceed to STRUCTURE with known gaps as risks, (b) park PRD + restart CAPTURE raw. Pick."*

The PRD itself stays in `storm/capture/01-braindump.md` (or its original path if user wants to preserve location — AI copies into braindump.md as the canonical CAPTURE-side reference). Supplementary chaotic ideas surfaced during review go into `02-ai-questions.md`.

#### Common to both branches

**Activities:**
1. **Stage 1 detection** → announce branch picked, announce **Role Flip pending** (CAPTURE human-led → STRUCTURE AI-led). **On entry, regenerate the projection** (`_index.md`) from the journal if a journal already exists (resume case; no-op on a fresh empty journal).
2. **Stage 2 mode pick** — A/B for Raw, a/b/c/d for PRD.
3. **Execute mode** per behavior above. Auto-park out-of-scope tangents (CP-8).
4. **On user signal "dump done" (Raw) OR "cukup, lanjut" (PRD)** — dispatch synthesis sub-agent (sonnet) to produce `03-ideation-coverage.md` from braindump + Q&A (+ `04-prd-review.md` if PRD branch). **Regenerate the projection** (`_index.md`) from the now-complete journal (CAPTURE exit — parts 1–3 + part-4 mechanical gap-check: journal chunks with no projection anchor). Surface the part-4 unmapped-ideas list at the slice gate so the human consciously **maps-or-defers** each — this feeds tooth (a) (#E6/M3). Exit-only + deterministic = informs the gate without crying wolf.
5. **Domain Lens drafting (W-G22)** — AI dispatches sub-agent (opus tier — cross-phase inference) to draft `storm/structure/00-domain-lens.md` as a **canonical cross-phase artifact** (lives in `structure/` because it frames every downstream phase, but is drafted at the CAPTURE→STRUCTURE seam). Surface to user: *"Domain Lens inferred: [X]. Evidence: [Y]. Implications for hat-switching: [Z]. Correct, or different framing?"*
6. **On Domain Lens confirm** — main session fires CAPTURE exit marker.

**Outputs (fragmented per CP-5; branched per entry):**

| Artifact | Raw branch | PRD branch |
|---|---|---|
| `storm/capture/01-braindump.md` (journal — append-only) | ✅ raw dump | ✅ pasted/copied PRD |
| `storm/capture/_index.md` (projection — regenerated at entry + exit) | ✅ | ✅ |
| `storm/capture/02-ai-questions.md` | ✅ interview log | conditional — supplementary Q&A if modes a/b/c surfaced anything |
| `storm/capture/03-ideation-coverage.md` | ✅ validated coverage | ✅ validated coverage (synthesized from PRD + review) |
| `storm/capture/04-prd-review.md` | — not produced | ✅ for modes a/b/c; ❌ for mode d (SKIP) |
| `storm/structure/00-domain-lens.md` | ✅ drafted at CAPTURE exit | ✅ drafted at CAPTURE exit |

**Exit criteria (W-G21, branched by entry mode).** All exits are a **re-openable lock** (#E6/M2): the human declares a **bounded slice** (NOT *"all ideas captured"*) and **MUST name the deferred items** (tooth (a)); **AI never auto-exits**. The per-mode rows below are the artifact-confirmation gates that accompany that human slice-declaration. Re-entry to add more is first-class (see Revolving-door lifecycle above) — exiting is cheap *because* re-entry is free.

| Branch + Mode | Exit |
|---|---|
| Raw A / Raw B | Human declares a bounded slice done (+ names deferred items) + `03-ideation-coverage.md` confirmed + `00-domain-lens.md` confirmed |
| PRD (a) FULL REVIEW | `04-prd-review.md` exists w/ gaps locked + `03-ideation-coverage.md` confirmed + `00-domain-lens.md` confirmed |
| PRD (b) GAP-ONLY | `04-prd-review.md` exists w/ gaps acknowledged + `03-ideation-coverage.md` confirmed + `00-domain-lens.md` confirmed |
| PRD (c) DISCUSS | `04-prd-review.md` exists w/ conversation log + user said *"cukup, lanjut"* + `03-ideation-coverage.md` confirmed + `00-domain-lens.md` confirmed |
| PRD (d) SKIP | `01-braindump.md` (PRD pasted) + `03-ideation-coverage.md` confirmed + `00-domain-lens.md` confirmed (no `04-prd-review.md`) |

**Micro-dialog examples:**

*Raw branch — Mode A:*
```
AI: "CAPTURE dimulai. Input detected: raw braindump. Mode? (A) Gw diem, lo dump bebas, bilang 'udah' pas selesai — gw summarize & interview dari situ. (B) Langsung interview Q&A."
User: "A"
AI: "Oke, go."
User: [dumps 5 turns...]
User: "udah"
AI: [produces summary → begins probe sub-phase]
```

*PRD branch — Mode a (FULL REVIEW):*
```
AI: "CAPTURE dimulai. Input detected: pre-structured PRD (sections: Problem, Users, Scope, Success Metrics). Switching to critical-reviewer hat. Mode? (a) FULL REVIEW — audit + challenge + gap-fill, (b) GAP-ONLY — just list missing pieces, (c) DISCUSS — open sparring, (d) SKIP — accept PRD as-is, go straight to STRUCTURE."
User: "a"
AI: "Critical-reviewer hat. Bounded: max 3-5 gaps, single round. Reading PRD..."
[AI dispatches sonnet sub-agent for review]
AI: "Top 4 gaps surfaced: [list]. Address each, defer with risk, or 'cukup, lanjut'?"
User: "1 dan 3 fix, 2 dan 4 defer, lanjut"
AI: [logs to 04-prd-review.md → proceeds to Domain Lens]
```

**Anti-stuck:**

*Raw branch:*
- If human can't articulate → AI switches to "show me" mode: describes 3 possible product versions, asks which resonates.
- If completely blank → AI asks: *"Tell me about a problem you face every day at work."*
- If circling → AI summarizes what's captured, asks *"Is there something new beyond this?"*

*PRD branch:*
- If user picks (a) or (b) but won't lock gaps after round 2 → fire anti-stuck announcement (see L1-08 above) — force the (freeze + risks) vs (park + restart raw) proposal.
- If user picks (c) DISCUSS but never says *"cukup, lanjut"* and conversation passes turn-budget 6 → AI surfaces budget overrun, proposes: *"DISCUSS pass turn 6 — proceed to Domain Lens with what's captured, or extend one more round?"*

### 3.2 STRUCTURE

**Inputs:** `storm/capture/03-ideation-coverage.md` (completeness authority), `storm/capture/01-braindump.md` (content source of truth), `storm/capture/02-ai-questions.md` (probe context)

**STRUCTURE-delta (re-entry path, #E6/M2).** On a CAPTURE re-entry (revolving door, §3.1) whose CP-1-gated routing landed on **new module** or **extend existing**, STRUCTURE re-runs as a **module-delta only** — add/extend just the affected `03-modules.md` + `05-dependency-map.md` entries (and `06-build-order.md` if sequencing shifts), NOT a full re-draft of all 8 files. The Role Flip + Domain-Lens re-confirm (steps 1–2 below) still run for the slice. §9.3 shows this in flow.

**Activities:**
1. **Role Flip ceremony** — AI announces: *"Switching to STRUCTURE-lead. Your continued authority: review, challenge, approve, trigger loop-back."*
2. AI verifies `storm/structure/00-domain-lens.md` exists from CAPTURE exit (per L3-01). If missing → loop-back to CAPTURE. If present → surface to user for re-confirmation: *"Domain Lens carried from CAPTURE: [X]. Confirm or revise before drafting downstream?"*
3. AI proposes (ALL flagged as "proposed" until approved), in this exact order — note **`00-domain-lens.md` listed first** because every other file's `storm-depends-on` cites it:
   - `storm/structure/00-domain-lens.md` — **already drafted in CAPTURE** (W-G22); verified at step 2 above. **Also carries the project's "AI-persona" (C3 fold of retired #E3 + #E1 seed, 2026-06-14):** (a) **hat-emphasis** — the project pre-declares the specialist hats most relevant to its domain (e.g. `clinical-safety`, `actuarial`) as lines in the lens, so CP-2 hat-switching is *anchored to the domain* rather than left to AI recall; (b) **discoverability-view** — a thin index of which specialist hats are available for this project. No new file/mechanism — both are sections inside the existing lens. Deliberately **excludes** tone (per-user, lives in Claude Code memory per C2 / #FF-028), which is a different axis from per-project persona.
   - `storm/structure/01-vision.md` — 1-paragraph product vision
   - `storm/structure/02-user-roles.md` — roles explicit vs AI-inferred
   - `storm/structure/03-modules.md` — module list
   - `storm/structure/04-scope.md` — what's in / out
   - `storm/structure/05-dependency-map.md` — module dependencies (**Mermaid `graph` is canonical** for the module DAG per the Diagram-as-Canonical convention below)
   - `storm/structure/06-build-order.md` — sequence per 4 criteria (dependencies, risk, value visibility, foundation soundness)
   - `storm/structure/07-deployment-target.md` — architectural decision (CP-6 #5); **Mermaid topology diagram is canonical** for the deploy topology per the Diagram-as-Canonical convention below (`flowchart`; use `architecture-beta` only if CP-6-verified stable at draft time)
   - `storm/structure/08-design-system.md` — aesthetic direction (tone, color, typography feel, references, patterns to avoid)
   - `storm/structure/09-hero-mockup.html` — **v1.4.3 (#F-010):** single representative screen rendering the design-system as a visual anchor (inspirational manifestation, NOT baseline). Drafted via `/frontend-design` (D4 baseline) reading `00-domain-lens.md` + `08-design-system.md`. Hero gives ADHD-prone profile an early concrete visual to anchor on; per-module SPECIFY variants remain independent — no diff-vs-hero enforcement.
4. AI verifies any tech choices in `storm/structure/07-deployment-target.md` via Context7/GitHub (CP-6)
5. Human reviews each; AI marks explicit-from-human vs AI-synthesized; rejections → AI asks what specifically isn't working before re-proposing

**Diagram-as-Canonical convention (#E4 Item 4a — Mermaid, CP-6 verified per Context7 `/mermaid-js/mermaid` + WebSearch 2026):**

For **structural facts** (module relations, FK, cardinality, deploy topology, state lifecycle), a **Mermaid diagram is the canonical source of truth** and the prose around it shrinks to *annotation* — the "why", edge-cases, and conditional logic the notation cannot express (e.g. *"this FK applies only when status=active"*). For **non-structural facts** (rationale, decisions), prose stays primary. Mermaid is chosen because it renders **natively on GitHub** (zero setup — the owner's read surface) and is the highest-fidelity diagram grammar for both human and AI; its formal cardinality notation (`A ||--o{ B`) is *less* drift-prone than prose for structure, not more (prose lets cardinality stay vague). **Embed diagrams in the existing files — never create new diagram files** (anti-proliferation).

- **Inti-3 (mandatory, diagram is canonical):** `05-dependency-map.md` → `graph` module DAG · `01-data-model.md` (SPECIFY) → `erDiagram` ERD · `07-deployment-target.md` → topology.
- **Tier-2 (opt-in — fire ONLY when the objective trigger is met, AI decides per CP-7, no user ask):** `03-rules.md` → `stateDiagram-v2` **only if the entity has a status lifecycle**; `02-flows.md` → `sequenceDiagram` **only for a critical flow**. `02-user-roles.md` = optional, low priority.
- **Explicitly NOT diagrammed (anti-bloat):** `06-build-order` (ordinal lives in the `05` graph), `03-modules` (relations live in `05`), `04-scope`, `00-domain-lens`, `01-vision`, `08-design-system`, `_index`, `05-edge-cases`, `06-tech-choices`.
- **Drift-control (no new pipeline):** because the diagram is canonical there is no prose-copy to diff against — the discredited "diagram == prose" check is dropped. Instead: (a) **at SPECIFY**, the existing cross-file consistency audit (#FF-007) is extended to verify **every entity referenced in `02-flows`/`03-rules` appears in the `01-data-model` ERD** (well-formed + internally consistent — catches silent omission, the diagram's one real failure mode); (b) **at REVIEW**, diagram-vs-built-code drift is already covered by the #FF-021 resource-existence check (the diagram is its input, not a new gate).

**Module slug convention (MANDATORY — per #F-008, learned from dealflow inconsistency):**

A module's **slug** = the identifier used for its folder name (`storm/specify/<NN>-<slug>/`), commit subject (`storm:BUILD:<slug>:...`), and cross-module FK references (`<slug>.table.column`). Convention:

- **Slug = human-readable kebab-case derived from the module's name.** Examples: `lead-management`, `identity-access`, `quotation`, `audit-trail`, `pipeline-opportunities`. NEVER use opaque prefixes like `m1`, `m2`, `cc-1`, `cc-2`.
- **Module map (`storm/structure/03-modules.md`) uses a single consistent identifier column** — either an ordinal `#` (1, 2, 3, ..., N) for all rows OR no ordinal column at all. **NEVER mix plain-numeric with prefixed identifiers (`1, 2, ..., 11, CC-1, CC-2`) in the same column.** Cross-cutting vs Core distinction lives in a separate `Tier` column.
- **Cross-cutting modules are still part of the same ordinal sequence** in the table — they don't get a parallel numbering scheme. Their cross-cutting nature is expressed by `Tier: Cross-cutting` and surfaces in `build-order.md` (which typically schedules them first because feature modules depend on them).
- **Required `modules.md` table shape:**
  ```
  | # | Slug | Module | Purpose (1 line) | Primary Roles | Tier |
  |---|------|--------|------------------|---------------|------|
  | 1 | identity-access | Identity & Access | M365 OAuth + roles | all | Cross-cutting |
  | 2 | audit-trail | Audit Trail | Event taxonomy + immutable log | system | Cross-cutting |
  | 3 | lead-management | Lead Management | Top-of-funnel qualification | ISS, PM | Core |
  | ... | ... | ... | ... | ... | ... |
  ```

**Why this matters:** opaque slugs (`m2/`, `cc-1/`) drift away from the module's actual identity over time, force constant slug↔name lookup, and (as observed in dealflow) lead AI orchestrators to misroute prompts when two modules have similar numeric IDs (#FF-006 m8/m9 swap). Human-readable slugs are self-documenting at every reference site: folder name, commit subject, FK ref, sub-agent dispatch prompt.

**Trade-off accepted:** human-readable slugs are 5-20 characters longer than `mN`. Per CP-5 token-awareness, this is acceptable because (a) AI reads slug strings infrequently relative to file content, (b) cognitive cost of slug↔name mental lookup is higher than the marginal token cost, (c) recovery (CP-12) benefits from slugs that read as English in git log.

**Renames during STRUCTURE:** allowed and cheap — folder doesn't exist yet, no FK refs to update. Once SPECIFY starts for a module, treat slug as stable; renaming after triggers the full sync cascade (rename folder + update `storm/structure/06-build-order.md` + `storm/structure/05-dependency-map.md` + every cross-module FK in all already-drafted concern files).

**Outputs:** 9 `.md` files (00-domain-lens + 01-vision through 08-design-system) + `09-hero-mockup.html` in `storm/structure/`

**Exit criteria:**
- All 9 `.md` files in `storm/structure/` exist and human-approved (00-domain-lens + 01-vision through 08-design-system)
- `00-domain-lens.md` re-confirmed at STRUCTURE entry (per L3-01)
- No TBD items in `storm/structure/03-modules.md`, `storm/structure/04-scope.md`, `storm/structure/07-deployment-target.md`
- `storm/structure/08-design-system.md` has at least 3 reference apps noted
- `storm/structure/09-hero-mockup.html` exists and human-approved (v1.4.3 #F-010 — inspirational visual anchor, no diff-gate)

**Anti-stuck:**
- If human can't pick module priorities → AI proposes build order with 4-criteria reasoning, human approves or modifies
- If scope feels too big → AI proposes MVP slice; others go to parking lot for v2
- If iteration stalls → AI offers loop-back to CAPTURE for missing info

### 3.3 SPECIFY (per module, JIT per CP-9)

**Inputs:** `storm/structure/*.md` files; `storm/specify/<previously-built-modules>/_index.md` (for learnings)

**Activities (per module):**
1. AI announces: *"Specifying module [X] now."*
1a. **Domain Lens re-validation gate (v1.4 W-G24 — cheap-loop lever per INV-01):** orchestrator Re-reads `storm/structure/00-domain-lens.md` BEFORE drafting any `_briefing.md`. Surfaces to user: *"Domain Lens for module [X]: [framing]. Confirm or revise?"* If user revises → cascade to `00-domain-lens.md` first (per §4.3.1), THEN proceed. Without this gate, each SPECIFY module re-infers framing → opus token burn + drift risk.
2. AI drafts files in `storm/specify/<NN>-<module-slug>/`:
   - `_index.md` — links + summary + **§0 Inheritance block** when the module inherits a shared mechanism (per the Shared-Thread Inheritance convention below)
   - `_briefing.md` — orchestrator-synthesized canonical facts (per §8.7.3)
   - `_decisions.md` — **v1.4 (L2-05):** sub-agent autonomous decisions log (tech picks, schema choices, lib internals) + BLOCKED returns kicked back to orchestrator. Maintained APPEND-ONLY across the module's SPECIFY lifecycle.
   - `01-data-model.md` — schema, relationships (AI-decided per CP-7); **Mermaid `erDiagram` is canonical** for entities/FK/cardinality per the Diagram-as-Canonical convention (§3.2); prose = annotation only
   - `02-flows.md` — user flows (business decisions, AI proposes options per CP-1)
   - `03-rules.md` — business rules (human decides per CP-7)
   - `04-ui.md` — **UX interpretation in L3-03 4-bullet format** (see §7.2)
   - `04-ui/mockup-v1.html` / `mockup-v2.html` / `mockup-v3.html` — **v1.4 (L3-05):** Conservative / Bold / Wildcard variants
   - `04-ui/_picked.md` — **v1.4 (L3-05):** human's chosen variant + rationale; **LOCKS visual baseline** for BUILD diff-vs-baseline (W-G30) + REVIEW Layer 5 visual regression
   - `05-edge-cases.md` — enumerated + handled
   - `06-tech-choices.md` — libraries/frameworks per CP-6, with live-verified evidence
   - `07-acceptance.md` — **authored Acceptance-Criteria oracle (#E4 Item 4b):** User Story + observable, REVIEW-verifiable acceptance-criteria per role×flow, co-located as one testable contract (distinct from `02-flows.md`: flows = the path, acceptance = the pass-condition). Terse, AI-drafted; human comprehension-approves (does not author). Drafted last as the capstone contract synthesizing the concerns above. Consumed by REVIEW Layer 1 as the authored oracle. NO-OP for infra-only modules with no user-facing role×flow.
2.5. **Parallel mockup dispatch (v1.4 W-G26 — canonical §1.1.2 example):** after `04-ui.md` interpretation locks, orchestrator dispatches **3 sonnet sub-agents in a single tool-call batch** (parallel, no data dependency between them): one per variant (Conservative / Bold / Wildcard). Each sub-agent reads `04-ui.md` + `08-design-system.md` + `00-domain-lens.md`, then emits its mockup-v[N].html via `/frontend-design` (preferred, **D4 baseline**) OR direct render. Orchestrator surfaces all 3 to user: *"Three variants ready. Pick which resonates."* Human pick → orchestrator writes `_picked.md` + locks baseline.
3. AI hat-switches per concern (data architect / business analyst / UX designer / security)
4. Human reviews per fragment; corrections propagate via Sync Contract
5. **Tech-choices extension (per #FF-004):**
   - **Latest-stable, no version floors at SPECIFY time** — pick latest stable release (latest active LTS for runtimes). Conservative "version-floor" caveats are SHIP-phase concerns. Verify currency via Context7/WebFetch; do not default-down.
   - **Head-to-head for non-trivial picks** — for any auth/session/infra/framework concern (where a higher-level option might exist), compare ≥2 candidates side-by-side in `06-tech-choices.md`: bench score, snippet count, source reputation, bespoke-LOC delta.
   - **Profile-fit weighting** — prefer the higher-level option that reduces bespoke code unless a documented architectural constraint prevents it. User profile = zero-coding, chaotic-mind, demotivated-when-stuck. Never pick a lower-level primitive over a higher-level framework without a documented head-to-head.
6. **Cross-file consistency audit (per #FF-007 — MANDATORY before APPROVED marker):**
   - After all 7 concerns drafted and individually approved, BEFORE the module APPROVED marker, spawn a fresh **opus** auditor sub-agent.
   - Auditor cross-reads all 7 concern files + relevant `storm/structure/*.md`. Checks every divergence: FK references (table.column names match across data-model + rules + flows), enum values + types (native ENUM vs text+CHECK consistent), function signatures (arity + arg names), column-names (post-cascade renames propagated to ALL files), library/version pins, shared-resource contracts (audit-outbox pattern, Redis keyspace, BullMQ queue names, UI primitive numbers).
   - **Diagram entity-coverage (#E4 Item 4a):** where a Mermaid diagram is canonical (e.g. the `01-data-model` `erDiagram`), verify **every entity referenced in `02-flows`/`03-rules` appears in the diagram** and the diagram is well-formed — catches the diagram's one real failure mode (silent omission). This replaces any "diagram == prose" check (dropped — the canonical diagram has no prose-copy to diff against).
   - **Acceptance coverage-gate (#E4 Item 4b, HARD):** every role×flow declared in `02-flows.md` (cross-checked vs `storm/structure/02-user-roles.md`) MUST have a matching user-story + ≥1 observable, REVIEW-verifiable acceptance-criterion in `07-acceptance.md`. Any uncovered role×flow = FIX-REQUIRED. A module with no user-facing role×flow (pure-infra/foundation) has no AC requirement — the gate is a **no-op, not a violation** (mirrors the Shared-Thread Inheritance no-op semantics, §3.3 below).
   - Output: `storm/specify/<NN>-<module-slug>/_audit.md` with PASS or FIX-REQUIRED verdict + numbered findings.
   - ANY divergence = FIX-REQUIRED. Orchestrator loops on fixes until PASS, then fires APPROVED marker.

**Outputs:** All concern files above (incl. `07-acceptance.md`) + `_briefing.md` + `_decisions.md` + `_audit.md` + `04-ui/mockup-v[1-3].html` + `04-ui/_picked.md` in `storm/specify/<NN>-<module-slug>/`

**Exit criteria (v1.4 W-G29):**
- All concern files exist for current module
- No TBD on `03-rules.md` or `02-flows.md`
- Tech choices verified (CP-6 evidence in `06-tech-choices.md`); head-to-head documented for non-trivial picks
- **Cross-file consistency audit PASS recorded in `_audit.md`**
- **Acceptance oracle complete (hard gate, #E4 Item 4b):** `07-acceptance.md` exists; every role×flow has a user-story + ≥1 observable AC; coverage recorded in `_audit.md`. No-op for infra-only modules (no role×flow). AC coverage-% reported as a CP-10 small-win signal, NOT a second gate.
- **Visual baseline locked:** `04-ui/_picked.md` exists with human's pick + rationale; all 3 mockup variants drafted
- `_decisions.md` accumulates all sub-agent autonomous decisions taken during the module
- Human confirms: *"this is what I want from user's perspective"*

**Anti-stuck:**
- If business rule unclear → AI proposes 2-3 options with pros/cons
- If spec too complex → AI splits module into sub-modules
- If human mind-changing repeatedly → AI flags pattern, suggests parking conflicting ideas and picking one

**Operational discipline:**

- **Orchestrator upstream-read gate (per #FF-016, MANDATORY before any sub-agent dispatch):** BEFORE drafting any concern-file dispatch prompt, the orchestrator MUST personally read — directly, NOT delegated — the canonical upstream sources: (a) `storm/capture/01-braindump.md` — full text when small; when it is large (Tier-1 over cap, e.g. moscow's 3600-line braindump) read via its `_index` section-map and pull the sections relevant to the target module, NOT a blind full-read (per #FF-027 — a 3600-line full-read per dispatch is the dumb-zone tax CP-14 forbids; the CAPTURE doc stays uncapped, its *consumption* becomes targeted), (b) `storm/structure/03-modules.md` target module section verbatim, (c) `storm/structure/02-user-roles.md` (if role-sensitive permissions apply), (d) `storm/structure/04-scope.md`, (e) `storm/structure/08-design-system.md` (for `04-ui.md`), (f) all dependency module `storm/specify/<dep>/_index.md` + `01-data-model.md` for FK targets.
- **`_briefing.md` per module:** orchestrator synthesizes canonical facts with citations into `storm/specify/<NN>-<module-slug>/_briefing.md` and commits it BEFORE dispatching any concern sub-agent. Sub-agents receive briefing verbatim inline — never paraphrased. If briefing synthesis surfaces contradictions between upstream sources, orchestrator surfaces them to the user for resolution BEFORE dispatching any concern.
- **Per-concern tier discrimination (per #FF-003 + v1.4 W-G27):** dispatch each concern to the model tier that fits its reasoning load. Default split (field-validated on dealflow Phase 1 — zero opus-overload recurrence):

  | Concern | Tier |
  |---|---|
  | `_index.md`, `02-flows.md`, `03-rules.md`, `04-ui.md`, `05-edge-cases.md`, `07-acceptance.md` | sonnet |
  | `01-data-model.md`, `06-tech-choices.md` | opus |
  | `04-ui/mockup-v1.html`, `mockup-v2.html`, `mockup-v3.html` | sonnet × 3 parallel (per §1.1.2 / W-G26) |
  | `_briefing.md` | no tier (orchestrator-authored, not dispatched) |
  | `_decisions.md` | no tier (sub-agents append; orchestrator collates) |
  | `_audit.md` | opus (cross-file consistency, fresh auditor sub-agent — per #FF-007) |

- **Scope-verification gate (per #FF-006):** before drafting the dispatch prompt, orchestrator re-reads `storm/structure/03-modules.md` + `storm/structure/06-build-order.md` verbatim to confirm the module name + scope match the target. Prevents wrong-scoped dispatches (e.g., m8/m9 name swap).
- **Sub-agent timeout fallback (per #FF-008):** if a forked-opus sub-agent times out ≥2× for the same concern, orchestrator falls back to direct-draft on the same tier (preserving tier discipline via `Model: opus` trailer). Commit body notes the deviation. Pattern: tier preserved, fragmentation discipline relaxed.

- **Shared-Thread Inheritance convention (#E4 axis-1, field-proven on moscow):** when several modules share a cross-cutting mechanism (a permission gate, an event-emit helper + taxonomy contract, an audit-field tuple shape, a UTC/timestamp rule), that mechanism is **owned in ONE canonical home** — either a foundational SPECIFY module that owns the mechanism's schema, or a STRUCTURE-level shared-conventions artifact — and **cited, not restated**, everywhere else. Two layers of ownership:
  - **Mechanism (owned once):** the canonical home documents the helper/idiom/contract + its invariant exactly once, tagging each with a **stable rule-ID (additive R-numbering, e.g. `R-129`)** so downstream modules can cite it precisely.
  - **Domain-specifics (sole-owned per module):** inherently-local values — this module's role×endpoint permission tuples, this module's event names — are legitimately written by the owning module. Sole-ownership is **not** duplication; do NOT force-centralize these.

  An inheriting module opens its `_index.md` with a **§0 Inheritance block**: *"INHERITED from `<home> §<rule-ID>` — `<mechanism>` not restated here; this module owns only `<its domain-specifics>`."* It then writes only its own domain-specifics and never re-declares an inherited mechanism. This keeps SPECIFY docs lean at the source (the cross-cutting thread is decided once) and makes a later audit-finding on the shared mechanism a single-home edit instead of an N-file fan-out. Folds into **CP-5** (fragmentation — distinct concern per home) + **CP-9** (JIT — the home is specified when first needed, inheritors cite forward).

  **Explicitly NOT enforced.** No lint, no gate, no `_audit.md` coverage check for this convention — two independent adversarial probes on moscow measured **0% re-statement** under the lightweight cite-don't-restate habit (evidence: `storm/meta/e4b-reverify-evidence.md`), so enforcement machinery would solve a problem that does not exist (YAGNI). The §0 block is a **convention the orchestrator follows**, not a checked artifact. Fires **only when a shared mechanism actually exists** — a module that inherits nothing simply has no §0 block (the convention is a no-op, not a violation).

### 3.4 BUILD (per task, within module)

**Inputs:** `storm/specify/<NN>-<module-slug>/*`, prior module build artifacts

**Activities (per task):**
0. **Dark-stretch expectation-setting (#E4 axis-3, at the STRUCTURE→BUILD handoff + first infra-module start):** before the first foundation module begins, AI announces the shape of the valley — *"The next ~N modules are infrastructure (DB, auth, schema); no demo-able screen until module [X] — normal, not stuck. I'll narrate each foundation piece as it lands."* Then narrate structural progress per-fragment during the dark stretch (escalate one notch even at Low stall-risk). Sets expectations up front so foundation-first never reads as "no progress". Convention only (CP-10 + CP-4) — no build-order change. See `storm-protocol.md` → CP-10 *Dark-stretch expectation-setting*.
1. AI plans task sequence for module → produces `storm/build/<NN>-<module-slug>/_plan.md`
2. Per task:
   - AI creates `storm/build/<NN>-<module-slug>/<NNN>-task-name/context.md` (what, why, references to specs)
   - AI writes code
   - AI self-tests: unit + integration → `test-results.md`
   - **Runtime smoke — actually run it, not just the tests (per #E4 axis-2, mandatory):** beyond unit/integration tests, AI exercises the surface this task built **once at runtime** — load the page, hit the route, run the migration — and confirms zero runtime crash. **Green tests ≠ verified:** a passing unit test does not exercise the real render/SQL/wiring path, which is exactly the class of within-module crash (e.g. an SSR render hitting a wrong function arity) that otherwise slips through BUILD and only surfaces at REVIEW. This is the per-task floor for *every* task; the UI diff-vs-baseline below is the *additional* visual check for UI-heavy tasks. (Not a new layer or output file — it is what "verify the task works" already means, made explicit. Scoped to within-module runtime; genuine cross-module/deploy seams remain SHIP staging-smoke's job.)
   - **UI-heavy task — diff-vs-baseline (v1.4 W-G30, mandatory):** after render, AI screenshots the rendered output and diffs it against the picked mockup at `storm/specify/<NN>-<module-slug>/04-ui/<picked-variant>.html` (variant identified by `_picked.md`). If divergence is material (color drift, layout pattern mismatch, missing component, density/spacing off vs design-system citation) → AI **self-flags BEFORE next task** with format: *"BUILD task <NNN> diverges from baseline: [specific diffs]. (a) accept divergence + update _picked.md rationale, (b) fix and re-diff, (c) escalate to SPECIFY loop-back."* Replaces the v1.3 freeform *"Matches your vision?"* checkpoint — too vague when human cannot articulate (CP-3 friction trigger). Diff-vs-baseline gives objective comparison surface.
   - AI commits with STORM commit convention (see Section 6)
   - Progress report: *"Task N of M complete in module [X]"* (CP-10 small wins)

**Outputs:** `storm/build/<NN>-<module-slug>/<NNN>-task-name/*` per task; `src/` code changes

**Exit criteria (per module, not per task):**
- All planned tasks complete
- End-to-end flow works (runnable, not half-done) — **"runnable" means it was actually run**: every built surface loaded/exercised once at runtime with zero crash (per the per-task runtime-smoke above), not merely "tests are green"
- AI self-tests passing
- Module marked ready for REVIEW

**Anti-stuck:**
- Task stuck > 2 sessions → AI surfaces blocker, considers spec loop-back
- Tests failing repeatedly → AI proposes approach change or spec adjustment
- User lost in technical details → AI reminds: *"You don't need to review the code. Let's look at the result."*

**Operational discipline:**

- **Orchestrator turn-budget (per #FF-013):** the orchestrator caps each conversational turn at **≤6 tool calls**. Longer task chains are decomposed into per-task sub-agent dispatches that return DONE/BLOCKED. Prevents stream-idle-timeouts in the main BUILD context observed when a single turn accumulates large read+edit volumes.
- **Sub-agent exit-marker prohibition (per CP-5 dispatch discipline + #FF-009b):** dispatched task sub-agents MUST NOT commit module-exit, REVIEW-trigger, or BUILD-complete markers. Sub-agents return DONE/BLOCKED with their artifact; orchestrator (or human) fires the exit marker after cross-task validation.

### 3.5 REVIEW

**Inputs:** Completed module, `storm/specify/<NN>-<module-slug>/*`, runnable app; authored acceptance oracle `storm/specify/<NN>-<module-slug>/07-acceptance.md`

**Verification boundary callout (v1.4 W-G39):** REVIEW = **AI-led automated verification** (this section). SHIP smoke test = **human-led manual verification in deployed env** (§3.6). The two are reciprocal — neither side may punt verification to the other. See §6 Verification Boundary for the contract.

**Activities (v1.4 L3-02 / W-G31 — 8-layer comprehensive auto-verification):**

1. AI announces module-live state to human (CP-10 small-win signal): *"Module [X] is live — running 8-layer auto-verification now."*
2. **AI runs 8-layer suite (HARD GATE — Layer 7 + Layer 8 mandatory, others opt-out-able per `_index.md`):**

| # | Layer | Tool / Method | Output Path | Pass Criteria | Severity Grade (W-G32) |
|---|---|---|---|---|---|
| **1** | Functional smoke — **User-Reality Crawl** | **Dispatch independent blind-crawler sub-agent** (no build context — explores as a brand-new user). Two-tier scope: (a) **cheap whole-app reachability sweep** — open home, follow every nav link, diff reachable-set vs code's route list, flag any route that exists but is unreachable from the UI (catches nav gaps + prior-module regressions); (b) **deep exercise of the current module only** — load+render, happy-path action, edge/error path per surface. Driver: **Playwright** (MCP or spec files); fallback Chrome MCP / browser-use. Evidence written to disk → `storm/review/evidence/<slug>/L1-crawl/` (screenshots + `reachability.json` + `L1-findings.md`); sub-agent returns **manifest only**, never raw bytes/DOM into context. | `storm/review/evidence/<slug>/L1-crawl/` | Every declared module surface reachable from nav and exercises to expected end-state; reachability sweep clean; screenshot + manifest per flow. Each observable AC in `07-acceptance.md` (#E4 Item 4b) maps to a crawl assertion — Layer 1 verifies the running app against the **authored oracle**, not an on-the-fly judgement; any unmet AC = P0 fail. | P0 fail blocks PASS |
| **2** | Console errors | Browser console capture during Layer 1 exec | `storm/review/evidence/<slug>/L2-console.log` | Zero errors; warnings noted but not failing | P0 errors block PASS; P2 warnings parked |
| **3** | Network failures | Network panel capture during Layer 1 exec | `storm/review/evidence/<slug>/L3-network.log` | Zero 4xx/5xx on critical paths; reasonable response times | P0 5xx blocks PASS; P1 4xx surfaced |
| **4** | Accessibility | axe-core run against each flow's resting state | `storm/review/evidence/<slug>/L4-axe-<flow>.json` | Zero P0 a11y violations vs `08-design-system.md §Accessibility Baseline` | P0 blocks PASS; P1/P2 fix-in-REVIEW |
| **5** | Visual regression | Render diff vs picked mockup `04-ui/<picked>.html` (per W-G30 baseline lock) | `storm/review/evidence/<slug>/L5-visual-<screen>.png` + diff JSON | Material divergence flagged per W-G55 axis (color/spacing/typography/layout/components/motion/a11y) | P1 if material; P2 if minor |
| **6** | Performance smoke | Core Web Vitals (LCP, INP, CLS) via Lighthouse / browser perf API | `storm/review/evidence/<slug>/L6-perf.json` | LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on representative flow | P1 if breach; P2 if near-breach |
| **7** | Pre-checks + static guards (NEVER opt-out, W-G33) | tsc, lint, unit/integration tests, module-load smoke + **nav-coverage check** (#FF-022) + **resource-existence check** (#FF-021) | `storm/review/evidence/<slug>/L7-pre.log` | All green; every routable page has a nav entry or `nav-skip:` waiver; every spec-mandated resource exists in the data layer | P0 — any fail blocks PASS |
| **8** | Code review (NEVER opt-out, W-G33) | **Dispatch opus auditor sub-agent** (template C below) — **briefed to find craft-floor violations** (`~/.claude/docs/storm/craft-floor.md`, §1.4 sieve 4 — independent adversarial tier): OWASP Top 10:2025 + OWASP LLM Top 10 surface (if the product uses LLMs), secrets scan, dependency-integrity/lockfile, dead code, complexity, fragmentation discipline + parallel `/codex review` if user has gstack | `storm/review/evidence/<slug>/L8-code-review.md` + optional `L8-codex.md` | Zero P0 findings; P1 fix-in-REVIEW; P2 park; P3 framework-feedback | P0 blocks PASS |

   **L7 static guards — deterministic floor:** The two L7 static checks complement the dynamic crawl: they run even if the crawl budget is exhausted and require no browser. (1) **Nav-coverage (#FF-022):** every routable page must be reachable from the nav, or explicitly waived via a `nav-skip:` waiver in the module's `storm/specify/<NN>-<slug>/_index.md` (alongside the existing `review-layers-skip:` array) — any page missing both an href and a waiver is **P0**. (2) **Resource-existence (#FF-021):** read `storm/specify/<NN>-<slug>/06-tech-choices.md`, extract every named table / migration / library-required resource, and verify each exists in the data layer (schema + migrations) — any spec-mandated resource absent from code is **P0**. Both checks are stack-agnostic principles; Next.js paths (`src/app/**/page.tsx`, `src/db/schema/`) are examples — adapt to the project's router/data-layer convention.

   **Payload hygiene + sample-then-expand (#FF-020):** REVIEW browser work (L1 crawl + L5 visual regression) writes evidence (screenshots, logs, JSON) to disk → `storm/review/evidence/<slug>/` and returns **manifests only** to the orchestrator — never raw page-text, DOM trees, or byte blobs into context. A naive audit that pulls full page-text per surface × N surfaces blows the context window and triggers autocompact thrash → session abort (DealFlow: ~68 surfaces, 3 compact-loops, forced `/clear`). The **sample-then-expand** strategy is mandatory at scale:
     1. **Sample (5-7 high-signal surfaces first).** Audit a representative slice — the surfaces most likely to expose a systematic problem (most-trafficked, most-recently-changed, most-complex layout) — to validate the fix/diff pattern before committing the whole sweep.
     2. **Validate the pattern.** If the sample is clean, the systematic risk is low. If the sample reveals a divergence class (e.g. a shared component drifted), you now know the signature.
     3. **Bulk-sweep the remainder** only when warranted — via a headless screenshot-loop (boilerplate in `.claude/commands/storm-review.md` → *Layer 5 screenshot-loop*) running in a **forked sub-agent**, which walks the evidence dir and returns a manifest. The orchestrator context never holds N full payloads.
     The same discipline lives protocol-level in `storm-protocol.md` → *Browser audit payload hygiene* so it holds off the canonical happy path (ad-hoc reskin sweeps, design-pivot re-evaluations), not only inside this scripted Layer 5 step.

3. **Layer opt-out (W-G33):** module's `_index.md` may declare `review-layers-skip: [1,2,3,4,5,6]` for layers that don't apply (e.g., backend-only module without UI → skip L1/L5; CLI module → skip L4). **Layers 7 and 8 NEVER opt-out — they apply to every module regardless of surface.** Opt-out reason logged in `_index.md` next to the skip array.

4. **Severity taxonomy (W-G32):**

| Severity | Meaning | REVIEW disposition |
|---|---|---|
| **P0** | Blocks PASS | Must be fixed in REVIEW before exit |
| **P1** | High-priority | Fix in REVIEW or escalate to next module |
| **P2** | Annoyance | Auto-park to `storm/meta/parking-lot.md` (CP-8 mechanism, no ask) |
| **P3** | Suggestion / framework-friction | Park to `storm/meta/parking-lot.md` OR log to `storm/meta/framework-feedback.md` per scope |

5. **Surface results to user** as structured report (W-G35 schema):
   > *"Module [X] 8-layer auto-verification:*
   > *Layer 1 (functional): N/M pass. Evidence: storm/review/evidence/<slug>/L1-crawl/*
   > *Layer 2 (console): clean / N errors. ...*
   > *...*
   > *Layer 8 (code review): N findings (P0: a, P1: b, P2: c, P3: d).*
   >
   > *Overall: PASS / FIX-REQUIRED (N P0/P1) / LOOP-BACK (N foundation issues).*
   >
   > *AI-proposed fix per P0/P1: [diff summary or option pick]. Human ack/reject per finding."*

6. Human reviews report — does NOT manually exercise the app at this stage. If user wants additional flows tested → AI runs them via browser automation. Feedback in any form (text, screenshot annotation, voice).
7. AI categorizes each human-surfaced item (in addition to auto-graded findings):
   - Implementation bug → stays in REVIEW, fix + re-verify
   - Spec wrong → loop-back to SPECIFY
   - Foundation wrong → loop-back to STRUCTURE
   - New scope → parking lot (indirect loop-back to CAPTURE later)
8. AI hat-switches per feedback type (UX dissat = UX hat, flow dissat = business analyst, security = security expert, etc.)
9. AI responds per CP-1: proposes options for non-trivial fixes, executes after human picks. P0/P1 fixes dispatched to sonnet sub-agents (Template B); each re-runs affected layers after fix.

**Output Schema (W-G35) — `storm/review/<NN>-review-<module-slug>.md`:**

```markdown
---
storm-phase: review
storm-module: <slug>
storm-depends-on:
  - storm/specify/<NN>-<slug>/_index.md
  - storm/build/<NN>-<slug>/
storm-canonical: true
---
# REVIEW Log — module `<slug>`

## Layer 1 — Functional Smoke
- Flows executed: <list>
- Pass: N / Fail: M
- Evidence: storm/review/evidence/<slug>/L1-crawl/
- Findings:
  - **[P0]** Flow "create-invoice" 500 on submit — proposed fix: [diff], human: ack/reject/discuss
  - ...

## Layer 2 — Console Errors
- ...

[... layers 3-8 ...]

## Verdict
**PASS / FIX-REQUIRED / LOOP-BACK** (overall)
- Open P0/P1: <count w/ refs>
- Auto-parked P2: <count w/ ticket #s>
- Framework-feedback P3: <count w/ #F-/#FF- refs>
```

**Outputs:** `storm/review/<NN>-review-<module-slug>.md` per review session (feedback + response + resolution)

**Exit criteria:**
- All non-trivial feedback addressed OR explicitly deferred to parking lot
- Human approves: *"this module is done"*

**Anti-stuck:**
- User endless dissatisfaction → AI (CP-3 guard) surfaces pattern, proposes explicit accept criteria
- User wants complete redesign → AI loop-back to STRUCTURE with confirmation

### 3.6 SHIP

**Inputs:** All built modules, `storm/specify/*`, `storm/structure/*`

**Verification boundary callout (v1.4 W-G39):** REVIEW = **AI-led automated 8-layer verification** (§3.5). SHIP smoke test = **human-led manual verification in deployed env** (this section). Reciprocal contract — neither side may punt verification to the other. See §6 Verification Boundary for the canonical contract.

**Activities (v1.4 re-ordered per W-G36 — schema migration classification moves BEFORE deployment prep so ordering plan informs deploy sequence):**

1. **Security audit** — AI generates `storm/ship/01-security-audit.md`
   - Technical items (auth flow, CVE scan, injection, encryption) → AI decides + documents
   - Business items (data collection, retention, compliance) → human approves per CP-7
2. **QA report** — AI runs end-to-end tests → `storm/ship/02-qa-report.md`
3. **Deployment topology resolution (v1.4 W-G37):** orchestrator reads `storm/structure/07-deployment-target.md` as authoritative source for target topology (monolith / container / serverless), provider (Dokploy / k8s / Vercel / Fly / self-host), domain/SSL plan. **If this file is missing or contains TBD/placeholder content → BLOCKER. AI loops back to STRUCTURE.** Topology cannot be decided at SHIP per CP-6 #5 (architecture must match target from day 1). No deploy commands generated until topology resolved upstream.
4. **Schema migration pre-flight gate (v1.4 W-G36 re-order, per #FF-014 — MANDATORY before any prod migration, ahead of deploy prep):**
   - Classify each pending migration: **expand** (additive: ADD COLUMN nullable, ADD TABLE, ADD INDEX), **contract** (destructive: DROP COLUMN, DROP TABLE), **tighten** (NOT NULL ADD, narrowing CHECK/FK), or **rename** (decomposed into 3-deploy sequence).
   - **expand** → migrate FIRST → deploy code.
   - **contract** → deploy FIRST → verify prod container hash shows new image → migrate.
   - **tighten** → migrate FIRST (data backfilled) → deploy.
   - **rename** → 3 deploys: (1) add new + dual-write; (2) backfill + dual-read; (3) drop old. Never single-shot.
   - **Hard gate:** AI states classification + ordering plan + verifies prod-hash step BEFORE running any psql/migrate command. User confirms classification before execute. The ordering plan from this step **feeds directly into steps 5-6 deploy sequencing**.
5. **Smoke-test plan (v1.4 W-G38 — CANONICAL ARTIFACT, MUST exist BEFORE handoff):** dispatch opus sub-agent to draft `storm/ship/03-smoke-test-plan.md`. Concrete plan covering: pre-checks (URL reachable, auth works, no console errors) + critical flows per top user goal (actual URLs, actual button labels, actual expected states + "why this matters" line per flow) + edge cases + failure handling (capture screenshot, paste back to AI, rollback held with user). Typical 3-7 flows. The plan is **canonical** (committed before deploy, not improvised during smoke). Replaces v1.3 chat-message-only emission.
6. **Staging deploy** — AI produces commands per topology (step 3) + migration ordering (step 4); human runs; AI verifies (CP-4 step-by-step transparency).
7. **Production deploy** — same pattern; verify each step.
8. **Post-deploy smoke test execution (per #FF-015 — human-led, AI scaffolds via canonical plan):**
   - Human opens `storm/ship/03-smoke-test-plan.md` (drafted at step 5) and executes against deployed env.
   - During execution: AI assists on request (screenshot, curl probe, log tail). AI does NOT drive.
   - Acceptance: human reports PASS/FAIL per flow into the plan file as inline annotations. PASS on all critical = production verified.
9. **Monitoring setup** — logs, alerts, backup. Goes into `storm/ship/04-deployment-config/` (D2 sequential renumber).
10. **Runbook** — `storm/ship/05-runbook.md` — ongoing ops guide (D2 sequential renumber).

**Outputs (v1.4 ship/ renumber per D2):**
- `storm/ship/01-security-audit.md`
- `storm/ship/02-qa-report.md`
- `storm/ship/03-smoke-test-plan.md` (v1.4 W-G38 canonical)
- `storm/ship/04-deployment-config/`
- `storm/ship/05-runbook.md`
- Live application

**Exit criteria:**
- `07-deployment-target.md` resolved (no TBD)
- Security audit business-section human-approved
- QA report clean (no P0/P1 failures)
- Schema migration classification + ordering committed BEFORE deploy
- `03-smoke-test-plan.md` exists as canonical artifact BEFORE handoff
- Production deploy verified (human-marked PASS per flow in `03-smoke-test-plan.md`)
- Runbook landed

**Anti-stuck:**
- Deploy command fails → AI diagnoses, proposes fix, human executes (step-by-step)
- Infrastructure issue → AI surfaces as blocker, may loop-back to STRUCTURE (deployment target wrong)

---

## 4. The Sync Implementation

### 4.1 Dependency DAG Tracking

AI maintains an internal dependency graph. Each doc's frontmatter records its upstream dependencies:

```markdown
---
storm-depends-on:
  - storm/capture/01-braindump.md
  - storm/capture/03-ideation-coverage.md
storm-phase: structure
storm-canonical: true
---
# Vision

Content here...
```

**Fields:**
- `storm-depends-on`: array of upstream canonical docs
- `storm-phase`: phase this belongs to
- `storm-canonical`: true for authoritative doc, false for AI-derivative

**Valid upstream targets (v1.4 W-G2 expansion):** the DAG accepts any of the following file types as `storm-depends-on` entries — not only the obvious numbered canonical files:

| Target | Where it lives | Why it counts as upstream |
|---|---|---|
| Numbered canonical (e.g. `01-vision.md`) | `storm/structure/`, `storm/specify/<NN>/`, etc. | Default canonical |
| `_briefing.md` | `storm/build/<NN>-<slug>/<NNN>-task/` or anywhere a sub-agent is dispatched | Per #FF-016: sub-agent context contract — downstream artifacts depend on it (orchestrator-authored, sub-agent-read) |
| `_audit.md` | `storm/specify/<NN>/`, `storm/review/<NN>/` | Per #FF-007: cross-file consistency audit — flagged inconsistencies cascade fixes downstream |
| `_decisions.md` | `storm/structure/`, `storm/specify/<NN>/`, `storm/meta/` | Locked decisions are upstream for any artifact that operationalizes them |
| `00-domain-lens.md` | `storm/structure/00-domain-lens.md` | Per L3-01: canonical cross-phase artifact; every SPECIFY/BUILD/REVIEW concern depends on it (hat-switch frame) |

If any of these change → walk the DAG. Sub-agent-authored artifacts MUST cite the `_briefing.md` they were forked from in their own `storm-depends-on` frontmatter so the cascade chain is complete.

### 4.2 Change Detection

AI detects changes via:
1. **Session start** — session-start hook scans git diff since last commit, identifies canonical doc changes
2. **Mid-session** — on any user prompt, AI checks if referenced docs have changed externally
3. **Explicit trigger** — user runs `/storm-sync` to force check

### 4.3 Cascade Flow

When change detected:

```
1. AI identifies changed canonical doc
2. AI walks DAG downstream → affected docs
3. AI composes propagation plan
4. AI announces: "Change in [doc]. Affects [X, Y, Z]. Plan: [diff summary]. Approve?"
5. Human: approve / modify / reject
6. If approved: AI executes cascade atomically → single git commit
7. If rejected: AI reverts detection, asks for clarification
```

#### 4.3.1 Multi-Author Cascade (v1.4 W-G3)

When the change originates inside a forked sub-agent (e.g., SPECIFY dispatches a tech-verify sub-agent that produces a new `06-tech-choices.md`, or REVIEW dispatches an audit sub-agent that lands `_audit.md` flags), the cascade flow has an extra rule:

> **The orchestrator collects ALL sub-agent changes FIRST, THEN composes the cascade plan.**

Why: a single phase invocation may fork 2–3 sub-agents in parallel. If the orchestrator cascades after sub-agent #1 returns and again after sub-agent #2 returns, the user faces 2–3 separate approval gates for what is logically one phase outcome (CP-1 anti-fatigue violation). Instead:

```
1. Orchestrator forks sub-agents (parallel where independent — see §8.7)
2. All sub-agents commit their own artifacts atomically with their tier's Model:/Felt: trailers
3. Orchestrator waits for all sub-agents to return
4. Orchestrator walks the merged DAG → composes ONE cascade plan covering all sub-agent outputs
5. Orchestrator announces ONE consolidated propagation plan
6. Human approves once → orchestrator executes the cascade as one atomic commit
```

Sub-agent commits stay separate from the cascade commit (Layer 2 recovery preserves authorship). The cascade commit references the sub-agent commits in its body.



### 4.4 Rollback

Every cascade = 1 atomic git commit with STORM convention:
```
storm:SYNC:[source-doc]:cascade to [affected-docs]

[summary of changes]
```

Rollback:
- User: *"rollback last change"* or `/storm-rollback`
- AI: `git revert` the cascade commit, re-verifies DAG consistency
- User: *"rollback to before [description]"* → AI identifies commit by matching description, reverts

**Multi-step rollback:** allowed backward from any point to phase-exit anchors (safe checkpoints).

---

## 5. Parking Lot Implementation

### 5.1 File Format (v1.4 W-G40 + W-G41)

`storm/meta/parking-lot.md` — fragmentation threshold follows L5-01 ladder: `<100` keep single / `500-800` consider split / `≥800` MUST split into `storm/meta/parking-lot/` folder by topic.

**Ticket format adds `module:` tag + lifecycle state (W-G41):**

```markdown
# Parking Lot

AI-maintained backlog of out-of-scope ideas. Tickets triaged at phase boundaries or on-demand.

## Active Tickets

### #003 — Export invoices to Excel
- **Logged:** 2026-XX-XX 14:32
- **Parked at:** SPECIFY module `invoicing`
- **Module tag:** `invoicing`              ← v1.4 W-G41 / L2-08
- **Lifecycle state:** Pending              ← v1.4 W-G41 (Pending / Active-now / Scheduled-<phase> / Rejected / Resolved)
- **Original context:** User said: "eh tambahin export excel juga"
- **Classification:** Feature expansion
- **Priority:** P2-Nice
- **REVIEW severity (if from L1-L8 auto-grade):** P2 → auto-parked from REVIEW Layer 4

### #002 — ...

## Resolved

### #001 — Dark mode support
- (logged, triage, status, resolution)
```

### 5.2 Auto-Park Protocol (v1.4 W-G42 — P0-Blocker exception)

When user mentions something outside current task scope:

```
1. AI detects scope divergence
2. AI auto-creates ticket (no ask)
3. AI auto-tags with module: <slug> if surfaced in module-specific context (L2-08)
4. AI responds inline: "Parked as #004 (module: <slug>): [title]. Continuing [current task]."
5. AI appends to parking-lot.md w/ Pending lifecycle state
6. Next relevant phase boundary (or on user request) → triage
```

**P0-Blocker exception (W-G42):** if the surfaced item genuinely blocks the current task from completing (e.g., missing OAuth credential the in-flight task needs), AI does NOT auto-park — surfaces as **blocker**, pauses current work, asks: *"P0-Blocker for current task: [item]. (a) resolve now and continue, (b) park as known blocker + halt this task. Pick."*

### 5.3 Triage Ritual (v1.4 W-G43 — auto-fire hybrid)

Auto-fires when **either** (a) ≥10 Pending tickets accumulate OR (b) a phase boundary is crossed — whichever first (L2-08 hybrid). User can also force on-demand via `/storm-park`.

```
1. AI lists all Pending tickets grouped by module: tag
2. Per ticket, AI proposes lifecycle transition: Active-now (integrate now) /
   Scheduled-<phase> / Rejected / Resolved (already done) / keep Pending
3. Human picks per ticket OR bulk-picks ("park all P3 as Rejected")
4. AI updates lifecycle state; if Active-now → initiates appropriate phase entry
```

### 5.4 Commands

- `/storm-park "description"` — manual park (rarely needed; auto-park usually handles)
- `/storm-park-list` — show active tickets
- `/storm-park-review` — start triage
- `/storm-park-resolve [ID] [status]` — mark resolved

---

## 6. Recovery Layers

Five independent layers per CP-12 + Foundation, each self-sufficient. (v1.4 D1 AMENDED per #FF-024: D1 deleted the old passive append-only Layer 5 *session-notes* as empirically-unused — but that evidence came only from single-session test-harness runs, a regime structurally incapable of surfacing multi-session friction. DealFlow — a real, multi-session, 8+ module project — supplied valid new evidence. So Layer 5 returns, NOT as the old passive log, but as a structured *active* Session Handoff written at session-end by a fresh sub-agent. CP-12 principles are unchanged — confirmed, in fact: "human never writes a handoff file" still holds, because a sub-agent writes it from ground truth, not the human.)

### Layer 1: CLAUDE.md (v1.4 W-G45 + W-G46)

Auto-loaded by Claude Code every session. STORM-structured sections:

```markdown
# [Project Name]

## Current State (AI-maintained)
- **Phase:** [current phase]
- **Sub-context:** [current module / task / review event]
- **Last decision:** [most recent locked decision]
- **Next step:** [what to do next]
- **Load these files:** [canonical docs relevant to current context]

## STORM Config
- **Framework version:** v1.4
- **Domain Lens:** [verbatim from storm/structure/00-domain-lens.md]  ← v1.4 W-G45
- **Deployment target:** [from storm/structure/07-deployment-target.md]

## Active Modules (v1.4 W-G46 — Picked mockup column for visual continuity)
| Module | Phase | Picked mockup | Task in flight |
|---|---|---|---|
| <slug> | BUILD | mockup-v2.html (Bold) | 003-invoice-form |

## Recent Parking Lot Triage
[last 3 resolved tickets for context]
```

AI updates this file after every task completion, phase transition, mockup pick, or status change.

**Keep `CLAUDE.md` bounded (CP-14).** `CLAUDE.md` is auto-loaded into EVERY prompt — every line here is a permanent per-load context tax. So it must stay a *current-state snapshot*, not an accreting ledger:
- The `## Current State` section holds only the live phase / sub-context / last decision / next step — NOT a growing history of past decisions.
- Do NOT add deploy trackers, module grids, session journals, or changelogs into `CLAUDE.md`. Those belong in on-demand `storm/meta/*.md` artifacts read only by the session commands (e.g. `module-status.md` #FF-023, `session-handoff.md` #FF-024) — *cheaper on context than CLAUDE.md content, even though it looks like more files*.
- Project history / journey lives in git (Layer 2) + the session-handoff (Layer 5), not in prose that reloads every turn.
- When `CLAUDE.md` starts growing unbounded, that is itself a CP-14 violation — prune the historical narrative back to current-state.

### Layer 2: Structured Git Commits (v1.4 W-G47 — mandatory trailers + REVIEW/SHIP examples)

STORM commit convention:

```
storm:PHASE:MODULE:MILESTONE:TASK - [short description]

[optional body]

Model: <sonnet|opus|haiku>
Felt: <ok|long|snappy>
```

Examples (covering every phase + sub-agent dispatch + cascade):
- `storm:CAPTURE:::braindump - log concept` + `Model: sonnet, Felt: ok`
- `storm:STRUCTURE:::domain-lens - draft inferred framing` + `Model: opus, Felt: ok`
- `storm:SPECIFY:invoicing::ui - L3-03 interpretation locked` + `Model: sonnet, Felt: ok`
- `storm:SPECIFY:invoicing::mockup-v2 - Bold variant` + `Model: sonnet, Felt: ok`
- `storm:SPECIFY:invoicing::audit - PASS 0 findings` + `Model: opus, Felt: ok`
- `storm:BUILD:invoicing:m1:task-003 - invoice form` + `Model: sonnet, Felt: snappy`
- `storm:REVIEW:invoicing::L8-audit - P0:0 P1:2 P2:5 P3:1` + `Model: opus, Felt: long`
- `storm:REVIEW:invoicing::exit - PASS 2 P1 fixed` + `Model: sonnet, Felt: ok`
- `storm:SHIP:::smoke-plan - 5 flows` + `Model: opus, Felt: ok`
- `storm:SHIP:::v1.0.0 - shipped` + `Model: opus, Felt: snappy`
- `storm:SYNC:domain-lens:cascade - re-validate` + `Model: opus, Felt: ok`

Extraction:
```sh
git log --pretty='%ci %h %s%n  M=%(trailers:key=Model,valueonly=true) F=%(trailers:key=Felt,valueonly=true)'
```

`git log` alone reconstructs project timeline AND per-command model usage + felt-speed profile.

### Layer 3: Plan File Status Markers

Within `storm/build/<NN>-<module-slug>/_plan.md` and similar task-tracking files, AI marks:
- `[DONE]` — completed
- `[IN PROGRESS]` — active
- `[PENDING]` — not started
- `[BLOCKED]` — waiting (with reason)

### Layer 4: Self-Healing Session Start (v1.4 W-G48 expansion — drift 3-option)

On every session start, the `storm-recovery` skill triggers. The canonical opener command is **`/storm-start-session`** (version + 5-layer cross-check + handoff continuity check + report). `/storm-status` is a lightweight read-only peek (no cross-check); `/storm-recover` forces a re-check + repair when state looks wrong.

```
1. Load CLAUDE.md (Layer 1)
2. Run git log --oneline -20 (Layer 2) + extract Model:/Felt: trailers
3. Scan `storm/build/*/_plan.md` for current [IN PROGRESS] markers (Layer 3)
4. Read the TOP entry of `storm/meta/session-handoff.md` (Layer 5 — newest-on-top, top entry only)
5. Cross-check WITHIN project:
   - Does CLAUDE.md "Current State" match git recent?
   - Does [IN PROGRESS] in plan match what's reported?
   - Does CLAUDE.md "Domain Lens" still match storm/structure/00-domain-lens.md?
   - Does CLAUDE.md "Active Modules" Picked mockup match _picked.md files?
6. VISIBLE continuity check (Layer 5): compare the handoff top entry's anchor-SHA + Next/Pending
   against git HEAD + plan [IN PROGRESS]:
   - Match → report "✅ selaras" (handoff anchor matches git, Next/Pending consistent)
   - Mismatch → report "⚠️ reconciled from git" + state what diverged + how it was reconciled
   - Carry forward any unresolved ⏳ Pending decisions into this session (re-surface to user)
7. Cross-check ACROSS project vs RUNTIME (v1.4 W-G48 — drift detection):
   - Hash check: ~/.claude/commands/storm-*.md vs project's .claude/commands/storm-*.md
   - If global install drifted from project freeze → 3-option response:
     (a) Backport — apply runtime changes back into source-of-truth + commit
     (b) Reconcile — surface diff, ask user which side wins per file
     (c) Freeze — leave runtime as-is, document divergence in framework-feedback
8. If inconsistency detected → AI reconstructs correct state, updates CLAUDE.md, reports
   discrepancy + proposed resolution (per L4-05 narrated self-healing).
9. Report: "Session recovered. Done last session: [..]. Pending — needs you: [..]. Next: [..].
   Continuity: [✅ selaras / ⚠️ reconciled]. Drift: [none / detected → 3-option]. Ready?"
   (If everything is clean — congratulate the user; clean continuity is the assurance signal.)
```

### Layer 5: Session Handoff (v1.4.x, #FF-024 — amends D1)

`storm/meta/session-handoff.md` is the cross-session continuity layer. It serves two readers at once: **AI recovery** (reads only the top entry to resume) and **user assurance / project journey** (the history below the top entry is a readable log of how the project got here — important for a zero-coding, ADHD-prone user who switches sessions often to avoid the AI context-window "dumb-zone").

**Append-only, NEWEST ENTRY ON TOP.** Recovery reads ONLY the top entry — bounded read. Writing inserts a new entry after a fixed marker at the top of the file — bounded write, never a whole-file rewrite. History accumulates below, untouched.

**Written at session END by a FRESH forked sub-agent** (sonnet) that reconstructs the entry from ground truth — git log + plan-file markers + CLAUDE.md — NOT from conversation memory. This is what makes the layer trustworthy: it cannot inherit the drift of a long, fuzzy chat context. (CP-12 confirmed: the human never writes the handoff file — a sub-agent does.)

Entry schema:

```
## [YYYY-MM-DD HH:MM] — [phase / module] — anchor: <commit-SHA>
- ✅ Done this session: ...
- 🔒 Decided: ... (+1-line why)
- ⏳ Pending — needs YOUR decision: ... (carried forward until resolved; "none" if clean)
- ➡️ Next: ...
```

The `anchor: <commit-SHA>` ties the entry to a concrete git state so the next session's continuity check (Layer 4 step 6) can verify the handoff against ground truth. `⏳ Pending` decisions are **carried forward** entry-to-entry until resolved — an unresolved business decision never silently disappears between sessions.

**Two-source rule (v1.4.x, #F-012 — amends the ground-truth-only rule above).** The "reconstruct from ground truth, NOT conversation memory" discipline is correct for **facts** (what was built / committed) — reconstructing those from a long fuzzy chat is the dumb-zone risk #FF-024 rightly avoids. But **intent / open-questions / just-made *verbal* decisions** are knowledge ONLY the orchestrator holds; a verbal decision made this session is not yet in git or CLAUDE.md, so a ground-truth-only sub-agent is structurally blind to it (the prune-first ordering was missed exactly this way, 2026-05-28). The fix keeps the two sources clean and separate:

| Handoff content | Source | Tag |
|---|---|---|
| Facts (Done / commits / phase / plan markers) | git + plan + CLAUDE.md (sub-agent reconstructs) | untagged (git-verified) |
| Verbal-only decisions + open-questions made this session | `storm/meta/session-delta.md` — a bounded **outbox** the orchestrator writes BEFORE dispatch | `[conversation-claim]` |

`session-delta.md` is the durable bridge from the orchestrator's head to the fresh sub-agent: the orchestrator writes the session's verbal-only items there as the **first step** of the exit ritual, so by the time the sub-agent reconstructs, those items are already on disk (complete-by-construction) rather than passed as a transient input that the mandatory dispatch-failure fallback would lose. Items carried in via the delta are tagged `[conversation-claim]` so the next session knows to confirm them. The file is a sibling of `session-handoff.md` / `module-status.md` — `storm/meta/*.md`, read on-demand only, NEVER injected into CLAUDE.md (CP-14). It is bounded (one session's verbal items, overwritten each exit), not a history — the handoff entry IS the history once written. **Deliberate non-goal (YAGNI):** the delta is flushed at exit-time, not incrementally as each decision locks mid-session; the observed failure was at handoff synthesis, not a mid-session crash, so per-decision flushing is not built until evidence demands it.

### Session Exit ritual (v1.4.x, #FF-024 — replaces "just close")

Earlier STORM treated session exit as implicit ("just close — nothing is unsaved"). #FF-024 amends this: there is now a canonical closer, **`/storm-end-session`**, running the Session Exit ritual:

```
0. FLUSH (v1.4.x, #F-012) — orchestrator writes this session's verbal-only decisions +
   open-questions to storm/meta/session-delta.md (bounded outbox, overwrite). Skip only if
   none were made this session. This is the durable bridge for knowledge git can't see.
1. Dispatch a FRESH forked sub-agent (sonnet) — reconstructs FACTS from ground truth
   (git + plan + CLAUDE.md), NOT conversation memory (§8.7 use-case), AND reads
   storm/meta/session-delta.md for verbal-only items, tagging those [conversation-claim].
2. Sub-agent inserts the new entry at the TOP of storm/meta/session-handoff.md (after marker).
3. Orchestrator shows the entry summary to the user (Done / Decided / Pending / Next).
4. User confirms the business/decision content is correct (comprehension-check, not code review).
5. Commit the handoff (storm:META-style or storm:SESSION-HANDOFF commit per project convention).
```

**MANDATORY fallback:** if the sub-agent dispatch fails or times out (per §8.7.7), the orchestrator (main session) writes a **minimal entry tagged `[unverified]`** directly — capturing at least anchor-SHA + Next — so a handoff always exists. A degraded handoff beats no handoff. The `[unverified]` tag tells the next session's continuity check to lean harder on git/plan ground truth. Because the verbal-only items were flushed to `session-delta.md` in step 0 (BEFORE dispatch), the fallback path can read them off disk and fold them into the minimal entry — they survive the dispatch failure rather than evaporating with the lost sub-agent input (the concrete reason the delta is a durable file, not a transient dispatch parameter).

### Module status tracker (v1.4.x, #FF-023 — tracked artifact, NOT a recovery layer)

`storm/meta/module-status.md` answers one glance-test question that prose + git log + the deploy dashboard otherwise force a 3-source cross-check for: **which module is where in the staging→prod pipeline right now?** It is a deliberate sibling of the session-handoff artifact (#FF-024): both are `storm/meta/*.md` files read **on-demand** by the session commands, NOT injected into `CLAUDE.md`. This placement is load-bearing — `CLAUDE.md` is auto-loaded into every prompt, so putting an accreting deploy grid there would be a permanent per-load context tax, contradicting the very #FF-024 insight (CLAUDE.md accretion = bloat). Keeping it on-demand costs context only when a session actually starts or peeks.

**It is a *tracked artifact*, not a formal Recovery Layer** — no full cross-check ceremony; just a light reconcile against git ship-tags at session start.

Grid schema:

```markdown
# Module Status

> AI-maintained deploy-pipeline tracker. Read on-demand by /storm-start-session + /storm-status.
> NOT auto-loaded (kept out of CLAUDE.md to avoid per-load context tax, per #FF-024 insight).
> This is STORM's CLAIM of what it deployed; prod ground-truth lives in the deploy platform
> (Dokploy / k8s / etc). Session start reconciles this grid against git ship-tags/commits.

| Module | Slug | Phase | Staging SHA | Prod SHA | SHIP date | Notes |
|---|---|---|---|---|---|---|
| <name> | <slug> | BUILD / REVIEW-PASS / STAGING / PROD | <sha> | <sha> | YYYY-MM-DD | ... |
```

**Maintenance (AI-autonomous, atomic):**
- At **REVIEW-PASS exit** → set the module's `Phase` (e.g. → `REVIEW-PASS`/`STAGING`) and `Staging SHA` (the reviewed/exit commit).
- At **SHIP exit** → set `Prod SHA` + `SHIP date`, `Phase` → `PROD`.

**Read (on-demand):** `/storm-start-session` surfaces the grid in its recovery report and reconciles `Prod SHA` against git ship-tags (claim-vs-truth, same pattern as the handoff anchor reconcile); `/storm-status` echoes the grid as a fast peek. Neither dumps the grid into `CLAUDE.md`.

### Foundation: Protocol Rules

`.claude/rules/storm-protocol.md` is always-loaded. Contains:
- STORM behavioral invariants (CP-1 through CP-12 operational rules)
- AI posture (hat-switch, parking auto-behavior, narration protocol)
- Recovery self-healing instructions

Ensures every new session follows STORM without human reminder.

#### Verification Boundary (v1.4 W-G50, per L4-02 / #FF-015)

Recovery and verification are AI-owned across the lifecycle EXCEPT at one explicit handoff:

| Phase | Who verifies | How |
|---|---|---|
| CAPTURE → SPECIFY | AI | Exit criteria check + artifact existence verification |
| BUILD | AI | Per-task acceptance criteria; lint/test if applicable |
| **REVIEW** | **AI** | Browser automation (Playwright / Chrome MCP / browser-use). AI auto-verifies critical flows BEFORE declaring PASS. Do NOT punt to human "please test manually." |
| **SHIP smoke test** | **Human** | AI scaffolds a concrete smoke-test plan (pre-checks, critical flows w/ actual URLs / labels / expected states, edge cases, failure handling) BEFORE handoff. Human runs in deployed env. AI assists on request but does not drive. |

The boundary exists because deployed environments expose realities (DNS, certs, real auth, real data) that browser automation against staging cannot fully model. The handoff is a deliberate role-flip back to human leadership for production cutover — mirroring the CAPTURE → STRUCTURE flip in reverse.

If REVIEW issues a PASS without AI-driven browser verification → CP-11 violation. If SHIP smoke runs without a written plan handed off → #FF-015 regression.

---

## 7. UI/UX Workflow

Implementation of the UI/UX Interpretation model (framework Section 5).

### 7.1 storm/structure/08-design-system.md Format

STRUCTURE phase output:

```markdown
---
storm-phase: structure
storm-canonical: true
---
# Design System

## Tone
- Primary: [minimalist / playful / professional / warm]
- Notes: [qualifiers]

## Color Mood
- [description, e.g., "muted earth tones" / "vibrant tech blues"]
- Forbidden: [colors to avoid, e.g., "no neon pink"]

## Typography Feel
- [e.g., "geometric sans-serif, medium weight, clean hierarchy"]

## Density
- [sparse / balanced / dense]

## Interaction Patterns
- Primary device: [mobile-tap / desktop-keyboard / both]
- Key affordances: [expected patterns]

## Reference Apps
- Linear — like: clean typography, fast keyboard nav; unlike: too cold
- Notion — like: flexible layout; unlike: overly nested menus

## Patterns to Avoid
- Jira-style cluttered sidebars
- Modal-heavy interactions

## Accessibility Baseline (v1.4 W-G51)
- Target: WCAG 2.2 AA (color contrast ≥4.5:1 body / ≥3:1 large; focus-visible on all interactives; keyboard-reachable for every action with a mouse path)
- Reduced motion: respect `prefers-reduced-motion: reduce` (motion <100ms or none)
- Screen reader: every interactive has aria-label or visible label; no icon-only without aria
- Validation: REVIEW Layer 4 runs axe-core; P0 fail blocks PASS

## Motion (v1.4 W-G51)
- Default duration: 150-220ms (UI feedback); 250-400ms (page/route transitions)
- Easing: standard `ease-out` for entering, `ease-in` for exiting; bespoke curves only with rationale
- Reduced motion fallback: opacity / instant transitions when `prefers-reduced-motion` is set
- Forbidden: parallax scroll on data-dense screens, auto-rotating carousels without pause control
```

### 7.2 04-ui.md Format (per module, SPECIFY) — v1.4 W-G52/53/54

```markdown
---
storm-phase: specify
storm-module: invoicing
storm-depends-on:
  - storm/structure/00-domain-lens.md   # v1.4 W-G53: framing upstream
  - storm/structure/08-design-system.md
  - storm/specify/<NN>-invoicing/02-flows.md
storm-canonical: true
---
# UI for [Module Name]

## UX Interpretation (v1.4 W-G54 / L3-03 canonical 4-bullet format)

- **You said:** "Gw mau lihat performance sales sekilas, gak mau klik-klik."
- **I interpret as:** Single-screen dashboard with two zones — (1) trend line, last-30-day revenue, hover-for-exact-value; (2) top-5 sales-rep leaderboard, rank-pill + delta-arrow. No drill-down on main screen.
- **Why this fits:** Domain Lens says Indonesian SME sales-team-centric → leaderboard is culturally motivational (visible ranking). "Sekilas" + "gak mau klik-klik" → no nested modals or drilldowns on the primary screen. Design-system density = sparse, so two zones fit without compression.
- **Validate?** Confirm interpretation, redirect ("yang gw maksud bukan leaderboard, tapi…"), or discuss.

## Human Validation
✅ Approved as interpreted. (OR: redirected to → [revised interpretation, re-validated])

## Visual Mockup Variants (v1.4 L3-05 — three required)

| Variant | File | Direction |
|---|---|---|
| **v1 Conservative** | `04-ui/mockup-v1.html` | Closest to design-system baseline — sparse, neutral palette, standard card pattern |
| **v2 Bold** | `04-ui/mockup-v2.html` | Stretches aesthetic — accent color on rank pill, animated delta indicator, denser typography |
| **v3 Wildcard** | `04-ui/mockup-v3.html` | Different paradigm — leaderboard as horizontal podium instead of vertical list |

## Picked Variant
See `04-ui/_picked.md` — human's pick + rationale. **This locks the visual baseline** for BUILD (W-G30 diff-vs-baseline) and REVIEW Layer 5 (visual regression).

## Interaction Notes
- Leaderboard click → drill into individual rep view (separate module, out of scope here)
- Trend hover → tooltip with exact values

## Design-System Citations (v1.4 L3-04 — explicit, not implicit)
- Color: `08-design-system.md §Color Mood "muted earth tones"` — leaderboard rank pill uses warm-accent
- Spacing: design-system §Density "sparse" — 24px between cards
- Typography: design-system §Typography Feel "geometric sans-serif" — rank numerals tabular
- Motion: design-system §Motion 150-220ms — delta-arrow ease-out, respects reduced-motion
- Accessibility: design-system §Accessibility Baseline — focus-ring on each rank-row, aria-label on delta-arrow
```

**`04-ui/_picked.md` template:**

```markdown
---
storm-phase: specify
storm-module: invoicing
storm-depends-on:
  - storm/specify/<NN>-invoicing/04-ui.md
  - storm/specify/<NN>-invoicing/04-ui/mockup-v1.html
  - storm/specify/<NN>-invoicing/04-ui/mockup-v2.html
  - storm/specify/<NN>-invoicing/04-ui/mockup-v3.html
storm-canonical: true
---
# Picked Mockup Variant — module `invoicing`

**Picked:** v2 Bold (`04-ui/mockup-v2.html`)
**Picked at:** 2026-XX-XX HH:MM
**Picked by:** human after viewing all 3 variants

## Rationale (human's words, AI's paraphrase OK)
"v2 yang accent color-nya bagus, leaderboard-nya kerasa lebih hidup. v1 kurang punya identity, v3 podium-nya aneh untuk daily-view."

## Baseline Lock
- BUILD (W-G30): diff-vs-baseline target = `mockup-v2.html`
- REVIEW Layer 5: visual regression target = `mockup-v2.html`
- Any deviation in BUILD = self-flag before next task (W-G55 UI-checkpoint)
```

### 7.3 UI-Checkpoint (BUILD) — v1.4 W-G55 Diff-Vs-Baseline

For UI-heavy tasks, before marking task done, run **diff-vs-baseline** against the picked mockup variant — NOT freeform "matches your vision?" (too vague when user lacks vocabulary, CP-3 friction trigger).

1. **Identify baseline:** read `storm/specify/<NN>-<module-slug>/04-ui/_picked.md` → the picked variant (e.g., `mockup-v2.html`).
2. **Render + screenshot** the live built UI for this task's screen.
3. **AI runs diff** along these axes (objective, design-system citation-grounded):
   - **Color** vs baseline + `08-design-system.md §Color Mood`
   - **Spacing / density** vs baseline + `§Density`
   - **Typography** vs baseline + `§Typography Feel`
   - **Layout pattern** (card vs row, drawer vs modal, etc.) — must match baseline pattern exactly
   - **Component presence** (every component in baseline rendered? extra components not in baseline?)
   - **Motion / interaction** vs `§Motion`
   - **Accessibility** vs `§Accessibility Baseline` (focus-visible, aria-label, keyboard path)
4. **Self-flag if material divergence:** AI surfaces with format:
   > *"BUILD task <NNN> UI-checkpoint diff vs `mockup-v<X>.html`:*
   > - *Color: matches.*
   > - *Spacing: rank-card gap 16px built vs 24px baseline → off by 8px (citation: design-system Density sparse).*
   > - *Layout: matches.*
   > - *Motion: built no transition; baseline has 180ms ease-out delta-arrow.*
   >
   > *Options: (a) accept divergence + update `_picked.md` rationale, (b) fix and re-diff, (c) escalate to SPECIFY loop-back if baseline itself wrong."*
5. **Human picks option.** If (b) fix-and-re-diff → AI iterates within task; re-runs diff until material divergence cleared.
6. Once cleared OR (a) divergence-accepted: marks `[DONE]`, commits.

**Why this is stricter than v1.3:**
- v1.3 asked *"matches your vision?"* — human often can't articulate even if dissatisfied → false PASS that surfaces as REVIEW dissatisfaction loop.
- v1.4 diff-vs-baseline is objective. Human's reaction to specific diffs ("don't care about 8px") is meaningful, where reaction to abstract "vision" is not.
- Baseline is locked in SPECIFY (`_picked.md`), not re-debated per task. Reduces motivation drain from re-litigating visual direction every task.

### 7.4 07-acceptance.md Format (per module, SPECIFY) — v1.5 #E4 Item 4b

Authored BEFORE build as the testable contract; REVIEW Layer 1 verifies the running app against THIS. AI-drafted, terse; human comprehension-approves (does not author). One story + observable acceptance block per role×flow.

```markdown
---
storm-phase: specify
storm-module: <slug>
storm-depends-on:
  - storm/specify/<NN>-<slug>/02-flows.md
  - storm/specify/<NN>-<slug>/03-rules.md
storm-canonical: true
---
# Acceptance Oracle — module `<slug>`

> REVIEW Layer 1 verifies the running app against the criteria below — not an
> on-the-fly judgement. Each `[ ]` is browser-observable. AI-drafted; human
> comprehension-approves.

## <Role> — <flow name>
**Story:** As a <role>, I can <action> so that <outcome>.
**Acceptance (observable):**
- [ ] <observable end-state, e.g. "invoice list page reachable from main nav">
- [ ] <e.g. "submitting valid form shows success toast + row appears">

## Coverage
Roles × flows: N / N covered.  *(CP-10 progress signal — not a second gate.)*
```

**Rules:** observable = browser/runtime-verifiable end-state (reachable, renders, end-state reached), NOT prod-only or time-delayed outcomes. Outcome/success-metrics are explicitly OUT (not REVIEW-verifiable; an optional 1-line north-star may live in `storm/structure/01-vision.md`). Infra-only modules with no role×flow: file may be a stub noting "no user-facing role×flow — acceptance gate is a no-op for this module".

### 7.5 REVIEW UI Dissatisfaction Flow (cross-ref REVIEW Layer 5 visual regression)

If human signals UI dissatisfaction at REVIEW (typically surfaced by Layer 5 visual regression OR by human-reported friction):

1. AI (UX hat): *"Let me understand what's off. Layer 5 flagged [specific diff vs `04-ui/<picked>.html` baseline]. Layout, colors, density, or something else?"*
2. Human describes friction (relative to baseline if surfaced from L5, otherwise free-form).
3. AI re-interprets, proposes fix using L3-03 4-bullet format:
   - **You said:** *"[human's description verbatim]"*
   - **I interpret as:** [concrete change]
   - **Why this fits:** [grounded in design-system + baseline]
   - **Validate?**
4. If **fundamental** (baseline itself wrong): loop-back to SPECIFY `04-ui.md`, re-run UX Interpretation Protocol, dispatch new mockup variants → human picks new baseline → cascade.
5. If **cosmetic** (within baseline tolerance, just an implementation drift from baseline): dispatch sonnet sub-agent (Template B), fix in BUILD, re-run L5 to verify diff cleared.

Layer 5's diff-vs-baseline removes the v1.3 ambiguity ("is this UI good?") by making the question concrete: "does the built screen match the picked mockup?"

---

## 8. Claude Code Integration

### 8.1 Directory Setup

On project init (or when converting existing project to STORM), verify/create:
- `.claude/rules/storm-protocol.md` (present)
- `.claude/commands/storm-*.md` (all 10 commands present)
- `.claude/skills/storm-*.md` (5 skills present)
- `CLAUDE.md` (STORM-structured)
- `storm/` folder with starter files (see Section 2 for v1.3 layout)

### 8.2 Slash Commands

Each command is a `.md` file in `.claude/commands/` that triggers a STORM action.

Examples:

**`/storm-status`** — Report current state (phase, module, task, last decision, next step).
**`/storm-capture`** — Enter or resume CAPTURE phase.
**`/storm-park "description"`** — Manual park (rarely needed).
**`/storm-feedback "description"`** — Log framework friction.

(See `.claude/commands/storm-*.md` for full definitions.)

### 8.3 Skills

Skills run autonomously based on context triggers.

- **storm-phase-guard** — watches for phase boundary violations, enforces exit criteria
- **storm-sync-cascade** — detects canonical doc changes, composes cascade plan
- **storm-recovery** — runs on session start, cross-checks recovery layers, reports state
- **storm-friction-detector** — watches for friction patterns (repeated confusion, circling), suggests feedback log entry
- **storm-hat-switch** — announces explicit domain-expert hat changes

### 8.4 Hooks (Optional)

Claude Code hooks can trigger scripts on events. STORM uses sparingly:
- `SessionStart` hook → run recovery check (can be done via skill instead)
- `PostToolUse` on file edit → trigger sync-cascade check (skill-based alternative preferred)

Hooks are tool-specific and may not port to Antigravity; skills + commands are preferred as the primary mechanism.

### 8.5 Settings

`.claude/settings.json` (project-level, committed):

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "WebSearch",
      "WebFetch(*)"
    ]
  },
  "env": {
    "STORM_VERSION": "v1.5.0"
  }
}
```

`.claude/settings.local.json` stays for local-only overrides (gitignored).

### 8.6 MCP Tooling (v1.4 W-G6 — Baseline + Opt-in tiers)

STORM commands rely on external tools surfaced via MCP servers or installed CLIs, organized in two tiers:

**Baseline tier (required for full v1.4 capability):**

| Tool | Used by | Purpose |
|---|---|---|
| **Context7** (MCP) | `storm-structure`, `storm-specify` (CP-6 verification gate) | Library docs, latest stable, merge/deprecation |
| **WebFetch** (built-in) | `storm-structure`, `storm-specify` (CP-6 cross-check w/ time-anchored queries) | Fallback when Context7 ambiguous |
| **Playwright OR Chrome MCP OR browser-use** | `storm-review` (Layer 1 = User-Reality Crawl via independent blind sub-agent; Layer 5 visual regression) | Browser automation for 8-layer REVIEW — NOT gstack `/browse` (that is ad-hoc browsing, not E2E test automation) |
| **axe-core** (CLI / scripted) | `storm-review` Layer 4 | Accessibility audit |
| **`/frontend-design`** (official Claude Code marketplace plugin — `claude-plugins-official/frontend-design`, D4 baseline) | `storm-specify` Step 5.5 (3 mockup variants) | Production-grade mockup gen, no generic AI aesthetics |

**Fallback if `/frontend-design` not installed:** `/design-shotgun` (gstack) OR direct Claude Code HTML render. The variant count is what matters, not the specific generator.

**Opt-in tier (enhances but not required):**

| Tool | Used by | Purpose |
|---|---|---|
| `/codex review` (gstack) | REVIEW Layer 8 (parallel w/ opus auditor) | Second-opinion code audit |
| `/qa` (gstack) | Post-SHIP cutover | Production QA loop |
| `/canary` (gstack) | Post-deploy monitoring | Staged rollout watch |
| `/cso` (gstack) | `storm-ship` security audit | OWASP + STRIDE deeper pass |
| `/investigate` (gstack) | Anti-stuck protocol | Root-cause debugging |
| `/learn` (gstack) | Cross-project | Pattern memory |

Project may run without opt-in tier — STORM commands work standalone with baseline tier only.

### 8.7 B2.1 Forked Sub-Agent Dispatch Architecture

The architecture every orchestrator command (`storm-capture`, `storm-structure`, `storm-specify`, `storm-build`, `storm-review`, `storm-ship`) MUST follow when delegating heavy compute. Introduced post-test-7 to solve tier-purity, trailer-discipline, and granularity-collapse failures simultaneously.

**Additional use-case — Session-exit handoff synthesis (v1.4.x, #FF-024):** `/storm-end-session` dispatches a **fresh sonnet sub-agent** to write the Layer 5 handoff entry. The sub-agent reconstructs the entry from **ground truth (git log + plan markers + CLAUDE.md), NOT conversation memory** — this is the whole point of forking it fresh (no inherited chat drift). Same contract applies: upstream-read gate, no exit markers, mandatory trailers. Timeout fallback per §8.7.7 is MANDATORY here — if the sub-agent stalls, the orchestrator writes a minimal `[unverified]` handoff entry directly so a handoff always exists.

#### 8.7.1 Dispatch Pattern

```
Orchestrator (main session, conversational tier)
   ├── interview / approval gates / demo / deploy narration ← STAYS in orchestrator
   └── Agent tool dispatch
         └── Sub-agent (forked, declared model: tier)
               ├── reads _briefing.md (scoped context, see 8.7.3)
               ├── reads upstream artifacts cited in briefing
               ├── drafts artifact / writes code / runs audit
               └── git commit (atomic, with own tier's Model:/Felt: trailer)
```

**What MUST be dispatched (sub-agent):**
- Artifact drafting (vision.md, modules.md, tech-choices.md, etc.)
- Code writing (per-task BUILD work)
- Audit generation (cross-file consistency, security review)
- Deep tradeoff analysis (tech verification gate)

**What STAYS in orchestrator (main session):**
- User-facing conversational turns (interview, options-passes, approval gates)
- Demo + feedback collection (REVIEW)
- Deploy narration + smoke-test handoff (SHIP)
- Cascade plan composition (after sub-agent returns)

#### 8.7.2 Sub-Agent Contract

Every sub-agent dispatch MUST satisfy:

1. **Declared model tier** in the Agent tool invocation. The tier is per-task, NOT inherited from parent session default. Picking tier per §1.1.1 table + per-concern override (#FF-003).
2. **Single responsibility.** One sub-agent = one artifact OR one task OR one audit. Multi-purpose sub-agents = orchestrator laziness; dispatch separately.
3. **Atomic commit per output.** Sub-agent commits its own artifact with full STORM message (phase / module / milestone / task) + `Model:` + `Felt:` trailers reflecting its OWN tier (not orchestrator's default).
4. **No exit markers (#FF-009b).** Sub-agent MUST NOT inject sentinels like `<END_OF_TASK>`, `===DONE===`, `task complete.`, or similar string markers in its final message. Orchestrator detects completion by Agent-tool return, not by parsing strings. Exit markers caused parsing bugs and false completions in test-7-era flows.
5. **Decision discipline (L2-05).** Sub-agent decides WITHIN its scope (which library imports to use, which test framework idiom, which lint rule to follow). Sub-agent escalates UPWARD to orchestrator when: (a) decision affects another module/concern, (b) business decision needs human, (c) ambiguous scope. Orchestrator decides whether to ask user or absorb.
6. **CP-13 audit on sub-agent output (v1.4.2 fix #4 — closes pre-test-8 audit hole).** Before committing its artifact, sub-agent MUST run a CP-13 7-dim audit on its own output (YAGNI / over-eng / broken others / new gaps / inconsistency / contradiction / friction). Audit output goes in the commit body (NOT a separate file — keeps sub-agent commit atomic). **HARD: the audit MUST NOT be written into the deliverable artifact file itself (the concern `.md`) — commit body ONLY (hardened per #FF-027, 2026-06-02).** Embedding the 7-dim block inside `01-data-model.md`/`02-flows.md`/`03-rules.md`/`04-ui.md` was observed inflating moscow SPECIFY files by 50–130 lines each — the deliverable carries spec content for the builder; the audit is build-time process metadata and belongs in the commit history. Format:
   ```
   storm:<PHASE>:<module>::<artifact> - <subject>

   <body — what was produced, scope decisions, escalations>

   [CP-13 audit — sub-agent output]
   Strongest concern: [DIM] — [concrete reasoning OR "none — verified against <artifacts>"]
   Other 6 dims: clean (verified against <briefing.md / upstream files / specify/data-model>) | ⚠️ <DIM> — <reason> if any
   Verdict: PROCEED | PROCEED-WITH-CAVEAT | DO-NOT-PROCEED-AS-IS

   Model: <tier>
   Felt: <ok|long|snappy>
   ```
   If verdict = `DO-NOT-PROCEED-AS-IS`: sub-agent does NOT commit. Returns to orchestrator with failed-dim + alternative proposal. Orchestrator decides: re-dispatch with adjusted briefing, escalate to user, or accept-with-caveat.
7. **Orchestrator meta-audit on aggregated cascade (v1.4.2 fix #4).** When orchestrator collects ≥2 sub-agent outputs to compose a multi-author cascade (per §4.3.1) or to surface combined results to user, orchestrator runs ONE additional CP-13 audit on the aggregated whole (not on each sub-agent output individually — those audits already happened). Meta-audit checks: cross-sub-agent consistency, cumulative cascade-impact, whether combined output still satisfies orchestrator's original intent. Same compact format, surfaced in orchestrator's next turn to user.
8. **Manifest-only return (CP-14 — context economy).** A sub-agent returns ONLY a manifest to the orchestrator: artifact path(s), commit hash, counts, verdict, and a ≤1-line gist. It MUST NOT return raw file contents, full DOM/page-text, screenshot bytes, or large pasted blobs into the orchestrator's context — those go to disk; the orchestrator reads them on demand only if needed. This is the general contract; REVIEW's evidence-to-disk + L1-crawl/L5 screenshot-loop (§3.5) are specific instances of it. Hoisted here (from REVIEW-only) so every dispatch honors it — a sub-agent that dumps its full artifact back into context defeats the context isolation that is the whole point of forking (§1.1.2).

**Why both audits fire (not just one):** sub-agent audit catches scope-local issues (this artifact's own YAGNI, consistency with its briefing). Orchestrator meta-audit catches scope-global issues (do 4 sub-agents' outputs contradict each other, does aggregated cascade exceed safe surface). Skipping sub-agent audit = half of v1.4.2 work bypasses gate (B2.1 dispatch architecture moves most heavy-compute into sub-agents). Skipping meta-audit = scope-global drift goes undetected.

**Briefing must mention CP-13:** orchestrator's `_briefing.md` (§8.7.3 below) MUST include a top-line reminder: *"CP-13 audit required before commit per §8.7.2 rule 6. See FRAMEWORK §4 CP-13 for 7-dim list + format."* This is how sub-agents (which receive briefing inline) know to honor CP-13 without orchestrator hand-holding.

#### 8.7.3 `_briefing.md` Contract (#FF-016)

Every dispatched sub-agent receives a `_briefing.md` written by the orchestrator. Lives next to the artifact the sub-agent will produce (e.g., `storm/specify/02-invoicing/_briefing.md` for a tech-verify sub-agent).

**Required fields:**

```markdown
---
storm-phase: specify
storm-canonical: false
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/03-modules.md
---
# Briefing: tech-verify sub-agent — module `invoicing`

## Objective
[One sentence: what artifact to produce and where.]

## Upstream context (MUST read)
- storm/structure/00-domain-lens.md — Domain Lens frame for this app
- storm/structure/03-modules.md — module list + boundaries
- storm/specify/02-invoicing/04-ui.md — UI/UX decisions that constrain tech

## Out-of-scope (do NOT touch)
- Other modules' specify/ folders
- BUILD-phase code

## Decisions delegated to you (sub-agent autonomy)
- Tech candidate verification (Context7 + WebFetch per CP-6)
- Profile-fit override application (per L2-12)

## Decisions to escalate (sub-agent → orchestrator)
- If verified candidates ALL fail profile-fit override → escalate w/ findings
- If module scope ambiguity surfaces → escalate
- If business-side tradeoff appears (cost, compliance) → escalate

## CP-13 audit (MANDATORY before commit)
Per §8.7.2 rule 6 + FRAMEWORK §4 CP-13. Run 7-dim audit on your output (YAGNI / over-eng / broken others / new gaps / inconsistency / contradiction / friction) BEFORE committing. Embed audit in commit body (see §8.7.2 rule 6 format) — **NEVER inside the deliverable `.md` file itself (#FF-027): the artifact carries spec content only; the audit goes in the commit message.** If verdict = `DO-NOT-PROCEED-AS-IS` → DO NOT commit; return to orchestrator with failed-dim + alternative. Anti-ritual: never 7 ✅ without artifact citations.

## Craft floor (MANDATORY for output-producing sub-agents — C3, §1.4)
If this sub-agent produces buildable output (code, UI, schema, etc.), the orchestrator MUST paste the **operative core** of `~/.claude/docs/storm/craft-floor.md` inline here — **conditional on output-type** (code agent → code floor; do not load the UI floor into a code agent — CP-14) — and cite the full standard by path. The craft floor is iron-law (always-high, no dial); the sub-agent self-checks against it (sieve 1) before returning, knowing the machine gate (sieve 3 = L7 static guards) + independent L8 reviewer (sieve 4) will verify, never trust, the self-report. Omit this field only for non-output sub-agents (audit, handoff, research).

## Output contract
- Artifact: storm/specify/02-invoicing/06-tech-choices.md
- Commit message: storm:SPECIFY:invoicing::tech-verify - [short]
  - Model: <your tier>
  - Felt: <ok|long|snappy>
```

**Why this contract is mandatory:** without `_briefing.md`, sub-agents read the entire repo via Read/Grep, blow their context window, mis-scope, and produce artifacts that drift from orchestrator intent (test-7 root cause for module-scope bias).

#### 8.7.4 Upstream-Read Gate (#FF-016)

Before sub-agent writes ANY output, it MUST Read the upstream files listed in `_briefing.md`'s `storm-depends-on`. If sub-agent skips this read and produces an artifact → that artifact is invalid (cannot honor the cascade DAG). Orchestrator MAY enforce by requiring sub-agent's first action to be a Read of all upstream paths.

#### 8.7.5 Cross-File Consistency Audit (#FF-007)

For multi-file outputs (e.g., SPECIFY phase produces 06 files per module), dispatch a separate audit sub-agent AFTER the drafting sub-agents return. Audit sub-agent reads all sibling files, produces `_audit.md` flagging:

- Cross-file naming inconsistencies (entity called `Customer` in 01-vision.md vs `Client` in 04-ui.md)
- Decisions referenced in one file but not locked in `_decisions.md`
- Upstream cites missing or stale

`_audit.md` is upstream for any fix-cascade (see §4.1). Orchestrator surfaces `_audit.md` findings to user as part of phase-exit approval.

#### 8.7.6 Turn-Budget Enforcement (#FF-013)

Orchestrator turn-budget ≤6 (§1.1.3) is a SUB-AGENT DISPATCH signal: if orchestrator finds itself on turn 5 still doing work that could be dispatched → dispatch immediately rather than push to turn 7+. Sub-agents do not count against the orchestrator's turn budget — they run in their own context.

#### 8.7.7 Timeout Fallback (#FF-008)

If a sub-agent fails to return within reasonable time (orchestrator's judgment, typically >10 min for opus drafting, >5 min for sonnet exec):

1. Orchestrator narrates the timeout to user (CP-4).
2. Offer: (a) wait longer, (b) re-dispatch with narrower briefing, (c) absorb the task into orchestrator at reduced tier with explicit downgrade announcement, (d) abort and park.
3. Default: option (b) — narrower briefing usually fixes context-bloat-induced stalls.

Do NOT silently absorb dispatched work into orchestrator on timeout (would poison tier measurement).

#### 8.7.8 Parallel Dispatch

When the orchestrator identifies ≥2 sub-tasks with no data dependency between them (e.g., REVIEW dispatches a security-audit sub-agent and a UX-audit sub-agent simultaneously, or SPECIFY dispatches per-module verification sub-agents), it MUST dispatch them in a single message with multiple Agent tool calls — not serially.

Serial dispatch of independent work = wasted wall-clock + violates §1.1.4 eliminate-loop discipline.

Result aggregation: orchestrator waits for all parallel sub-agents to return, then composes one consolidated cascade plan per §4.3.1.

#### 8.7.9 Result Aggregation

When all sub-agents return:

1. Orchestrator reads each sub-agent's output artifact (via Read, not via sub-agent's return message — message may be truncated).
2. Orchestrator merges into a single cascade plan covering all sub-agent outputs.
3. Orchestrator narrates to user: *"3 sub-agents returned. Drafted: [list]. Cascade plan: [diff summary]. Approve?"*
4. On approval → orchestrator commits the cascade as ONE atomic commit, referencing the sub-agent commit hashes in the body.

#### 8.7.10 No Silent Upshift

If the orchestrator or a sub-agent perceives that the declared tier is inadequate (e.g., sonnet sub-agent finds the task needs opus-level reasoning):

- Sub-agent: MUST escalate to orchestrator, not self-upshift. Return early with *"this task needs opus tier, escalating."*
- Orchestrator: announces mismatch to user, asks before re-dispatching at higher tier.

Silent upshifts poison the measurement baseline (§1.1.5) and hide framework friction that should be logged to `framework-feedback.md`. Every tier deviation must leave an audible trace.

---

## 9. Scenario Walkthroughs

### 9.1 Scenario: Fresh Project Start → CAPTURE → STRUCTURE

```
Human: "Gw mau bikin CRM untuk sales team"

AI: "New project detected. Initializing STORM via /storm-init...
     - Created .claude/ structure
     - Created storm/ folder
     - CLAUDE.md initialized
     
     Input detection (Stage 1, W-G19): Raw conversational input → Stage 2A.
     
     Entering phase CAPTURE (human-led, Raw branch). 
     
     Pour your ideas into storm/capture/01-braindump.md or just tell me here — 
     what's this CRM for? What's the problem it solves? 
     (I'll structure later, just dump now.)"

[Human dumps ideas through several turns]

AI: [dispatches braindump sub-agent (sonnet) per §8.7]
    "Drafting storm/capture/01-braindump.md. Sub-agent reading conversation,
     extracting business intent. Back in a moment."

[Sub-agent commits: storm:CAPTURE:::braindump - log initial CRM concept
                    Model: sonnet  Felt: ok]

AI: [dispatches ideation-coverage sub-agent (sonnet)]
    "Coverage probe — checking 8 dimensions (users, flows, edge cases, 
     constraints, success metrics, failure modes, integrations, scale).
     3 gaps detected. Surfacing top 3-5 only (L1-08 bounded scope)."

[Q&A — 1 round, exits on "cukup, lanjut" or natural completion]

AI: [dispatches Domain Lens sub-agent (opus) — canonical cross-phase artifact]
    "Domain Lens inference. Writing storm/structure/00-domain-lens.md
     (L3-01 — canonical, referenced by all downstream phases)."

[Sub-agent commits: storm:CAPTURE:::domain-lens - infer B2B CRM Indonesian SME lens
                    Model: opus  Felt: ok]

AI: "CAPTURE exit criteria check (CP-11):
     ✅ 01-braindump.md non-empty
     ✅ 03-ideation-coverage.md gaps resolved
     ✅ 00-domain-lens.md drafted + validated
     
     Switching to STRUCTURE-lead (role-flip ceremony). You retain authority: 
     review, challenge, approve, or trigger loop-back.
     
     Domain Lens: B2B CRM for Indonesian SMEs, sales-team focused, Bahasa-first.
     (Explicit-from-you: 'CRM untuk sales team'. AI-synthesized: B2B context, 
      SME scale inferred from conversational cues.)
     
     Dispatching STRUCTURE sub-agents (opus) for vision, roles, modules, 
     deployment, design-system. Will surface each for approval."

[AI dispatches per-artifact sub-agents — parallel where independent]
[Human reviews each, approves with modifications]
[Each approval = 1 atomic commit with Model:/Felt: trailers]
[STRUCTURE exits when all required files approved per W-G24]
```

### 9.2 Scenario: Mid-BUILD Change of Mind

```
Context: Currently in BUILD phase, module `invoicing`, task 4 of 7.
Module spec: "Invoice generated after order confirmation."

Human (mid-task): "Eh, actually gw mau sekarang approval dulu sebelum 
                   invoice generate. Manager approve dulu baru invoice."

AI (pauses task, invokes storm-sync-cascade skill):
"Change of mind detected. Let me think through this before executing.

[Switching to business-analyst hat]

Current flow: Order confirmed → Invoice auto-generated
Proposed flow: Order confirmed → Manager approval → Invoice generated

Tradeoffs:
- Good: Adds governance layer, catches errors before invoicing
- Cost: Slower cycle time. Existing task 4 (auto-generation) becomes 
  obsolete; need new task for approval queue.
- Cascade: storm/specify/<NN>-invoicing/02-flows.md, storm/specify/<NN>-invoicing/01-data-model.md 
  (add approval state), storm/specify/<NN>-invoicing/04-ui.md (add approval UI), 
  storm/structure/03-modules.md (may need new 'approval' module if generalizable)

Encouraging you to stay with this — it's a meaningful business 
refinement, not scope creep. Worth doing now vs patching later.

Propagation plan:
1. Update storm/specify/<NN>-invoicing/02-flows.md with new flow
2. Update storm/specify/<NN>-invoicing/01-data-model.md with approval_status field
3. Revise 04-ui.md to interpret approval UX
4. Revert current task 4 (obsolete); add task 4a (approval queue)
5. Module dependency: does 'invoicing' now depend on 'user-roles' 
   for manager role? Yes — update storm/structure/05-dependency-map.md

Confirm? (yes / adjust / discuss more)"

Human: "OK gass approved"

AI: [orchestrator dispatches cascade sub-agents per §4.3.1 multi-author cascade]
    "Dispatching 4 sub-agents in parallel (independent file regions):
     - sub-agent A (opus): update 02-flows.md with approval state machine
     - sub-agent B (opus): update 01-data-model.md (add approval_status field)
     - sub-agent C (opus): rewrite 04-ui.md UX Interpretation block (L3-03)
     - sub-agent D (sonnet): update 05-dependency-map.md (invoicing→user-roles)
     
     Each commits separately. Orchestrator composes final SYNC cascade commit
     referencing them."

[Sub-agents commit individually with their own Model:/Felt: trailers]

AI: [orchestrator commits cascade summary atomically]
    storm:SYNC:invoicing:cascade - add manager approval before invoice generation
    
    Composes 4 sub-agent commits (a1b2c3d, e4f5g6h, i7j8k9l, m0n1o2p).
    Reverts current task 4; adds task 4a (approval queue).
    
    Model: opus  Felt: ok

AI (CP-10 escalation, stall risk medium per change-of-mind signal):
    "Done. 4 docs updated atomically (cascade complete). Task 4 reverted,
     task 4a queued. Resuming BUILD at task 4a now.
     
     Want to see the updated invoice flow diagram before I continue?"

Human stays in flow. Abandonment risk avoided via:
- CP-1 counselor pattern (reflect before execute)
- CP-3 proactive encouragement ("worth doing now vs patching later")
- CP-10 escalation (offer visual artifact when stall risk medium)
- §4.3.1 multi-author cascade (parallel sub-agents, atomic summary commit)
- Sync contract transparent cascade
```

### 9.3 Scenario: Post-SHIP Feature Addition

> **Worked example of the revolving door (#E6/M2).** The canonical lifecycle — re-entry delta-compute, CP-1-gated routing, Domain-Lens re-open gate, mini-CAPTURE, STRUCTURE-delta — is defined in **§3.1 CAPTURE** (revolving-door lifecycle) and **§3.2** (STRUCTURE-delta). This scenario shows that machinery in flow for a post-SHIP feature. Note: re-entry here is a **first-class move** (the same CAPTURE door); the parking-lot ticket below is the *park-for-later* triage option (CP-8), not a required gateway to re-enter.

```
Context: CRM shipped 3 weeks ago. Live in production. User messages:

Human: "Eh gw kepikiran, customer kita butuh fitur reminder otomatis 
        kalau invoice overdue. Bisa ditambahin?"

AI: [storm-phase-guard detects out-of-lifecycle request]
    "New scope request detected post-SHIP. Auto-parking first (CP-8) —
     no interruption to live production. Then triage.

     Created ticket #007 in storm/meta/parking-lot.md:
     - Title: Automatic overdue invoice reminders
     - Classification: Feature addition (post-launch)
     - Module tag: invoicing-adjacent (L2-08)

     Triage options (CP-1 counselor, max 3 per anti-fatigue):
     (a) Integrate now → re-enter lifecycle for this scope:
         CAPTURE-mini → STRUCTURE delta (storm/structure/03-modules.md adds
         'reminders' OR extends 'invoicing') → SPECIFY → BUILD → REVIEW →
         incremental SHIP
     (b) Schedule for next iteration window
     (c) Keep parked — revisit at next triage ritual (CP-8 hybrid: 10+
         tickets OR next phase boundary)

     Recommendation: (a) Integrate now, as extension module 'reminders'.
     Light scope. ~2 weeks work.

     Which?"

Human: "OK (a), gass"

AI: "Entering mini-CAPTURE for scope 'reminders'. 
     Questions:
     - Trigger: how many days overdue before reminder?
     - Channel: email? WhatsApp? both?
     - Escalation: one reminder or repeating?
     - Who is reminder for: customer, or sales rep, or both?"

[CAPTURE-mini sub-agent (sonnet) dispatched — bounded scope, 1 round Q&A]
[storm:CAPTURE:reminders::scope - capture overdue reminder requirements
                                  Model: sonnet  Felt: ok]

[STRUCTURE delta sub-agent (opus) — module-delta only, not full re-draft]
[Adds 'reminders' to storm/structure/03-modules.md; updates 05-dependency-map.md]
[storm:STRUCTURE:reminders::module-delta - add reminders module
                                            Model: opus  Felt: ok]

[SPECIFY 'reminders' module — 6 concerns drafted per-concern sub-agents]
[BUILD tasks dispatched serially via /storm-build forked sub-agents]
[REVIEW 8-layer auto-verification per L3-02 — PASS]
[SHIP: incremental deploy via /storm-ship, smoke-test plan scaffolded for human]
```

### 9.4 Scenario: Pre-Structured PRD Entry (CAPTURE Mode A/B/C/D, L1-06)

```
Human: [pastes 4-page PRD into chat]
       "Ini PRD dari product team gw. Mau bikin produknya. Gimana mulainya?"

AI: [/storm-capture invoked, Stage 1 input detection per W-G19]
    "Pre-structured PRD detected (pasted artifact > N words, section headers,
     explicit requirements). Branching to Stage 2B (PRD mode).

     4 modes available (L1-06):
     (A) FULL REVIEW — critical-reviewer hat (CP-2). Adversarial audit:
         assumption-unpack, gap-hunt, premise challenge, scope-creep flag.
         30-60 min. Recommended if PRD not pressure-tested yet.
     (B) GAP-ONLY — surface 3-5 blocking gaps (missing roles, undefined
         flows, vague metrics). 10-15 min.
     (C) DISCUSS — section-by-section walkthrough. Turn-budget <=6 per L1-08.
     (D) SKIP — PRD locked by stakeholders, absorb verbatim. Straight to
         STRUCTURE. 2 min.

     Which? (recommendation: A if first read, B if iterating, D if locked)"
H: "A — gw belum review sendiri."

AI: [dispatches PRD-review sub-agent (sonnet, critical-reviewer hat) per §8.7]
    "Switching to critical-reviewer hat (CP-2). Sub-agent will:
     - Unpack assumptions (premise-first per counselor pattern)
     - Hunt for unstated user roles, ambiguous flows, vague success metrics
     - Flag scope-creep candidates
     - Distinguish business-decision gaps (need you) vs technical-detail
       gaps (AI fills autonomously per CP-7)

     Bounded scope per L1-08: max 3-5 gaps surfaced per round, default
     single round. Output to storm/capture/04-prd-review.md (L1-07)."

[Sub-agent commits: storm:CAPTURE:::prd-review - audit PRD (mode A, 4 gaps)
                    Model: sonnet  Felt: ok]

AI: "PRD reviewed. 4 gaps surfaced in storm/capture/04-prd-review.md:
     1. User role 'finance reviewer' mentioned in §3 but no permissions defined
     2. Flow 'invoice approval' has no rejection path
     3. Success metric 'fast invoicing' undefined (target time? %?)
     4. Multi-currency mentioned in §5 but not in data model

     Gaps 1-2 are business decisions (need you). Gap 3 needs your target.
     Gap 4 I can resolve technically — proposing decimal(19,4) + ISO 4217
     currency code FK if you confirm multi-currency is in scope.

     Resolve gaps inline, or proceed to STRUCTURE with these as known-deferrals?"

H: "Resolve dulu. Finance reviewer cuma view + approve, gak edit. 
       Rejection path: balik ke creator dengan note. Fast invoicing = 
       < 2 menit dari draft ke send. Multi-currency yes, support IDR+USD."

AI: [Domain Lens sub-agent (opus) dispatched]
    "Updating 04-prd-review.md with resolutions. Drafting
     00-domain-lens.md from resolved PRD (canonical cross-phase)."

[CAPTURE exits when 04-prd-review.md gaps resolved + 00-domain-lens.md validated]
[Role-flip to STRUCTURE]
```

---

### 9.5 Scenario: Drift Detection at Session Start (L2-14, 3-option resolution)

```
Context: Project paused 3 weeks. User edited storm/structure/03-modules.md
manually between sessions (added 'audit-log' module, removed 'notifications').
Did NOT cascade downstream.
H: "Lanjutin project yang kemarin."

AI: [Session Start Protocol fires, recovery cross-check 5 Layers + Foundation]
    "Session recovery — reading CLAUDE.md, scanning git log -20, checking
     plan files for [IN PROGRESS], cross-checking artifact mtimes vs commits.

     Drift detected (Layer 4 self-healing per W-G48):
     - storm/structure/03-modules.md modified 2026-05-21 14:22 (no commit)
     - Last commit referencing 03-modules.md: 2026-05-15 (3-week gap)
     - Delta: +1 module 'audit-log', -1 module 'notifications'
     - Downstream NOT updated: 05-dependency-map.md, 02-flows.md (still
       references 'notifications'), specify/<NN>-notifications/ still exists

     3-option resolution (L2-14):

     (1) BACKPORT — accept user edit as authoritative, cascade through
         downstream. Sub-agent dispatched: update 05-dependency-map.md,
         02-flows.md, archive specify/<NN>-notifications/ to /attic/.
         ~5 min. Recommended if edit was intentional + you remember why.

     (2) RECONCILE — discuss. I show you the 3-week diff, you explain
         intent, we decide together which downstream files to update vs
         revert. Slower (~15 min) but safer if edit was exploratory.

     (3) FREEZE — revert your manual edit, keep prior state. Use if
         edit was accidental or you've changed your mind since.

     Default if no answer in 3 turns: (2) RECONCILE — safest middle path.

     Which?"

H: "(1) backport, audit-log emang gw mau ganti notifications"

AI: [orchestrator dispatches 3 parallel sub-agents per §4.3.1]
    "Backporting. Sub-agents (opus): 
     - A: update 05-dependency-map.md
     - B: update 02-flows.md  
     - C: archive specify/<NN>-notifications/ → /attic/, scaffold 
          specify/<NN>-audit-log/ stub

     Each commits separately, orchestrator composes SYNC summary."

[3 sub-agent commits, then:]
[storm:SYNC:audit-log:backport - cascade manual structure edit
                                 Model: opus  Felt: ok]

AI (CP-10 small-win + CP-4 after-the-fact narration):
    "Done. 4 docs synced atomically. CLAUDE.md updated: active modules now
     include 'audit-log', 'notifications' archived. Ready to resume —
     where were we? (last commit suggests BUILD on module-2, task 7)."
```

---

### 9.6 Scenario: Visual Mockup 3-Variants at SPECIFY (L3-05)

```
Context: SPECIFY phase, module 'invoice-creation'. UX Interpretation 
block (L3-03) drafted in 04-ui.md. Time for mockups.

AI: "UX Interpretation locked (4-bullet format per L3-03):
     - Form-first layout: invoice fields above preview
     - Inline validation on amount/date (real-time, not on-blur)
     - Customer picker: typeahead + recent-5 quick list
     - Save-as-draft auto-fires every 10s (no explicit button)

     Now generating 3 mockup variants (L3-05 — eliminate REVIEW→SPECIFY
     loops per INV-01). Dispatching 3 parallel sub-agents to /frontend-design
     (each opus, baseline w/ fallback per D4):

     - mockup-v1.html: dense / utilitarian / spreadsheet-like
     - mockup-v2.html: friendly / cards / progressive disclosure
     - mockup-v3.html: modal-stepped / wizard-like / one-decision-per-screen

     ~3 min total (parallel). Will surface all 3 + ask you to pick."

[3 sub-agents dispatched in single batched tool-call per §1.1.3 parallel rule]
[Each commits to specify/<NN>-invoice-creation/04-ui/mockup-v[1-3].html]
[storm:SPECIFY:invoice-creation::mockup-v1 - dense variant
                                              Model: opus  Felt: ok]
[storm:SPECIFY:invoice-creation::mockup-v2 - friendly cards variant
                                              Model: opus  Felt: ok]
[storm:SPECIFY:invoice-creation::mockup-v3 - wizard variant
                                              Model: opus  Felt: ok]

AI: "3 mockups ready. Quick visual diff:
     - v1: 1 screen, all fields visible, ~40% density
     - v2: 1 screen, card grouping, ~25% density, more whitespace
     - v3: 4 screens, 1-3 fields each, walk-through

     Pick by name (v1/v2/v3), or 'mix' if you want me to combine elements.
     Picked variant becomes baseline (locked in _picked.md per L3-05) — 
     BUILD will diff against it (W-G30) to catch implementation drift."

H: "v2, tapi customer picker dari v1 (typeahead inline tanpa modal)"

AI: [updates specify/<NN>-invoice-creation/04-ui/_picked.md]
    "Picked: v2 base + v1 customer picker. Baseline locked. Rationale 
     captured (your words paraphrased: 'cards untuk readability, typeahead 
     biar gak ada modal-stack')."

[storm:SPECIFY:invoice-creation::mockup-picked - v2+v1picker baseline
                                                  Model: sonnet  Felt: snappy]

AI: "Baseline locked. BUILD will checkpoint vs this baseline (W-G30 
     diff-vs-baseline). Any drift > threshold = surface immediately, 
     don't wait for REVIEW."
```

---

**Key observation:** post-SHIP feature add uses the same 6-phase lifecycle, just scoped to the new work. No separate "maintenance" or "enhancement" phase needed. Framework is re-entrant.

---

## 10. Framework Feedback Mechanism

STORM is **field-validated through v1.3** (test-4/5/6/7 harness runs + dealflow Phase 1 real-user run); v1.4 is in active iteration on this project as source-of-truth refactor. The feedback mechanism remains permanent infrastructure — captures friction points as they occur so every future v1.x iteration is grounded in observed friction, not speculation. AI-maintained (CP-12 discipline).

### 10.1 File: `storm/meta/framework-feedback.md`

```markdown
# STORM Framework Feedback Log

AI-maintained record of friction, gaps, confusion, and improvement ideas 
encountered while using STORM v1. Reviewed at end of real-world test → 
feeds back to framework v1.x refinement.

## Active

### #F-001 — [Title]
- **Logged:** YYYY-MM-DD HH:MM
- **Context:** Phase X, activity Y
- **Description:** What happened, in user's or AI's words
- **Category:** framework-gap | workflow-bug | unclear-principle | 
              feature-request | terminology-confusion | tool-friction
- **Severity:** P0-blocker | P1-friction | P2-annoyance | P3-suggestion
- **Auto/Manual:** auto-detected | user-logged
- **Suggested change:** [if obvious, else leave blank]
- **Status:** open

## Resolved

### #F-NNN — [Title]
- (same fields)
- **Resolution:** addressed-in-v1.x | deferred (reason) | invalid 
- **Resolved:** YYYY-MM-DD
```

### 10.2 Triggers

**Manual trigger** — user says:
- `/storm-feedback "description"` — explicit command
- Natural phrases AI recognizes as feedback signals: *"gw bingung ini"*, *"kok STORM gak handle..."*, *"framework harusnya..."*

**Auto-detect via `storm-friction-detector` skill:**
- User asks same clarifying question 3+ times on same topic
- User circles back to same frustration pattern
- User explicitly says "I don't understand the framework here"
- AI detects principle ambiguity during decision-making
- AI detects workflow step with no clear next action

**AI behavior on detect:**
1. Surface gently: *"This looks like framework friction. Log it to `storm/meta/framework-feedback.md`?"*
2. If yes → auto-populate entry (context, description from pattern)
3. If no → do not log, but remember for pattern-matching future

### 10.3 Review Ritual

At **end of real-world test** (or major checkpoint):

1. AI loads `storm/meta/framework-feedback.md`
2. AI produces summary report:
   - Total entries by category
   - Severity distribution
   - Patterns (clusters of similar issues)
   - Proposed framework/workflow changes
3. Human reviews, decides which go into v1.x
4. AI executes updates to FRAMEWORK or WORKFLOW docs
5. Resolved entries moved to `## Resolved` section

### 10.4 Commands

| Command | Purpose |
|---------|---------|
| `/storm-feedback "desc"` | Log manual entry |
| `/storm-feedback-list` | Show open entries |
| `/storm-feedback-review` | Run review ritual (end of test) |
| `/storm-feedback-resolve [ID] [status]` | Move to resolved |

### 10.5 Scope Boundary

This mechanism is for **framework-level** friction only. Project-scope ideas go to regular **parking lot** (`storm/meta/parking-lot.md`). The two are parallel:

- `storm/meta/parking-lot.md` — *"What other features for the CRM?"*
- `storm/meta/framework-feedback.md` — *"What's unclear or friction about using STORM itself?"*

Don't mix.

---

## 11. Quick Reference Card

### Phase Flow
```
CAPTURE → STRUCTURE → SPECIFY → BUILD → REVIEW → SHIP
            (role-flip: human-led to AI-led at CAPTURE→STRUCTURE)
```

### Essential Commands (v1.4 W-G56 — full set, dash form only)

| Command | When to use |
|---------|-------------|
| `/storm-status` | "Where are we?" |
| `/storm-init` | Bootstrap a new STORM project |
| `/storm-capture` | Start or resume CAPTURE (Raw 2-mode OR PRD 4-mode entry) |
| `/storm-structure` | Enter STRUCTURE (9 files including 00-domain-lens) |
| `/storm-specify` | Enter SPECIFY for a module (concerns + mockup variants + audit) |
| `/storm-build` | Enter BUILD (task-by-task w/ diff-vs-baseline) |
| `/storm-review` | Enter REVIEW (8-layer auto-verification) |
| `/storm-ship` | Enter SHIP (security audit, smoke plan canonical, deploy) |
| `/storm-park "desc"` | Manual park (rarely needed — auto-park usual) |
| `/storm-park-review` | Triage pending tickets (auto-fires at ≥10 OR phase boundary) |
| `/storm-sync` | Force check for cascade opportunities |
| `/storm-rollback` | Undo last change |
| `/storm-recover` | Force recovery cross-check (incl. drift detection 3-option) |
| `/storm-feedback "desc"` | Log framework friction |
| `/storm-run-scenario` | Test harness — fork each phase to declared-model sub-agent |

### File Map

| Purpose | Location |
|---------|----------|
| Raw brain dump (or pasted PRD) | `storm/capture/01-braindump.md` |
| Coverage check | `storm/capture/03-ideation-coverage.md` |
| PRD review (conditional) | `storm/capture/04-prd-review.md` (v1.4) |
| Domain Lens | `storm/structure/00-domain-lens.md` (v1.4) |
| Project shape | `storm/structure/*.md` |
| Aesthetic direction | `storm/structure/08-design-system.md` |
| Hero mockup (visual anchor) | `storm/structure/09-hero-mockup.html` (v1.4.3) |
| Module briefing (orchestrator) | `storm/specify/<NN>-<slug>/_briefing.md` |
| Module sub-agent decisions log | `storm/specify/<NN>-<slug>/_decisions.md` (v1.4) |
| Module concerns | `storm/specify/<NN>-<slug>/01-data-model.md..06-tech-choices.md` |
| Module mockup variants | `storm/specify/<NN>-<slug>/04-ui/mockup-v[1-3].html` (v1.4) |
| Module picked variant | `storm/specify/<NN>-<slug>/04-ui/_picked.md` (v1.4) |
| Module consistency audit | `storm/specify/<NN>-<slug>/_audit.md` |
| Task execution | `storm/build/<NN>-<slug>/<NNN>-task-name/*.md` |
| REVIEW evidence (8-layer) | `storm/review/evidence/<slug>/` (v1.4 expanded) |
| Smoke-test plan | `storm/ship/03-smoke-test-plan.md` (v1.4) |
| Pop-up ideas | `storm/meta/parking-lot.md` |
| Framework friction | `storm/meta/framework-feedback.md` |
| Session continuity / handoff | `storm/meta/session-handoff.md` (v1.4.x, #FF-024) |
| Session verbal-decision outbox | `storm/meta/session-delta.md` (v1.4.x, #F-012) |
| Module deploy-status tracker | `storm/meta/module-status.md` (v1.4.x, #FF-023) |
| Recovery state | `CLAUDE.md` |
| STORM rules | `.claude/rules/storm-protocol.md` |

### AI Posture Checklist (v1.4 W-G58 — expanded)

- ✅ Hat-switch announced before domain-specific response (CP-2 — incl. critical-reviewer + dynamic justification)
- ✅ Phase narrated two-sided (before-the-fact + after-the-fact per CP-4 L2-13)
- ✅ Long-operation narration: emit intermediate progress signals when work >30s (CP-4)
- ✅ Auto-park out-of-scope ideas (no ask) + module: tag (CP-8 L2-08)
- ✅ Comprehension-check approval before cascade; multi-author cascades batched per §4.3.1
- ✅ Rollback available, git commit per cascade
- ✅ Session start → recovery cross-check + drift 3-option per W-G48
- ✅ Anti-abandonment scoped (friction points only); anti-stuck triggers announced (L2-02)
- ✅ Explicit stop honored without resistance
- ✅ Tech choices verified via live tools, not training data; **verification cite in same turn (CP-6 HARD GATE)**
- ✅ Business decisions proposed as options, human picks; **theater detection self-check (CP-7 HARD GATE)**
- ✅ Technical decisions made autonomously, documented in `_decisions.md` (L2-05)
- ✅ **Verify-before-flag (per #FF-001):** before claiming "missing/absent/gap", run targeted Read/Grep first
- ✅ **Verification phase ownership (per #FF-015):** REVIEW = AI 8-layer auto-verification (no PASS without evidence); SHIP smoke = human-led in deployed env w/ canonical `03-smoke-test-plan.md` BEFORE handoff
- ✅ **Every commit carries `Model:` + `Felt:` trailers (W-G47)** — extraction enables tier-purity + felt-speed analysis
- ✅ **No silent model upshift (§8.7.10)** — if perceived complexity exceeds declared tier, announce mismatch before re-dispatching
- ✅ **Schema migration classification BEFORE prod migrate (#FF-014)** — expand/contract/tighten/rename classified + ordering plan stated
- ✅ **Deployment topology cited from `07-deployment-target.md` upstream (W-G37)** — missing/TBD = SHIP BLOCKER, loop-back STRUCTURE

### Principle Quick Index

| # | Principle | One-liner |
|---|-----------|-----------|
| CP-1 | Counselor | Reflect → options → execute after pick |
| CP-2 | Hat-Switch | Dynamic expertise, announced |
| CP-3 | Anti-Abandonment | Scoped encouragement, honor stop |
| CP-4 | Transparent Nav | Informed, not dictated |
| CP-5 | Fragment-First | Small single-concern files |
| CP-6 | Tech Choice | Latest, active, merge-aware, verified |
| CP-7 | Decision Split | Technical=AI, Business=Human |
| CP-8 | Chaos Container | Auto-park, AI-enforced |
| CP-9 | Progressive Detail | Breadth first, depth JIT |
| CP-10 | Small Wins | Visible achievement at each unit |
| CP-11 | Verifiable Exit | Observable, finite criteria |
| CP-12 | Recovery | Multi-layer, AI-maintained |

---

*End of Part 2: Workflow.*

*Framework philosophy lives in `STORM-FRAMEWORK.md`. Executable artifacts (commands, skills, rules, templates) will be created in the next session as `.claude/` and `storm/` files.*
