---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
  - storm/specify/03-history-tape/01-data-model.md
  - storm/specify/03-history-tape/02-flows.md
  - storm/specify/03-history-tape/03-rules.md
  - storm/specify/03-history-tape/04-ui.md
  - storm/specify/03-history-tape/04-ui/_picked.md
  - storm/specify/03-history-tape/05-edge-cases.md
  - storm/specify/03-history-tape/06-tech-choices.md
  - storm/specify/03-history-tape/07-acceptance.md
  - storm/specify/03-history-tape/_decisions.md
  - storm/specify/02-calculator-ui/_index.md
  - src/ui/state.ts
---

# M3 History Tape — Module Index

> **Tiers used:** drafted by a sonnet sub-agent per `_briefing.md`. Collates the 8 M3 concern files
> + picked visual baseline into the authoritative BUILD task list. All names match the verified contracts
> (`_briefing.md` INT-M3-1..4, F-M3-1..10) and concern files exactly.

## What M3 is

M3 is the **in-session, in-memory record of completed calculations** — the second and final surface module.
It hooks the existing M2 `dispatch()` via a **post-dispatch subscriber list** (D-M3-TC-01, `06-tech-choices.md §1`): after every dispatch M3's `recordOnEquals(prev, next)` fires, evaluates the INT-M3-1 predicate, and — on a genuine pending-operator resolve — appends one `HistoryEntry` to a module-scoped array and re-renders the pre-reserved `.history-slot` DOM node (F-M3-8). **Visual baseline: v1 Conservative** — owner-picked 2026-06-15 (`04-ui/_picked.md`): **single-line entries** (`12 + 3 = 15`, compact rows, hairline dividers, recessed glass panel). M3 adds **zero new runtime dependencies** (D-M3-TC-02) and touches exactly one M2 file additively (`src/ui/state.ts`, ~12 LOC).

---

## §0 Inheritance — Shared-Thread (WORKFLOW §3.3)

M3 inherits these mechanisms from M2; they are not restated or modified here.

| Inherited | Stable home | What M3 does with it |
|---|---|---|
| `dispatch()` cell + `EngineState` shape | `src/ui/state.ts`, `src/types.ts` | Observes `(prev, next)` via the subscriber seam — does **not** modify M1/M2 logic |
| `getDisplayValue` | `src/engine.ts` | Reads `getDisplayValue(next)` as the `result` string at capture time (INT-M3-2) |
| `OPERATOR_TO_GLYPH` | `src/ui/operator-map.ts` | Inherited for expression rendering (F-M3-9); not redefined |
| Design tokens + glass recipe | `src/ui/styles/tokens.css`, `08-design-system.md §3/§5` | Tape CSS reads existing `var(--token)` custom properties; no new token pipeline |
| `.history-slot` DOM node | `index.html` (M2 T-175), `src/ui/styles/layout.css:97-100` | M3 populates it + removes `aria-hidden="true"` (F-M3-8) |

---

## Concern files

| File | Description |
|---|---|
| [`_briefing.md`](_briefing.md) | Orchestrator entry brief — canonical facts F-M3-1..10, INT-M3-1..4 (verified against `src/`), OQs, concern tier map. Read first. |
| [`01-data-model.md`](01-data-model.md) | `HistoryEntry` shape (`{expression, result, id}`), `tape[]` container (oldest-first append), derivation contract (INT-M3-2 formulas), lifecycle (append/clear/load), unbounded decision (D-M3-DM-01..03). |
| [`02-flows.md`](02-flows.md) | 6 M3 flows (record-on-equals, non-recording equals, chained calc, view/scroll, AC-clear, app-load). All flows but scroll are system-side; M3 adds no new user input. |
| [`03-rules.md`](03-rules.md) | 23 testable behaviour rules HR-001..HR-023: recording (§1), entry content (§2), ordering (§3), read-only (§4), persistence (§5), clear (§6), length (§7), accessibility + tokens (§8). |
| [`04-ui.md`](04-ui.md) | Build-ready panel spec: glass aside composition, per-state visual (empty/populated/scrolled/just-added), OQ-M3-2 entry-layout resolved (→ single-line overridden by `_picked.md`), OQ-M3-1 clear resolved (AC-only), OQ-M3-5 long-value resolved (wrap+scroll), a11y callouts, 3-variant mockup brief. |
| [`04-ui/_picked.md`](04-ui/_picked.md) | **LOCKED visual baseline: v1 Conservative** — single-line entry `12 + 3 = 15`, recessed panel, hairline dividers, no per-entry glow. Overrides `04-ui.md` two-line default for BUILD. |
| [`05-edge-cases.md`](05-edge-cases.md) | 28 HE rows: long entries (HE-001..004), recording predicate edge cases (HE-005..011), empty/clear (HE-012..013, HE-018..021), long-session scroll (HE-014..016), glyph faithfulness (HE-017..018b), motion (HE-022..023), responsive switch (HE-024..025), a11y (HE-026..028). D-M3-EC-01. |
| [`06-tech-choices.md`](06-tech-choices.md) | CP-6 head-to-head for INT-M3-3 seam: subscriber-list wins over pub/sub + equals-wrapper. Zero new dependency. Precise build-ready seam code (`subscribe`, `dispatch` patch, `recordOnEquals`). |
| [`07-acceptance.md`](07-acceptance.md) | 8 user stories US-M3-1..8: flow oracle (one per flow 1–6) + cross-cutting motion (US-M3-7) and a11y+no-truncation (US-M3-8). Observable Playwright-style assertions. |
| [`_decisions.md`](_decisions.md) | 6 AI-autonomous decisions: D-M3-DM-01..03 (data model), D-M3-TC-01..02 (seam + zero-dep), D-M3-EC-01 (long-entry wrap+scroll). |

---

## BUILD task list — M3 History Tape

> **Granularity discipline (HARD):** each task ≤ ~1.5 min of work, ≤ 1 file or 1 logical unit. No
> "and"-joined tasks. Each task carries a **Done when** check and traces to the contract IDs it satisfies.
>
> **Visual baseline:** `04-ui/_picked.md` v1 Conservative is the port target — **single-line** entry
> `12 + 3 = 15` (expression in `--text-secondary`, result in `--text-primary`, separated by ` = `),
> compact rows, hairline dividers, recessed glass. Two-line layout is explicitly NOT built.
>
> **Decision authority:** every task below is AI-autonomous (CP-7 technical). M3 does NOT add a second
> package; all source files land in the same Vite package (M2 D-002 one-pipeline).

---

### Group A — HistoryEntry type + tape module setup

| # | Task | Done when |
|---|---|---|
| T-201 | Create `src/ui/history/types.ts` — export `interface HistoryEntry { expression: string; result: string; id: number }` (D-M3-DM-02) | File exists; `tsc --noEmit` passes; the interface is exported. |
| T-202 | Create `src/ui/history/tape.ts` — declare module-private `let tape: HistoryEntry[] = []` and `let nextId = 0` (D-M3-DM-01) | File exists with two module-private `let`s; no export of raw tape. |
| T-203 | In `tape.ts`, export `appendEntry(entry: Omit<HistoryEntry, 'id'>): void` that pushes `{...entry, id: nextId++}` onto `tape` (→ D-M3-DM-01, D-M3-DM-02, `01-data-model §4`) | Calling `appendEntry({expression:'1+1', result:'2'})` pushes one entry with a stable `id`; `tsc` passes. |
| T-204 | In `tape.ts`, export `clearTape(): void` that sets `tape = []` (→ HR-016, `01-data-model §4 AC-row`) | After `clearTape()`, `getTape()` returns `[]`. |
| T-205 | In `tape.ts`, export `getTape(): readonly HistoryEntry[]` returning `tape` (read-only accessor for the render layer) | `getTape()` returns the current array; type prevents external mutation; `tsc` passes. |

---

### Group B — Recording seam in `state.ts` (INT-M3-3, D-M3-TC-01)

> Exactly one additive change to M2's `state.ts` (~12 LOC). M2 render path byte-for-byte unchanged (C3).

| # | Task | Done when |
|---|---|---|
| T-206 | In `src/ui/state.ts`, declare `type DispatchListener = (prev: EngineState, next: EngineState) => void` and a module-private `const listeners: DispatchListener[] = []` (D-M3-TC-01 seam) | Type and array present; `tsc` passes; no existing test breaks. |
| T-207 | In `src/ui/state.ts`, export `subscribe(fn: DispatchListener): void` that pushes `fn` onto `listeners` (`06-tech-choices §2`) | `subscribe` exported; calling it pushes onto the array. |
| T-208 | In `src/ui/state.ts`, patch `dispatch()`: add `const prev = state` before `state = fn(state)`; add `for (const l of listeners) l(prev, state)` **after** `render(state)` — render call unchanged (C3, `06-tech-choices §2`) | `render(state)` still fires first and identically; listener loop fires after; existing M2 tests/behavior unaffected; `tsc` passes. |

---

### Group C — `recordOnEquals` listener (INT-M3-1/2, `02-flows §1`)

| # | Task | Done when |
|---|---|---|
| T-209 | Create `src/ui/history/history.ts` — import `EngineState` from `state.ts`, `OPERATOR_TO_GLYPH` from `operator-map.ts`, `getDisplayValue` from `engine.ts`, `appendEntry` from `tape.ts` | File exists; all imports resolve; `tsc` passes. |
| T-210 | In `history.ts`, implement `recordOnEquals(prev: EngineState, next: EngineState): void` that evaluates INT-M3-1 (`prev.pendingOperator !== null && next.errorState === null && next.justEvaluated === true`) and returns without appending if false (→ HR-001, HE-005..008) | A call with a non-genuine-resolve `(prev, next)` pair does NOT call `appendEntry`. |
| T-211 | In `recordOnEquals`, on predicate-true: build `expression` as `` `${prev.accumulator!.toString()} ${OPERATOR_TO_GLYPH[prev.pendingOperator]} ${prev.entryBuffer}` `` and `result` as `getDisplayValue(next) as string`; call `appendEntry({expression, result})` (→ INT-M3-2, HR-007..009) | A genuine `(prev:{accumulator:12, pendingOperator:'add', entryBuffer:'3'}, next:{justEvaluated:true, errorState:null, …})` pair produces `expression='12 + 3'`, `result='15'`; `appendEntry` called once. |
| T-212 | Export `recordOnEquals` from `history.ts` so it can be registered in `main.ts` | `export function recordOnEquals` visible from outside the module; `tsc` passes. |

---

### Group D — Register listener + AC-clear wiring in `main.ts`

| # | Task | Done when |
|---|---|---|
| T-213 | In `src/ui/main.ts`, import `subscribe` from `state.ts` and `recordOnEquals` from `history/history.ts`; call `subscribe(recordOnEquals)` at mount (→ D-M3-TC-01, `02-flows §7`) | Registration call is present; `tsc` passes; no duplicate registration path. |
| T-214 | In the existing AC button-click binding (M2 `bindings.ts` / T-152) or `main.ts`, import `clearTape` from `tape.ts` and call `clearTape()` alongside `dispatch(inputAllClear)` (→ HR-016, flow #5) | Pressing AC both resets M2 engine state AND empties the tape; `clearTape` does not intercept `dispatch` (order: dispatch first, clearTape after — C3). |
| T-215 | Verify the existing Esc (`dispatch(inputAllClear)`) keyboard binding (M2 T-159) also triggers `clearTape()` — same AC path as the button (→ HR-016, `03-rules §6`, HE-021) | Pressing `Escape` empties the tape (same effect as the AC button). |

---

### Group E — `renderHistory()` into `.history-slot` (single-line v1 baseline)

> **Visual baseline: v1 Conservative (single-line).** Every entry renders as one row:
> `<span class="expr">12 + 3</span><span class="eq"> = </span><span class="res">15</span>`.
> No two-line layout. No per-entry glow or hover lift.

| # | Task | Done when |
|---|---|---|
| T-216 | Create `src/ui/history/render-history.ts` — import `getTape` from `tape.ts`; cache a reference to `document.querySelector('.history-slot')` at module init | File exists; the slot reference resolves on load; `tsc` passes. |
| T-217 | In `render-history.ts`, remove `aria-hidden` from the slot on first render with content; restore it (or add `aria-hidden="true"`) when the tape is empty (→ HR-020, F-M3-8, HE-027) | With 1 entry: slot has no `aria-hidden`; with 0 entries: slot has `aria-hidden="true"`. |
| T-218 | In `render-history.ts`, when the tape is empty, write the empty-state placeholder `<p class="history-empty">No calculations yet</p>` inside the slot (→ `04-ui §3.1`, HE-012, HE-013) | Fresh load and post-AC both show the placeholder; no blank void. |
| T-219 | In `render-history.ts`, implement the populated render: write a `<ul role="list" aria-label="Calculation history">` with one `<li>` per `HistoryEntry` (newest-first — `flex-direction: column-reverse` or reverse-read order so newest is at the top edge, D-M3-DM-01) (→ HR-019, HR-010, `04-ui §3.2`) | The tape renders as a semantic list; the most recently recorded entry appears at the top edge; `getByRole('list')` finds it; `getByRole('listitem')` count matches tape length. |
| T-220 | In `render-history.ts`, render each `<li>` as the **single-line** v1 format: `<span class="expr">{expression}</span><span class="eq"> = </span><span class="res">{result}</span>` (→ `04-ui/_picked.md` v1, HR-007..009) | An entry for `12 + 3 = 15` shows those three spans on one row; no second line; expression uses the true-Unicode glyph (e.g. `−` not `-`). |
| T-221 | In `render-history.ts`, ensure no `aria-live` attribute on the tape container or its children (→ `04-ui §6` no-double-announce, US-M3-8) | Assert the `.history-slot` element and its `<ul>` have no `aria-live` attribute. |
| T-222 | Export `renderHistory(): void` from `render-history.ts`; import it in `history.ts` and call it after every `appendEntry` and after every `clearTape` (so both recording and AC trigger a re-render) (→ `02-flows §1 step 6`, flow #5) | After `appendEntry`, the DOM updates; after `clearTape`, the empty state re-renders. |

---

### Group F — Tape CSS (v1 Conservative, token-driven)

> All theme colors via `var(--token)` from `tokens.css` (→ HR-023, `04-ui §0`).

| # | Task | Done when |
|---|---|---|
| T-223 | Create `src/ui/history/history.css` — style the `.history-slot` panel as a recessed glass pane: same glass recipe (blur `16px` vs slab's deeper blur, F-M3-8), `1px --glass-border`, `border-radius:16px`, `overflow-y: auto`, match slab height on desktop (→ `04-ui §1`, F-M3-5, HR-023) | Tape panel renders as a glass aside; `backdrop-filter` + `-webkit-` twin present; no hardcoded hex in `history.css`. |
| T-224 | In `history.css`, set tape entry list typography: Inter `0.875rem`/400/`line-height:1.5`/`tabular-nums` (F-M3-6) | Entry text renders at `0.875rem` with `tabular-nums`. |
| T-225 | In `history.css`, color the expression spans `var(--text-secondary)` and result spans `var(--text-primary)` (F-M3-6, HR-022, HR-023) | Expression renders in the secondary token; result in the primary; no hex literal for these colors. |
| T-226 | In `history.css`, right-align entry text and add hairline dividers between rows (`border-bottom: 1px solid var(--glass-border)` or equivalent alpha, v1 baseline — `04-ui/_picked.md`) | Entries are right-aligned; a hairline separates rows; no zebra striping. |
| T-227 | In `history.css`, style long-result overflow: `overflow-wrap: anywhere` on `.expr`/`.res` spans for natural wrap; `overflow-x: auto` + `direction: rtl` (or right-anchoring) on `.res` when it cannot break — never truncate/ellipsize (D-M3-EC-01, HE-001..004) | A 21-digit result wraps or scrolls right-anchored; no `…` or clip; the sign and `e+NN` stay visible. |
| T-228 | In `history.css`, set entries to NOT have pointer cursor or hover-lift — `cursor: default; pointer-events: none` on `<li>` (→ HR-012, `04-ui §5`: read-only, no interactivity affordance) | Hovering a tape entry shows default cursor; no hover-lift or visual feedback suggesting clickability. |
| T-229 | In `history.css`, add the slide-in animation for new entries (`@keyframes history-slide-in`: `translateY(-100%)→translateY(0)`, `180ms ease-out` on insert, F-M3-7) and the reduced-motion cancel: `@media (prefers-reduced-motion: reduce) { animation: none; transform: none }` (→ HR-021, HE-022..023) | Default: new entry slides in; reduced-motion: instant appear, no transform fires. |
| T-230 | Import `history.css` in the app stylesheet entry (or via a `<link>` in `index.html`) | Tape styles resolve in the app; no undefined `var(--token)` fallback warnings. |

---

### Group G — Conditional scroll-region focusability (a11y, HE-028)

| # | Task | Done when |
|---|---|---|
| T-231 | Add a `checkScrollFocus()` call in `renderHistory()` that sets `tabindex="0"` on the `<ul>` **iff** the list scrollHeight > clientHeight, else removes the attribute (→ `04-ui §6` conditional-tabindex, HE-028, HR-011/012) | Overflowing tape: `<ul tabindex="0">`; non-overflowing tape: no `tabindex` attribute; no permanent dead tab-stop. |

---

### Group H — Tests (predicate unit + render assertions)

> Tests live alongside their module in `src/ui/history/`. Vitest (already in M2 pipeline).

| # | Task | Done when |
|---|---|---|
| T-232 | Create `src/ui/history/__tests__/record-on-equals.test.ts` — test INT-M3-1 predicate: genuine resolve (`pendingOperator!==null`, `errorState===null`, `justEvaluated===true`) → `appendEntry` called once (→ HR-001, HR-002, US-M3-1) | Test passes; `appendEntry` spy called once on the genuine path. |
| T-233 | In same test file: repeated `=` (second equals, `pendingOperator===null`) → `appendEntry` NOT called (→ HR-003, HE-007) | Test passes; spy not called on the second equals event. |
| T-234 | In same test file: error result (`errorState!==null`) → `appendEntry` NOT called (→ HR-004, HE-005) | Test passes; spy not called on error equals. |
| T-235 | In same test file: bare `=` with nothing pending (`pendingOperator===null`) → `appendEntry` NOT called (→ HR-005, HE-008) | Test passes; spy not called on bare-equals. |
| T-236 | In same test file: verify chained-calc expression content — `prevState.accumulator=15, pendingOperator='add', entryBuffer='4'` → `expression='15 + 4'` (→ HR-006, HE-009, INT-M3-4) | Test passes; captured `expression` string matches `'15 + 4'` exactly. |
| T-237 | In same test file: verify true-Unicode glyphs — subtract produces `−` (U+2212), multiply `×` (U+00D7), divide `÷` (U+00F7) in expression (→ HR-008, HE-017) | Three separate test cases pass; no ASCII `- x /` in expression strings. |
| T-238 | Create `src/ui/history/__tests__/tape.test.ts` — test `appendEntry` pushes with monotonic `id`; `clearTape` empties the array; `getTape` returns all entries (→ D-M3-DM-01..03) | All three behaviours verified; `nextId` advances on append, array empty after clear. |
| T-239 | Run `npm test` across M1 + M2 + M3 tests | All tests pass (zero failures including M1/M2 regressions); exit 0. |

---

### Group I — Verification

| # | Task | Done when |
|---|---|---|
| T-240 | Run `tsc --noEmit` across `src/` (M1 + M2 + M3) | Exit 0; zero type errors at all seam boundaries (state.ts subscriber types, HistoryEntry, operator-map import). |
| T-241 | Run `npm run build` — produce the static `dist/` | Exit 0; `dist/index.html` + hashed CSS/JS + fonts; tape CSS and history modules bundled; no server runtime. |
| T-242 | Manual smoke in `npm run preview`: `12 + 3 =` → tape shows `12 + 3 = 15` as a single-line entry at visible edge; `= = =` → still only one entry; `5 ÷ 0 =` → tape unchanged; AC → tape empties + placeholder shown (→ US-M3-1, US-M3-2, US-M3-5) | All four spot-checks pass by eye. |
| T-243 | Manual a11y spot-check: tape `<ul>` has `aria-label="Calculation history"`; no `aria-hidden` when populated; `role="status"` on M2 display is the ONLY live region (no `aria-live` on tape); result `--text-primary` text visually readable over glass (→ HR-019, HR-020, US-M3-8) | Four checks pass by inspection. |
| T-244 | Hand off to REVIEW for Playwright coverage of the 28 HE rows + 23 HR rules + 8 US-M3 stories against the running build | REVIEW entry queued; M3 BUILD marked feature-complete. |

---

## Decision logged this pass

**D-008 — Task-granularity encoding for M3 BUILD.**
M3 BUILD is encoded as **44 atomic tasks (T-201..T-244) across 9 build groups (A–I)**, each ≤ 1 file / 1
logical unit with a concrete **Done when** check, traced to `HR-NNN` / `HE-NNN` / `INT-M3-N` / `US-M3-N`
IDs. Granularity rule applied: the recording seam (Group B) is split per line of `dispatch()` patch so no
task does "modify `state.ts`" in bulk (T-206/207/208 are three distinct, independently-checkable changes).
The visual baseline (`_picked.md` v1 Conservative single-line) is the explicit render target in Group E;
the two-line layout (`04-ui.md §2` default) is explicitly NOT implemented. *(AI-autonomous, CP-7.)*

---

*Total tasks: 44 (T-201 – T-244), 9 build groups (A–I). Every task is atomic (≤ 1 file or 1 logical unit;*
*no "and"-joins; no "build the whole X").*
*Decisions referenced: D-M3-DM-01..03 (`01-data-model.md`), D-M3-TC-01..02 (`06-tech-choices.md`),*
*D-M3-EC-01 (`05-edge-cases.md`); D-008 (this pass) appended above.*
*Coverage: 6 M3 flows, HR-001..023, HE-001..028, US-M3-1..8 are each reachable from named tasks;*
*v1 Conservative (`mockup-v1.html`) is the locked single-line visual port target; the §6 a11y floor is*
*wired in Groups E/F/G and verified in Groups H/I + REVIEW.*
