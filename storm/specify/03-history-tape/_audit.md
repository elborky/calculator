---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: false
storm-depends-on:
  - storm/specify/03-history-tape/_index.md
  - storm/specify/03-history-tape/01-data-model.md
  - storm/specify/03-history-tape/02-flows.md
  - storm/specify/03-history-tape/03-rules.md
  - storm/specify/03-history-tape/04-ui.md
  - storm/specify/03-history-tape/04-ui/_picked.md
  - storm/specify/03-history-tape/05-edge-cases.md
  - storm/specify/03-history-tape/06-tech-choices.md
  - storm/specify/03-history-tape/07-acceptance.md
  - storm/specify/03-history-tape/_decisions.md
  - storm/specify/03-history-tape/_briefing.md
  - src/types.ts
  - src/ui/state.ts
---

# M3 History Tape — Cross-File Consistency Audit (opus)

> **VERDICT: PASS** (after 2 mechanical fixes applied in-audit; 0 FIX-REQUIRED left for the orchestrator).
>
> Ran by an opus cross-file auditor over the 11 M3 SPECIFY subject files + the live `src/` seam
> surfaces (`src/types.ts`, `src/ui/state.ts`, `src/engine.ts`, `index.html`). Two real divergences
> were found, both mechanically fixable, both fixed and committed atomically before this audit
> (`::fix-he-renumber`, `::fix-ui-supersession`). The remaining 6 audit dimensions passed clean against
> the artifacts. The module is internally consistent and the M2→M3 seam claims match the real source.
>
> **#FF-009b:** this audit does NOT fire the module APPROVED/exit marker — the orchestrator fires
> APPROVED after reading this PASS.

---

## Verdict summary

| # | Check | Result |
|---|---|---|
| 1 | Type/shape consistency (`HistoryEntry {expression, result, id}`) | **PASS** |
| 2 | Seam reality check (dispatch / EngineState / getDisplayValue / INT-M3-1 fields) | **PASS** |
| 3 | Visual-baseline coherence (single-line `_picked` vs two-line `04-ui` default) | **FIXED** (F-2) → PASS |
| 4 | Rule/flow/edge ID integrity (HR / flow / HE monotonic-unique) | **FIXED** (F-1, HE collision) → PASS |
| 5 | Decisions coverage (D-M3-* all in `_decisions.md`) | **PASS** |
| 6 | Acceptance coverage-gate (role×flow → user-story + observable AC) | **PASS** |
| 7 | Granularity spot-check (`_index` task list) | **PASS** |
| 8 | Diagram well-formedness (Mermaid erDiagram) | **PASS** |

**2 findings, both fixed mechanically in-audit. 0 FIX-REQUIRED escalated to the orchestrator.**

---

## Findings

### F-1 — HE-018 / HE-018b ID collision (MEDIUM) — **FIXED mechanically**

- **Files:** `05-edge-cases.md`, `07-acceptance.md`.
- **What diverged:** the HE series was **not strictly monotonic-unique**. `05-edge-cases.md §5`
  (Glyph & numeric faithfulness) defined a row **HE-018b** ("decimal result renders faithfully"),
  jumping `HE-017 → HE-018b` with no plain HE-018 in §5; meanwhile `§6` defines the distinct row
  **HE-018** ("AC clears the tape"). Two different scenarios shared root number 18 — the exact
  collision flagged during drafting. Cross-references to `HE-018b` lived in `07-acceptance.md`
  (US-M3-1 covers-tag line 57, and the T6 assertion line 78).
- **Fix applied:** renumbered the decimal-faithfulness row **HE-018b → HE-029** (appended at the end
  of the sequence — lowest-churn, since the HE-018..028 block in §6+ is heavily cross-referenced and
  is left byte-untouched). Updated all 3 live references (the §5 row definition + both `07-acceptance`
  sites). Updated the §5 coverage note to document the renumber and name HE-018's sole owner. Verified
  post-fix: zero live `HE-018b` remain (only the explanatory mention in the coverage note), HE-029
  present in all 4 expected places, the 7 plain-HE-018 references intact. Row count unchanged at 28.
- **Commit:** `storm:SPECIFY:history-tape::fix-he-renumber`.

### F-2 — `04-ui.md §2` still presented two-line as "resolved primary" after `_picked` locked single-line (MEDIUM) — **FIXED mechanically**

- **Files:** `04-ui.md` (§2 entry anatomy, §4 long-value rationale, §6 a11y "no-color-alone").
- **What diverged:** `04-ui/_picked.md` locked **v1 Conservative = single-line** entry
  (`12 + 3 = 15`, owner pick 2026-06-15), overriding `04-ui.md §2`'s "OQ-M3-2 resolved — primary
  layout: TWO lines per entry." `_index.md` (Group E, T-220, D-008) correctly specs single-line as the
  sole BUILD target, but `04-ui.md` itself still read its two-line default as *resolved/primary*, with
  no supersession note — an orphan two-line assumption in a BUILD-adjacent file. Two spots embedded a
  **load-bearing** two-line mechanic: §6's no-color-alone a11y floor ("`=` prefix **on the result
  line**") and §4's long-value rationale ("the two-line layout already gives each entry its own vertical
  room"). The `04-ui.md §2`-default was the *only* two-line holdout; all other BUILD-feeding files
  (`_index`, `05-edge-cases`, `07-acceptance`, `03-rules`) are layout-neutral (verified — they say
  "below/beside per `04-ui`", "hold for either layout", or defer to OQ-M3-2).
- **Fix applied (additive, non-destructive — the two-line rationale is retained as the
  explored-and-not-picked design record, matching the visual-validation trail):**
  (a) §2: prepended a ⚠️ **SUPERSEDED** banner naming `_picked.md` single-line as the BUILD target and
  demoting the two-line spec below to historical;
  (b) §6 a11y: rewrote the no-color-alone distinction from the two-line "`=` prefix on the result line"
  to the single-line " = separator" so the craft floor holds for the layout actually built;
  (c) §4: noted the wrap-never-clip floor holds under single-line (cell wrap + `_index` T-227
  right-anchored scroll), removing the hard two-line-room assumption.
  §9 mockup-brief prose left intact (it correctly records single-line vs two-line as the *variants
  explored*, not a build instruction).
- **Commit:** `storm:SPECIFY:history-tape::fix-ui-supersession`.

---

## Check-by-check evidence (the clean dimensions)

### Check 1 — Type/shape consistency — PASS
`HistoryEntry { expression: string; result: string; id: number }` is identical across
`01-data-model.md §1` (the canonical `interface`), `_index.md` T-201 (the BUILD task that creates it),
and the `erDiagram` (`01-data-model §6`). Field names match exactly. `06-tech-choices.md` names the seam
payload as `{expression, result}` (the `appendEntry` argument — `Omit<HistoryEntry,'id'>`) and
**explicitly defers `id` to `01-data-model`** (§3 line 209, §7 lines 294-298: "the mechanism is
shape-agnostic… `01-data-model` owns the `HistoryEntry` definition; the seam owns only the call site").
That is a clean ownership split, **not** a field-name conflict — `appendEntry` adding the `id` on insert
is exactly what `_index.md` T-203 specs. Consistent.

### Check 2 — Seam reality check (against live `src/`) — PASS
Verified the 06-tech-choices + _index seam claims against the actual source:
- **`dispatch()` signature** — `src/ui/state.ts:44-47` is `export function dispatch(fn: (s: EngineState)
  => EngineState): void { state = fn(state); render(state); }` — byte-identical to the snippet quoted in
  `06-tech-choices.md §1` (lines 52-57) and `_briefing.md` INT-M3-3. The proposed additive seam (capture
  `const prev = state` before the reassignment; notify `listeners` with `(prev, state)` AFTER
  `render(state)`) is accurate and additive; M2's render path is genuinely untouched. ✓
- **`EngineState` shape** — `src/types.ts:7-18` has exactly `{ entryBuffer, accumulator: Decimal|null,
  pendingOperator: Operator|null, justEvaluated: boolean, errorState: ErrorTag|null }`. ✓
- **INT-M3-1 predicate field names** — `prevState.pendingOperator` (line 13), `nextState.errorState`
  (line 17), `nextState.justEvaluated` (line 15) **all exist on `EngineState` with those exact names and
  types**. The predicate `prev.pendingOperator !== null && next.errorState === null &&
  next.justEvaluated === true` is type-valid against the real interface. ✓
- **`getDisplayValue`** — exists at `src/engine.ts:341`, returns `string | ErrorTag`. `_index.md §0`
  (line 40) and T-209 correctly source it from `engine.ts`; `src/ui/state.ts:20` explicitly notes
  getDisplayValue is NOT re-exported from `state.ts`, and T-209 imports it from `engine.ts` accordingly
  — consistent, no broken import claim. The `as string` cast (06-tech-choices §2) is sound because the
  predicate already gates `errorState === null`, making the `ErrorTag` branch unreachable at capture. ✓
- **`OPERATOR_TO_GLYPH`** — `src/ui/operator-map.ts` (F-M3-9), inherited; consistent across files. ✓
- **`.history-slot`** — `index.html:28` has `<div class="history-slot" aria-hidden="true"></div>`,
  matching F-M3-8 / T-217 / HR-020 (M3 removes `aria-hidden` on populate). ✓

No seam mismatch. The spec's seam is buildable against the real M2 source as written.

### Check 3 — Visual-baseline coherence — PASS (after F-2)
Post-fix, `04-ui.md §2` carries the supersession banner; the single-line v1 baseline is the unambiguous
BUILD target everywhere it matters (`_index` Group E / T-220, `_picked.md`). No remaining BUILD-feeding
file assumes two-line: `05-edge-cases.md` HE-003 says "Result on its own line below/beside per `04-ui`
layout" + line 174 "These rows hold for either layout"; `07-acceptance.md` asserts only
expression/result text + glyph + count (layout-agnostic); `03-rules.md` defers entry layout to OQ-M3-2 /
`04-ui` (ownership map line 202). The mockup file `04-ui/_picked.md` and `mockup-v1.html` are
single-line (verified: `<span class="entry__expr">…</span>` one-row markup, title "single-line tape").

### Check 4 — Rule/flow/edge ID integrity — PASS (after F-1)
- **HR-001..HR-023** — referenced consistently; max ID is HR-023, no gaps, no out-of-range reference. ✓
- **Flow IDs** — `02-flows.md` defines flows #1..#6; `07-acceptance.md` references exactly #1..#6 (one
  US-M3-N per flow). Match. ✓
- **HE numbering** — after F-1, the series is **strictly monotonic-unique**: HE-001..HE-028 + HE-029
  (the renumbered decimal row), with HE-018 owned solely by the §6 AC-clears row. No duplicate remains.

### Check 5 — Decisions coverage — PASS
All 6 concern-file autonomous decisions — D-M3-DM-01, D-M3-DM-02, D-M3-DM-03 (`01-data-model`),
D-M3-TC-01, D-M3-TC-02 (`06-tech-choices`), D-M3-EC-01 (`05-edge-cases`) — appear in `_decisions.md`
with matching ID, decision text, rationale, and authority. No orphan D-M3-* decision documented only
inside a concern file. (D-008 in `_index.md` is the global STORM decision-series "task-granularity
encoding" marker, not a D-M3-* concern decision; it is correctly logged in `_index`'s own "Decision
logged this pass" section, outside the D-M3-* scheme `_decisions.md` aggregates — not an orphan.)

### Check 6 — Acceptance coverage-gate — PASS
`02-user-roles.md` confirms exactly **one** product role (End-user anonymous; Builder/owner is a
no-in-app-surface meta-role). The grid is therefore 1 role × 6 flows. `07-acceptance.md` provides
US-M3-1..6 mapping one-to-one onto flows #1..#6, each with a `As an end-user…` user-story and ≥1
**observable** acceptance criterion (Playwright-style `toHaveCount`/`getByRole`/`toHaveText`, stored-state
emptiness reads, screenshot+contrast). US-M3-7 (motion) and US-M3-8 (a11y + no-truncation) cover the
cross-cutting craft floor. The §Coverage matrix is complete with no uncovered flow.

### Check 7 — Granularity spot-check — PASS
`_index.md` task list T-201..T-244 (44 tasks, 9 groups): each is ≤1 file / 1 logical unit with a
concrete **Done when**. No "and"-joined work tasks, no "implement whole X". The `state.ts` seam (Group
B) is correctly split per line of the `dispatch()` patch (T-206/207/208 independently checkable).
T-214's "bindings.ts / main.ts" is a location *alternative* (where the existing AC binding lives), not
an and-join of two work items. T-211 builds expression + result + the `appendEntry` call, but that is
one function body (one logical unit), acceptable.

### Check 8 — Diagram well-formedness — PASS
`01-data-model.md §6` has a Mermaid `erDiagram` with a single entity `HistoryEntry { string expression;
string result; int id }`. The flows/rules reference no other *persisted* entity (there are none — the
`tape` container is correctly noted as a comment, not over-modeled as a second entity for a plain array).
The diagram's three fields match the `interface` exactly. Well-formed, no dangling entity, no orphan
relationship.

---

## Auditor note (measurement integrity)

Per current session conditions, this audit ran on the **opus orchestrator tier**. If the
`#FF-037`/`#FF-008` credits-gate forced this opus dispatch inline (rather than as an independently-tiered
forked sub-agent), the orchestrator should stamp the audit commit's `Intended:` trailer accordingly so
`extract-metrics.sh` tallies it as `forced_inline` rather than a tier deviation. The two fix commits and
this audit commit all honestly read `Model: opus`.
