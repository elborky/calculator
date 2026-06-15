---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/structure/03-modules.md
  - storm/structure/04-scope.md
  - storm/structure/08-design-system.md
  - storm/specify/02-calculator-ui/_index.md
  - storm/specify/02-calculator-ui/01-data-model.md
---

# M3 History Tape — Orchestrator Briefing

> **Orchestrator-authored** (not delegated, per #FF-016). Read FIRST by every M3 SPECIFY sub-agent.
> Canonical facts (F-M3-*), the verified M1/M2 integration contract (INT-M3-*), the domain lens for
> this module, and the open questions (OQ-M3-*). All `src/` facts below were read from the live tree
> at SPECIFY entry (2026-06-15) — not from memory.

---

## What M3 is (one breath)

An **in-session, in-memory record of completed calculations** (expression + result), rendered as a
glass tape **beside** the keypad (desktop) / **stacked** with it (phone). It records what M1 computed at
the moment M2's **equals** resolves, displays the running list most-recent-visible + scrollable, and
dies with the tab. **Read-only**: no editing, no re-running, no export, no persistence. The second and
final *surface* module (`06-build-order.md:54`); M4 theming follows.

---

## Domain Lens re-validation (gate (a), `00-domain-lens.md:78`)

**Lens HOLDS, no drift.** The lens explicitly pre-cleared this module: *"Calculation history (if chosen)
is at most ephemeral in-memory state, **not a data model**"* (`00-domain-lens.md:67`). M3 stays a
**solo zero-stakes consumer web utility — design-craft-forward**. Hat profile unchanged: **UX designer +
frontend-craft** primary (the tape is a visual surface), **accessibility** floor holds, **product
strategist = brake** (resist creep into persistence/reuse/export). Do **NOT** summon data-architect /
security / compliance hats — there is no schema, no PII, no server (`00-domain-lens.md:64-70`).

---

## Canonical facts (cite these; do not re-derive)

| # | Fact | Source (verified) |
|---|---|---|
| **F-M3-1** | M3 records **completed calculations only** — expression + result, captured when equals resolves. | `03-modules.md:79-82` |
| **F-M3-2** | **No persistence.** In-memory only; dies with the tab. No `localStorage`, no DB, no cross-session/cross-device. | `03-modules.md:86`; `04-scope.md:53`; `00-domain-lens.md:67` |
| **F-M3-3** | **Read-only.** No editing past entries, **no re-running / no click-to-reuse**, no export/share/copy. | `03-modules.md:88-90`; `04-scope.md:57-58` |
| **F-M3-4** | **No arithmetic in M3.** It records what M1 computed; it never calculates. M1 stays frozen (REVIEW-PASS); M3 adds **zero** engine fields and invents **no** calculation path. | `03-modules.md:91`; M1 frozen per `02-calculator-ui/_index.md` |
| **F-M3-5** | **Placement (design-locked):** desktop = glass panel **to the side** of the calculator, ~240px wide, scrollable; phone (≲640px) = **stacked** above/below, capped height ~140px, scrollable, most-recent at the visible edge. M3 owns **content**; `08-design-system §6` owns **placement**. | `08-design-system.md:120` |
| **F-M3-6** | **Tape typography (design-locked):** Inter `0.875rem` / weight 400 / line-height 1.5, `tabular-nums`. **Expression** in `--text-secondary`; **result** in `--text-primary`. | `08-design-system.md:84` |
| **F-M3-7** | **Entry-add motion (design-locked):** new line **slides in from the top edge**, `180ms ease-out`, gently pushing older entries down. Honor `prefers-reduced-motion: reduce` → instant, no transform. | `08-design-system.md:134,136` |
| **F-M3-8** | The DOM slot **already exists**: `index.html` has `<div class="history-slot" aria-hidden="true">` as a flex sibling of `.calc` inside `.app-layout` (reserved by M2 task T-175, empty). `layout.css:97-100` lays it out (`flex-shrink:0`). M3 **populates it + removes `aria-hidden`**. | live `index.html`; `src/ui/styles/layout.css:85-100` |
| **F-M3-9** | **Glyph map already exists** — `OPERATOR_TO_GLYPH` (`Operator`→true-Unicode `+ − × ÷`) in `src/ui/operator-map.ts`. M3 **inherits** it for rendering the expression; does **not** restate or redefine it. | live `src/ui/operator-map.ts` (M2 T-141) |
| **F-M3-10** | **Tech stack is fixed by M2** (continuity, no new framework): Vanilla TypeScript, Vite 8 build, plain-CSS design tokens, self-hosted Inter, TS 6. M3 adds **no UI framework, no store, no new runtime dependency** unless a documented constraint forces it (CP-6 head-to-head if so). | `02-calculator-ui/_index.md:43-56` |

---

## M1/M2 integration contract — INT-M3 (verified against `src/`, 2026-06-15)

This is the load-bearing part. M3 hooks into the **existing** M2 dispatch loop **without** touching M1
and **without** M2 recomputing anything.

**The M2 dispatch loop (verified `src/ui/state.ts:44-47`):**
```
dispatch(fn) {  state = fn(state);  render(state);  }
```
Every input event replaces the single held `EngineState` cell, then renders. `EngineState`
(`src/types.ts:7`) = `{ entryBuffer, accumulator: Decimal|null, pendingOperator: Operator|null,
justEvaluated: boolean, errorState: ErrorTag|null }`.

**M1 `inputEquals` behaviour (verified `src/engine.ts`):**
- **Error state** → no-op (returns state).
- **No pending operator + already `justEvaluated`** → **no-op** (equals-after-equals, D-017). *This is why
  repeated `=` must not double-record.*
- **No pending operator, not yet evaluated** → latch `justEvaluated`, value unchanged (no real calc).
- **Pending operator present (the real path)** → resolves `accumulator <op> entryBuffer`; on success sets
  `entryBuffer = result`, `accumulator = result`, `pendingOperator = null`, `justEvaluated = true`,
  `errorState = null`. On error sets `errorState`, clears `pendingOperator`, `justEvaluated = false`.

**INT-M3-1 — the recording predicate (clean, fully verified):** a calculation is **recorded iff**
> `prevState.pendingOperator !== null` **AND** `nextState.errorState === null` **AND** `nextState.justEvaluated === true`
> (i.e. the genuine pending-operator resolve path succeeded).

This predicate **automatically excludes**, with no special-casing:
- **repeated `=`** — after the first equals `pendingOperator` is already `null` → `prevState.pendingOperator === null` → skip (no duplicate; coheres with D-017 + M2's `render.ts:227` repeat-animation guard).
- **divide-by-zero / overflow** — `nextState.errorState !== null` → skip (errors never enter the tape).
- **bare `=`** with nothing pending (e.g. `5 =`) — `pendingOperator === null` → skip.

**INT-M3-2 — what to record (both states needed):**
- **Expression** ← reconstructed from **`prevState`**: `prevState.accumulator.toString()` + glyph(`prevState.pendingOperator`) (via `OPERATOR_TO_GLYPH`, F-M3-9) + `prevState.entryBuffer`. e.g. `"12 + 3"`.
- **Result** ← from **`nextState`**: `getDisplayValue(nextState)` (or `nextState.entryBuffer`) → `"15"`.
- Both `prevState` and `nextState` are required → the recording hook must see the state **before and after** the equals reducer runs.

**INT-M3-3 — the hook seam (mechanism is a `06-tech-choices` decision, NOT pre-decided here):** the only
fact fixed at briefing time is *where* the seam is — M3 must observe `(prevState, nextState)` around the
`dispatch()` in `state.ts`. **How** (a post-dispatch observer/callback list added to `dispatch`, a tiny
pub/sub event, or an equals-aware wrapper) is an **AI-autonomous architecture decision for the opus
`06-tech-choices` sub-agent** — run the CP-6 head-to-head (hook vs event-emit vs wrapper), weighting
*least bespoke code* (profile-fit, F-M3-10) and *zero M1 coupling*. Hard constraints the chosen
mechanism MUST satisfy: (a) M3 calls **no** M1 function and reads **no** M1 internals beyond the public
`EngineState` shape + `getDisplayValue`; (b) it adds **no** field to `EngineState`; (c) it does **not**
change any existing M2 render/behaviour — it observes, it does not intercept.

**INT-M3-4 — chained calculations (note for `03-rules`/`05-edge-cases`, not a bug):** M1 is an
immediate-execution engine — `12 + 3 + 4 =` evaluates the intermediate `+` on the second operator press,
so at the final `=` the `prevState` is `accumulator=15, pendingOperator=add, entryBuffer=4`. The tape
therefore records the **final binary step** `"15 + 4" = "19"`, not the full `"12 + 3 + 4"`. This is
standard basic-calculator behaviour and is **in-scope/expected**; the spec should state it plainly so it
is not later mistaken for a defect.

---

## Tape state (M3's own state — owned by M3, separate from `EngineState`)

A module-scoped, in-memory ordered list of entries. Each entry = `{ expression: string, result: string }`
(+ an internal key for render if the data-model sub-agent wants one). Appended on the INT-M3-1 predicate;
rendered most-recent-visible. **No persistence** (F-M3-2). The `01-data-model` (opus) sub-agent owns the
precise shape + the canonical Mermaid `erDiagram` (one entity, `HistoryEntry`) + the append/clear
lifecycle; keep it honest to the zero-stakes scale (anti-inflation: this is an array, not a schema).

---

## Open questions (resolve at the noted step — none blocks the briefing)

- **OQ-M3-1 (UX-interpretation, 04-ui — AI-autonomous, validate interpretation):** **clear-tape
  mechanism.** Module baseline says the tape "clears with a full **AC** / tab close" (`03-modules.md:82`).
  Decide: does **AC** clear the tape (baseline), and/or is a small dedicated **"clear history"** affordance
  warranted in the tape panel? Lean: honour the AC baseline; a dedicated control is a UX nicety to weigh
  against scope-minimalism. Resolve in the 04-ui UX-interpretation dialogue (orchestrator-run).
- **OQ-M3-2 (UX-interpretation, 04-ui):** **entry layout** — single line `12 + 3 = 15` vs two lines
  (expression above, result below). Design §4 colours expression(secondary)/result(primary) either way.
  AI interprets → validates with owner (not a blind ask).
- **OQ-M3-3 (already decided — confirm only):** **click-a-history-entry to reuse** = **OUT** (read-only,
  F-M3-3 / `04-scope.md:58`). Do not build; state the boundary.
- **OQ-M3-4 (technical, AI-decided in 03-rules/05-edge-cases):** **tape length cap** — unbounded +
  scroll vs a soft cap (e.g. last N). At zero-stakes in-memory, unbounded+scroll is simplest and
  truthful; a soft cap is a defensible perf/clarity guard. AI decides + documents (CP-7); no owner ask.
- **OQ-M3-5 (technical, 05-edge-cases):** **long expression/result inside the narrow tape** (~240px /
  ~140px) — wrap, truncate-with-full-on-scroll, or ellipsis. Must not break the "no data loss" trust
  principle M2 honoured for the readout (M2 shrink→scroll, never truncate — `02-calculator-ui` D-006).
  AI decides a tape-appropriate treatment + documents.

---

## Concern set (8 files) + tiers

`_index.md`(sonnet) · `01-data-model.md`(**opus**) · `02-flows.md`(sonnet) · `03-rules.md`(sonnet) ·
`04-ui.md`(sonnet, + 3 parallel sonnet mockups) · `05-edge-cases.md`(sonnet) ·
`06-tech-choices.md`(**opus** — INT-M3-3 hook-seam head-to-head) · `07-acceptance.md`(sonnet) ·
`_audit.md`(**opus**, cross-file).

**§0 Inheritance (for `_index.md`):** M3 INHERITS from M2 — `OPERATOR_TO_GLYPH` (`src/ui/operator-map.ts`,
F-M3-9), the single-`EngineState` dispatch host + `render` loop (INT-1, `state.ts`), and the design-token
custom-property layer (`tokens.css`). Not restated; M3 owns only the tape's content, state list, panel
UI, and the INT-M3 recording seam.

**Anti-inflation reminder (CP-13):** M3 is genuinely small. Keep every concern lean (density-at-source,
#FF-027). No invented persistence layer, no observer framework, no schema ceremony for a one-entity
in-memory array. The craft floor (accessibility, readable contrast over glass, reduced-motion, semantic
markup, no data loss on long values) still holds at full height — small scope, same craft bar (C3).
