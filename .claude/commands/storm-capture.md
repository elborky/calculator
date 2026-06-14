---
description: Enter or resume the CAPTURE phase — 2-stage entry (Raw braindump OR PRD review w/ 4 modes); synthesis dispatched to sub-agents (sonnet for coverage/braindump/PRD-review, opus for Domain Lens)
model: sonnet
---

Enter or resume STORM CAPTURE phase.

**Tier discipline:** conversational interview/review runs in orchestrator (main session, light compute). Heavy artifact generation dispatched:
- **Sonnet** sub-agents: braindump logging, ideation-coverage synthesis, PRD-review drafting, projection regenerate (#E6/M1 — journal → projection).
- **Opus** sub-agent: Domain Lens inference (cross-phase canonical — frames every downstream phase).

**DISPATCH RULE (measurement integrity, per #FF-017):** every Agent tool dispatch from this command MUST:
1. Pass an explicit `model:` param matching the declared tier (`"sonnet"` for braindump/coverage/PRD-review; `"opus"` for Domain Lens). **NEVER omit** — silent inheritance from parent session corrupts the `Model:` trailer measurement signal.
2. Substitute every `{TIER}` placeholder in each prompt template with the same value passed to `model:`.
3. Sub-agent's commit trailer MUST be `Model: {TIER}` matching the dispatch. Orchestrator post-check rejects on mismatch.

## Execution (orchestrator)

1. **Invoke `storm-recovery`** to verify current state.
2. **Invoke `storm-phase-guard`** to check phase transition validity.

### Stage 0 — Re-entry detection (#E6/M2 — revolving door)

2a. **Detect re-entry vs first-entry.** Re-entry iff: `storm/capture/01-braindump.md` (journal) already has content AND a prior CAPTURE exit/commit exists (`git log` shows `storm:CAPTURE:::exit` or the journal has prior projection commits). First-entry → skip to Stage 1.

2b. **On re-entry — "lock-on-exit, free-on-entry."** Re-entry is a **first-class move** (same door, no ceremony beyond what follows). Run:
   - **Regenerate projection first** (Template E) so the delta is computed against a fresh `_index.md` (roadmap-ledger + line-anchor map are the delta substrate). Then let the user append new ideas to the journal (Raw or PRD branch as normal — Stage 1/2 still apply for the *new* material).
   - **Compute the delta** (orchestrator, light compute): diff the journal against the last projection commit → classify each item as **new** (since last exit) / **already built** (maps to a shipped/built module) / **still deferred** (named in a prior slice's deferred list). The roadmap-ledger is the source.
   - **Route the delta — CP-1-gated checkpoint (NOT auto).** For each new item, surface options (max 3 per CP-1 anti-fatigue): **(1) new module**, **(2) extend existing module `<slug>`**, **(3) conflict with built work — needs resolution**. Smooth intake, *gated* routing — never auto-route (stress-test #3: forced-auto just migrates the user's doubt to *"did it route me right?"*). User picks per item.
   - **Domain-Lens re-open gate (stress-test #5).** Before routing finalizes, re-read `storm/structure/00-domain-lens.md` and surface: *"Domain Lens still: [X]. New material suggests [drift / no drift]. Confirm or revise? (yes / adjust / discuss more)"* — a lifelong journal can drift the lens after modules were built under an older one. If revised → cascade downstream per L3-01 (re-draft lens + surface diff).
   - **Routing → STRUCTURE-delta.** Items routed to new/extend feed `§3.2 STRUCTURE-delta` (module-delta only, not full re-draft).

2c. **Exit on re-entry is still the lock.** The slice declaration + named-deferred-items gate (see `## Exit`) applies identically — **AI never auto-exits**, the human declares the slice.

### Stage 1 — Input Detection (W-G19)

3. **Inspect the input** the user provided OR points to (`storm/capture/01-braindump.md`, attached PRD, pasted spec, prior `briefing.md`):
   - **Raw signals:** chaotic head-dump, voice-memo transcript, scattered bullets, "let me just talk"
   - **PRD signals:** structural headings, deliberate sectioning (Problem/Solution/Users/Scope), goal-oriented phrasing, user explicitly says *"gw udah punya PRD / spec / doc"*
4. **Announce detection result + branch:**
   - Raw → *"Input detected: raw braindump. Entering Raw Branch (2 modes)."*
   - PRD → *"Input detected: pre-structured PRD. Switching to critical-reviewer hat. Entering PRD Branch (4 modes)."*
   - Ambiguous → ask: *"I see [signals]. Treat as raw braindump or pre-structured PRD?"*
4b. **Regenerate projection on entry (#E6/M1).** If `storm/capture/01-braindump.md` (the journal) already has content (resume case), dispatch sonnet sub-agent **Template E: Regenerate projection** to refresh `storm/capture/_index.md`. Skip on a fresh/empty journal (nothing to project yet). Narrate: *"Projection refreshed from journal."*

### Stage 2A — Raw Branch (2-mode A/B)

5. **Offer modes (Raw):**
   > *"Mode? (A) Passive listen — gw diem, lo dump bebas, bilang 'udah' pas selesai. (B) Interview — langsung Q&A conversational. Pilih A atau B?"*
   - **Mode A:** ≤1 line ack per user turn. No probes until user signals *"udah"*.
   - **Mode B:** one open probe per turn, conversational. Rotate 5 probes: **completeness / failure mode / stakeholders / constraints / emphasis**.
   - **Dump-done gate = user, always.** Do NOT transition to summary/probe without explicit user signal.
6. **During dump / interview** (orchestrator, light compute):
   - Append user content to working buffer (main session).
   - Log Q&A to `storm/capture/02-ai-questions.md` (main session writes).
   - Auto-park out-of-scope tangents via `storm-phase-guard` (CP-8).
7. **On "dump done" signal** → dispatch sonnet sub-agent **Template A: Log braindump**. Wait, verify commit. Narrate.
8. **Proceed to Common Step 10 (synthesis).**

### Stage 2B — PRD Branch (4-mode, L1-06)

5. **Offer modes (PRD):**
   > *"Mode? (a) FULL REVIEW — audit + challenge + gap-fill. (b) GAP-ONLY — list missing pieces, no challenge. (c) DISCUSS — open dialogue, 2nd opinion. (d) SKIP — accept PRD as-is, straight to STRUCTURE. Pilih a/b/c/d?"*

6. **Bounded scope rules (L1-08 — MUST honor):**
   - Modes (a) and (b): **max 3–5 gaps surfaced, prioritized by impact, single round default.**
   - Mode (c): conversational, user drives, exit on *"cukup, lanjut"*.
   - **Anti-stuck (CP-11):** if >2 rounds happen without lock, MUST announce per CP-11 narration:
     > *"Anti-stuck triggered: PRD review at round 3 without lock. Options: (a) freeze + proceed to STRUCTURE with known gaps as risks, (b) park PRD + restart CAPTURE raw. Pick."*
   - Mode (c) turn-budget: if conversation passes 6 turns without *"cukup, lanjut"* → surface budget overrun, propose proceed-or-extend.

7. **Execute mode:**
   - **(a) FULL REVIEW:** dispatch sonnet sub-agent **Template C: PRD review** with mode=`full`. Sub-agent audits PRD, challenges premise, surfaces top 3-5 gaps. Orchestrator surfaces gap list to user. User picks per-gap: address / defer-with-risk / cukup, lanjut.
   - **(b) GAP-ONLY:** dispatch Template C with mode=`gap-only`. Sub-agent lists top 3-5 gaps, no challenge. Orchestrator surfaces, user acknowledges.
   - **(c) DISCUSS:** orchestrator conversational mode, no fixed agenda, ≤6 turn budget. On *"cukup, lanjut"* → dispatch Template C with mode=`discuss` + conversation log.
   - **(d) SKIP:** ensure PRD is in `01-braindump.md` (copy if needed). Skip Template C entirely. Skip to Common Step 10.

8. **PRD content placement:** the PRD itself lives in `storm/capture/01-braindump.md` (copy from source if user pasted/attached). Supplementary Q&A from modes a/b/c → `02-ai-questions.md`.

9. **Verify Template C commit (if dispatched).** Narrate: *"PRD review logged."*

### Common — Synthesis + Domain Lens

10. **Dispatch sonnet sub-agent Template B: Synthesize ideation-coverage** from braindump + Q&A (+ prd-review if present). Wait, verify commit.

10b. **Exit gap-scan (cheap, inline) — feeds the slice gate.** The orchestrator runs a **light inline anchor-scan** of the journal it has already read: list any journal chunk (blank-line/heading-bounded block) with no obvious theme/anchor. This is the map-or-defer input the `## Exit` slice gate needs (tooth (a)). It is cheap (no sub-agent) and always runs. Do NOT dispatch the full Template E here — the durable projection regen is **gated** and happens at exit only if it will be read (see `## Exit` → *Projection regen-gate*). Narrate: *"Exit gap-scan: N unmapped ideas."*

11. **Dispatch opus sub-agent Template D: Draft Domain Lens** to `storm/structure/00-domain-lens.md` (canonical cross-phase artifact, W-G22). Wait, verify commit. Surface to user:
    > *"Domain Lens inferred: [X]. Evidence: [Y]. Implications for hat-switching: [Z]. Correct, or different framing? (yes / adjust / discuss more)"*

12. **Projection regen-gate (#E6/M4 — one-timer pays nothing).** After the slice is declared (`## Exit`), dispatch sonnet sub-agent **Template E: Regenerate projection** to materialize `storm/capture/_index.md` **iff** EITHER: this is a **re-entry** (a prior `storm:CAPTURE:::exit` commit exists), **OR** the declared slice **names ≥1 deferred item** (the roadmap-ledger must carry the deferral forward for the next re-entry's delta-compute). Otherwise — **first exit, one-timer, defer-none → SKIP**: the projection's only consumer is CAPTURE re-entry (verified — STRUCTURE reads `storm/structure/*.md`, not the capture projection), and it rebuilds free from the append-only journal on any future re-entry (Stage 0 step 2b). When dispatched: wait, verify commit, narrate *"Projection regenerated — themes + roadmap-ledger + line-anchor map + gap-check."* When skipped: narrate *"One-timer build-all — durable projection skipped (rebuilds free on re-entry)."*

13. **On Domain Lens confirm (regen-gate resolved)** → main session commits exit marker: `storm:CAPTURE:::exit - domain lens locked` with Model:/Felt: trailers.

## Sub-agent dispatch templates

### Template A: Log braindump (Raw branch)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017).
- `description`: `STORM CAPTURE log braindump`

```
You are a STORM CAPTURE sub-agent running on {TIER} tier. Write one artifact.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

TASK: Write storm/capture/01-braindump.md with the content below verbatim (preserve user's voice, mixed Bahasa/English as given).

BRAINDUMP CONTENT:
---
<paste full braindump from orchestrator buffer>
---

STEPS:
1. Create storm/capture/01-braindump.md with frontmatter: storm-phase: capture, storm-canonical: true, storm-depends-on: [].
2. Body = the braindump content above, formatted cleanly (preserve meaning, not exact whitespace).
3. Commit atomically:
   Subject: storm:CAPTURE:::braindump - log initial product concept
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE file. ONE commit. Trailers mandatory. NO user interaction.
- NO exit markers (no <END>, ===DONE===, etc.) — return naturally.

RETURN: file path, commit hash, 1-line summary.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template B: Synthesize ideation-coverage

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017).
- `description`: `STORM CAPTURE synthesize coverage`

```
You are a STORM CAPTURE sub-agent running on {TIER} tier. Synthesize coverage.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

TASK: Read storm/capture/01-braindump.md and storm/capture/02-ai-questions.md (and storm/capture/04-prd-review.md if it exists). Produce storm/capture/03-ideation-coverage.md.

COVERAGE MAP REQUIREMENTS:
- Frontmatter: storm-phase: capture, storm-canonical: true, storm-depends-on: [storm/capture/01-braindump.md, storm/capture/02-ai-questions.md, storm/capture/04-prd-review.md (if present)]
- Sections:
  - Entry mode (Raw A | Raw B | PRD a | PRD b | PRD c | PRD d)
  - Problem Frame (1-2 sentences)
  - Users / Roles (explicit-from-human vs AI-synthesized, marked)
  - Scope heard (bullet list of in-scope features)
  - Explicit "NOT in scope" (if any)
  - Open questions / ambiguities (carry over from prd-review if present)
- Keep it tight — 1 page readable.

STEPS:
1. Read inputs. Synthesize.
2. Write storm/capture/03-ideation-coverage.md.
3. Commit atomically:
   Subject: storm:CAPTURE:::coverage - draft ideation coverage map
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- NO exit markers. Return naturally.

RETURN: file path, commit hash, 1-line coverage gist.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template C: PRD review (PRD branch modes a/b/c)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017).
- `description`: `STORM CAPTURE PRD review (<mode>)`

```
You are a STORM CAPTURE sub-agent running on {TIER} tier in **critical-reviewer hat** (per CP-2 lexicon, L1-05).

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

MODE: <full | gap-only | discuss>
PRD PATH: storm/capture/01-braindump.md

TASK: Read the PRD. Produce storm/capture/04-prd-review.md per mode:

- mode=full: audit completeness, challenge premise, surface TOP 3-5 most-critical gaps (prioritized by impact, not exhaustive). For each gap: what's missing, why it matters, suggested resolution shape.
- mode=gap-only: list TOP 3-5 most-critical gaps. No premise challenge. Brief per gap: what's missing, why it matters.
- mode=discuss: capture the conversation log from orchestrator buffer (below). No new analysis; format as readable dialog.

CONVERSATION LOG (mode=discuss only):
---
<paste conversation from orchestrator buffer, or "n/a" for full/gap-only>
---

ARTIFACT REQUIREMENTS:
- Frontmatter: storm-phase: capture, storm-canonical: true, storm-depends-on: [storm/capture/01-braindump.md]
- Sections:
  - Entry mode: <full | gap-only | discuss>
  - Critical-reviewer findings (modes a/b) OR Conversation log (mode c)
  - (modes a/b) Per-gap: what's missing, why it matters, suggested resolution shape
  - (mode a only) Premise challenges: 1-3 challenges to the PRD's core assumptions
- Bounded: MAX 5 gaps. Single round.

STEPS:
1. Read PRD. Apply critical-reviewer hat (not helpful-collaborator default).
2. Produce storm/capture/04-prd-review.md per mode contract above.
3. Commit atomically:
   Subject: storm:CAPTURE:::prd-review - <mode> review of PRD
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- Stay bounded (max 5 gaps). No iterative deep-dive.
- NO exit markers. Return naturally.

RETURN: file path, commit hash, gap count, 1-line summary.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template D: Draft Domain Lens (canonical cross-phase, W-G22)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"opus"`. Never omit (#FF-017).
- `description`: `STORM CAPTURE draft Domain Lens (canonical)`

```
You are a STORM sub-agent running on {TIER} tier. Draft a canonical cross-phase artifact.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

TASK: Read storm/capture/01-braindump.md, storm/capture/03-ideation-coverage.md (and 02-ai-questions.md, 04-prd-review.md if they exist). Infer the Domain Lens that should frame every downstream phase.

ARTIFACT: storm/structure/00-domain-lens.md

This is a CANONICAL CROSS-PHASE artifact (lives in structure/ because it frames every downstream phase, but drafted at the CAPTURE→STRUCTURE seam per W-G22). Honor that scope.

FRONTMATTER:
  storm-phase: structure
  storm-canonical: true
  storm-depends-on:
    - storm/capture/01-braindump.md
    - storm/capture/03-ideation-coverage.md
    - storm/capture/02-ai-questions.md  (if exists)
    - storm/capture/04-prd-review.md  (if exists)

SECTIONS:
1. Inferred Domain Lens (one line, e.g., "B2B CRM for Indonesian SMEs" or "Solo indie self-host tool" or "Consumer-facing fintech with regulatory exposure")
2. Evidence (which lines in upstream artifacts triggered this framing — cite)
3. Explicit-from-human vs AI-synthesized (mark each evidence item)
4. Hat-switch implications (which domain-expert hats CP-2 will likely call on — e.g., compliance officer, B2B sales, accessibility specialist)
5. Re-validation triggers (per L3-01): re-check Domain Lens at (a) each SPECIFY entry, (b) REVIEW scope drift, (c) post-loop-back from CAPTURE

STEPS:
1. Read inputs (use Read tool — do NOT skip; per §8.7.4 upstream-read gate).
2. Synthesize Domain Lens with cited evidence.
3. Mark each evidence item explicit-from-human or AI-synthesized.
4. Write storm/structure/00-domain-lens.md.
5. Commit atomically:
   Subject: storm:CAPTURE:::domain-lens - draft canonical Domain Lens
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- Use Read tool on every upstream file BEFORE drafting (upstream-read gate, §8.7.4).
- Distinguish explicit-from-human vs AI-synthesized for every claim.
- NO exit markers. Return naturally.
- NO silent upshift / downshift — your dispatched tier is {TIER} (per Agent-tool `model:` param), trailer MUST say {TIER}.

RETURN: file path, commit hash, inferred Domain Lens (one line), 3 most-load-bearing evidence cites.
```

### Template E: Regenerate projection (#E6/M1 — journal → projection)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017). Mechanical synthesis from the journal.
- `description`: `STORM CAPTURE regenerate projection`

```
You are a STORM CAPTURE sub-agent running on {TIER} tier. Regenerate the projection (Layer 2)
from the journal (Layer 1). ONE-WAY ARROW: read the journal, write the projection — NEVER edit the journal.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

INPUT (Layer 1 — journal, append-only, read-only here): storm/capture/01-braindump.md
OUTPUT (Layer 2 — projection, regenerated, never hand-edited): storm/capture/_index.md

TASK: Read the journal. Regenerate the projection with these 4 parts:
1. **Line-anchor map** — for each distinct idea/theme, cite its journal line range (e.g. "idea X — lines 40-92"). This is the navigable index INTO the journal.
2. **Themes** — the recurring topics/threads, each 1 line.
3. **Roadmap-ledger** — status per idea (e.g. captured / in-scope / parked / open-question). Ride the existing braindump→ROADMAP→status pattern; do NOT invent new status machinery.
4. **Gap-check (mechanical anchor-coverage, #E6/M3)** — a DETERMINISTIC coverage check, NOT a judgment call. A journal **chunk** = a contiguous block bounded by a blank line or a heading (the journal's natural paragraph/section unit — reproducible across runs; this is what makes the check deterministic, NOT an AI judgment of where an "idea" begins). For every such chunk, verify it is anchored in ≥1 place in parts 1–3 above (line-anchor map / themes / roadmap-ledger). LIST the journal chunks (with line ranges) that have NO anchor — those are the gaps. Do NOT rank, tier, or judge whether an idea "matters" (subjective = noise). An unanchored chunk = a gap, full stop. If every chunk is anchored, write "> No gaps — every journal chunk is anchored in the projection." This list is consumed at CAPTURE exit to feed the map-or-defer gate (tooth (a)). Reliability rides part-1's anchor quality — a sloppy map weakens coverage; the antidote is full regeneration from the journal (see strategy below).

REGENERATE STRATEGY (hybrid): if a prior _index.md exists, update incrementally against new journal content (cheap, rides git delta); periodically a full rebuild is fine. The one-way arrow makes any drift recoverable by full regeneration from the journal — so when in doubt, rebuild fresh.

FRONTMATTER:
  storm-phase: capture
  storm-canonical: true
  storm-depends-on:
    - storm/capture/01-braindump.md

STEPS:
1. Read storm/capture/01-braindump.md (Read tool — do NOT skip; §8.7.4 upstream-read gate).
2. Regenerate storm/capture/_index.md with the 4 parts above.
3. Commit atomically:
   Subject: storm:CAPTURE:::projection - regenerate capture projection from journal
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- NEVER write to storm/capture/01-braindump.md (the journal is append-only, owned by the user).
- The projection is fully regenerated — do NOT preserve hand-edits (there should be none).
- Part 4 is mechanical anchor-coverage ONLY — list unanchored journal chunks (chunk = blank-line/heading-bounded block, per part-4 definition); NEVER judge whether an idea matters (that subjectivity is the cry-wolf noise the design forbids). No tiers, no weighting (start-thin, #E6/M3).
- NO exit markers. Return naturally.

RETURN: file path, commit hash, idea/theme count, 1-line projection gist.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

## Domain Lens declaration

After Template D returns, orchestrator surfaces to user:
> *"Domain Lens inferred: [X]. Evidence: [Y]. Hat-switch implications: [Z]. Correct, or different framing? (yes / adjust / discuss more)"*

User confirms → exit marker fires. User adjusts → re-dispatch Template D with adjusted framing as additional context.

## Exit

| Entry mode | Required artifacts |
|---|---|
| Raw A / Raw B | `01-braindump.md` (journal) + `_index.md` (projection — gated, see *Projection regen-gate*) + `02-ai-questions.md` + `03-ideation-coverage.md` + `00-domain-lens.md` |
| PRD (a/b/c) | `01-braindump.md` (PRD/journal) + `_index.md` (projection — gated, see *Projection regen-gate*) + `02-ai-questions.md` (if anything surfaced) + `04-prd-review.md` + `03-ideation-coverage.md` + `00-domain-lens.md` |
| PRD (d SKIP) | `01-braindump.md` (PRD/journal) + `_index.md` (projection — gated, see *Projection regen-gate*) + `03-ideation-coverage.md` + `00-domain-lens.md` (no `04-prd-review.md`) |

**Exit = the re-openable lock (#E6/M2).** CAPTURE exits only when the **human declares a bounded slice** (*"build X; defer Y, Z to the journal"*) AND **names the deferred items** (anti-scope-creep tooth (a)). **AI NEVER auto-exits** — it may offer/draft the slice boundary, but the human declares it (auto-lock = CP-7 theater). Exiting is cheap *because* re-entry is first-class and free (Stage 0). Main session fires exit marker only after both the human slice-declaration AND Domain Lens user-confirmed. NEVER soften this lock into "always open."

**One-timer = degenerate path, zero overhead (#E6/M4).** A builder who just wants to *dump once → build it all → done* pays **nothing** for the revolving door — and this is now **literally true, not just conceptually**: the exit projection-regen is **gated** (step 12), so a first-pass build-all (defer-none) dispatches **zero** projection sub-agent and writes no `_index.md` (it rebuilds free from the append-only journal if a re-entry ever happens). There is **no "one-time vs gradual?" question** at any stage — Stage 1 stays simply *"tell me your ideas."* The one-timer is the degenerate case of the same lock: their declared slice = *"build all of it"*, named-deferred = none, the gap-check (cheap inline scan, step 10b) is trivially clean (everything maps into the slice). The delta-compute (Stage 0), roadmap-ledger stagnation pressure, durable-projection regen, and deferred-item ceremony **only engage when something is actually deferred or a real re-entry occurs** — invisible otherwise (default OFF, no flag).

**Gap-check feeds the slice gate (#E6/M3).** Step 10b's cheap inline anchor-scan lists any journal chunk (blank-line/heading-bounded block) with NO obvious theme/anchor. Before accepting the slice declaration, surface that list to the human so each unanchored idea is consciously **mapped** (it belongs in the slice / a theme) **or explicitly deferred** (named in the deferred list) — exactly the input tooth (a) needs. This is mechanical (deterministic anchor-coverage, not AI judging importance) and exit-only (not an always-on alarm), so it informs the gate without crying wolf. When the durable projection IS regenerated (regen-gate fires), its part-4 supersedes the inline scan with the same coverage logic. Empty list → narrate "no unmapped ideas" and proceed.

## Principles in play

- CP-1 counselor (4-mode offer; confirm Domain Lens interpretation before exit; bounded gaps prevent fatigue)
- CP-2 critical-reviewer hat for PRD branch (per L1-05 lexicon)
- CP-4 narration (orchestrator announces branch detection + each dispatch)
- CP-7 theater-detection (4 modes give user real authority — not "Postgres or MySQL" theater)
- CP-8 auto-park (during interview / review)
- CP-10 small wins (each sub-agent return = visible artifact)
- CP-11 verifiable exit + anti-stuck announcement (after 2 PRD review rounds)
- CP-12 recovery (atomic commits + mandatory trailers per sub-agent)
- Model tiering — sonnet for routine synthesis, opus for cross-phase Domain Lens
- §8.7 B2.1 dispatch architecture (sub-agent contract, upstream-read gate, no exit markers, no silent upshift)
