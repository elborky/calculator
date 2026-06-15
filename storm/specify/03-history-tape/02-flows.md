---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
  - storm/specify/03-history-tape/01-data-model.md
  - storm/specify/03-history-tape/06-tech-choices.md
  - storm/specify/02-calculator-ui/02-flows.md
  - storm/structure/08-design-system.md
---

# M3 Flows — Record-on-Equals + Tape Lifecycle

> **Scope:** M3's flows are mostly **SYSTEM flows**, not user-initiated. M3 invents **no new input
> affordance** — the recording is automatic off the **existing equals** the user already presses (M2
> flow #4). The user's only M3-specific *acts* are passive: **scroll** the tape and the **AC** they
> already press to clear the calculator (which now also clears the tape). Everything else is the system
> observing M2's dispatch and appending.
>
> Every recording flow is one shape: **M2 equals dispatch → M2 render (unchanged) → the post-dispatch
> listener fires → INT-M3-1 predicate decides → on match, build entry (INT-M3-2) → append → tape
> re-renders, new line slides in.** The predicate, the derivation, and the listener seam are defined in
> `_briefing.md` (INT-M3-1..4), `01-data-model.md` (entry shape + lifecycle), and `06-tech-choices.md`
> (the `recordOnEquals` subscriber seam) — referenced here, not re-specified.
>
> **NOT in this file:** M1 arithmetic (M1 `02-flows.md`); the M2 keypad flows 1–8 (M2 `02-flows.md`) —
> M3 hooks flow #4's *output*, it does not re-run any of them; the seam *mechanism* (`06-tech-choices.md`
> §1); the entry *shape* + append/clear *data* lifecycle (`01-data-model.md` §3–4); pixels / panel
> placement / slide-in CSS (`04-ui.md` + `08-design-system §6`); per-entry long-value overflow
> (`05-edge-cases.md`, OQ-M3-5).

---

## Flow index

| # | Flow | Kind | Trigger | Mechanism | Outcome |
|---|---|---|---|---|---|
| 1 | Record-on-equals | **system** | M2 equals resolves (flow #4) | listener → INT-M3-1 → append | new tape line slides in |
| 2 | Non-recording equals | **system** | repeated `=` / error / bare `=` | INT-M3-1 false → skip | tape unchanged (no-op) |
| 3 | Chained calc | **system** | `12 + 3 + 4 =` | records final binary step | tape shows `15 + 4 = 19` |
| 4 | View / scroll the tape | **user** | scroll the list | native scroll | most-recent at the visible edge |
| 5 | Clear the tape | **user** | the **same AC** they already press | AC clears tape too | tape empties → empty state |
| 6 | App load / empty | system | page load / mount | `tape = []` | empty tape, empty-state panel |

**The core invariant.** M3 has exactly **one** state-change source — the post-dispatch listener — and
**one** consumer — the tape render. There is no M3 input path, no M3 calculation, no M3 engine call. The
listener *observes* M2's `(prev, next)` pair after each dispatch and the **INT-M3-1 predicate alone**
decides whether to record. The predicate *is* the equals filter (it is true only on the genuine
pending-operator resolve), so M3 needs no equals-detection — flows 1, 2, and 3 are all the same listener,
differing only in whether the predicate fires.

---

## 1. Record-on-equals flow (the core flow)

**Kind:** system. **Trigger:** the user completes a calculation — M2's equals (flow #4, `=`/`Enter`/
button) resolves on the genuine pending-operator path.

**Trace (M2 unchanged → M3 observes → append → render):**

1. **M2 equals dispatch (unchanged).** The user presses `=`; M2 flow #4 runs `dispatch(s => inputEquals(s))`.
   Inside `dispatch()` the held cell is replaced (`prev → next`) and **`render(state)` runs first,
   exactly as before** — M2's primary display shows the result, the pending line clears, the result
   fade+rise fires (M2 §7). **M3 changes none of this** (C3 — observe, not intercept).
2. **The listener fires (after render).** Per the `06-tech-choices.md §1` subscriber seam, `dispatch()`
   then notifies `recordOnEquals(prev, next)` with the **before/after** pair (both required, INT-M3-2).
3. **Predicate evaluated (INT-M3-1).** The listener checks
   `prev.pendingOperator !== null` **AND** `next.errorState === null` **AND** `next.justEvaluated === true`.
   Here it is **true** (a real resolve succeeded).
4. **Build the entry (INT-M3-2).** `expression` from `prev` (`prev.accumulator.toString()` + glyph via
   `OPERATOR_TO_GLYPH`, F-M3-9, + `prev.entryBuffer`, e.g. `"12 + 3"`); `result` = `getDisplayValue(next)`
   (e.g. `"15"`). Both are pre-formatted strings (`01-data-model §1`).
5. **Append** to the in-memory `tape` array (`tape.push(entry)`, `01-data-model §4`).
6. **Tape re-renders.** `renderHistory()` writes the existing `.history-slot` (F-M3-8); the new line
   **slides in from the top edge**, `180ms ease-out`, gently pushing older entries down (F-M3-7),
   honoring `prefers-reduced-motion: reduce` → instant, no transform.

**Outcome:** the just-completed calculation appears as a new tape line at the visible edge; the
calculator readout (M2) is byte-for-byte what it was before M3 existed. The user pressed nothing extra —
the record came free off the equals they already pressed.

> **Ordering note:** M2's `render(state)` runs **before** the listener (`06-tech-choices.md §1` step 2),
> so the calculator updates first and the tape line follows — never the reverse, never a blocked render.

---

## 2. Non-recording equals flow (explicitly, so it's testable)

**Kind:** system. **Trigger:** an equals that is **not** a genuine resolve. **Mechanism:** the same
`recordOnEquals` listener fires, but **INT-M3-1 is false**, so it returns without appending —
**no entry, no `id` consumed** (`01-data-model §4`). These fall out **for free** from the predicate; M3
adds **no special-casing** (`_briefing.md:86–89`).

| Case | Why the predicate is false | Tape result |
|---|---|---|
| **Repeated `=`** (e.g. `5 + 3 = =`) | after the first equals `pendingOperator` is already `null` → `prev.pendingOperator === null` | **no-op** — no duplicate (coheres with D-017 + M2's repeat-animation guard) |
| **Error result** (÷0 / overflow) | `next.errorState !== null` | **no-op** — errors **never** enter the tape |
| **Bare `=` with nothing pending** (e.g. `5 =`, or `=` on fresh load) | `prev.pendingOperator === null` | **no-op** — nothing was being calculated |

**Outcome:** the tape is **unchanged** in every non-recording case. This is the listener's correctness
floor: it observes *every* dispatch but records *only* the genuine resolve, because the predicate gates
it. (It also fires harmlessly after every non-equals dispatch — digit, operator, clear — where
`next.justEvaluated` is false or `prev.pendingOperator` is null, so the predicate is false and it no-ops.
M3 never inspects *which* input ran; the predicate is the whole filter.)

---

## 3. Chained-calculation flow (INT-M3-4 — expected behaviour)

**Kind:** system. **Trigger:** a chained sequence like `12 + 3 + 4 =`.

**Mechanism + expected outcome:** M1 is an **immediate-execution** engine — the intermediate `+`
resolves when the **second** operator is pressed, so at the final `=` the `prev` state is
`accumulator = 15, pendingOperator = add, entryBuffer = 4`. The listener therefore records the
**final binary step**: `expression = "15 + 4"`, `result = "19"` — **not** the full `"12 + 3 + 4"`.

**Outcome:** the tape shows **`15 + 4 = 19`**. This is **standard basic-calculator behaviour and is
in-scope/expected** (`_briefing.md` INT-M3-4) — stated here plainly so it is not later mistaken for a
defect. (User-facing framing of "why isn't the whole chain shown" is `05-edge-cases.md`'s to own; this
flow fixes only the behaviour.) Each intermediate resolve *did* update the readout via M2, but only the
genuine `=` resolve satisfies INT-M3-1 — so one chained sequence yields **one** tape line, the last step.

---

## 4. View / scroll the tape flow

**Kind:** user (passive). **Trigger:** the user scrolls the tape list.

**Mechanism:** native scroll on the already-scrollable panel — desktop = the ~240px side glass panel;
phone (≲640px) = the stacked, capped-height (~140px) region (F-M3-5, slot per F-M3-8). The tape is
**unbounded** (no length cap; overflow is absorbed by this scroll, `01-data-model §5`, D-M3-DM-03), so
scrolling is the truthful overflow handling — no completed calculation is ever dropped (the same
"no data loss" trust principle M2 honoured for its readout).

**Outcome:** the **most-recent entry sits at the visible edge** (F-M3-5); older entries are reachable by
scrolling. Read-only — there is **no click-to-reuse, no edit, no export** (F-M3-3, OQ-M3-3 = OUT).
Scrolling is the **only** new affordance M3 adds, and even that is the browser's native scroll, not a
bespoke control.

---

## 5. Clear-the-tape flow

**Kind:** user. **Trigger:** the user presses **AC (all-clear)** — the **same AC they already press** to
reset the calculator (M2 flow #5.2, AC button or `Esc`). Per the validated module baseline, **AC is the
clear** (`03-modules.md:82`).

**Mechanism (the coupling, stated):** M3 observes the same AC signal M2's `inputAllClear` represents and
empties its own array — `tape = []` (`01-data-model §4`). The render then shows the empty state. The
coupling is deliberate: **one press, two effects** — M2 resets the calculator to its load state *and* the
tape clears alongside it. The user learns **no new clear gesture**; the AC they already know now also
clears history.

**CE (clear-entry) does NOT clear the tape** — CE resets only M2's current entry buffer, not history; no
completed calculation is added or removed (`01-data-model §4`). CE is the lighter escape that preserves
the in-progress calculation; the tape, which holds only *completed* calculations, is untouched.

**Outcome:** on AC, the tape empties and the panel returns to its empty state; on CE, the tape is
unchanged.

> **Clear-UX boundary (OQ-M3-1, deferred to `04-ui.md`):** this flow commits to the **AC baseline** —
> AC clears the tape. Whether a *dedicated* "clear history" affordance is **also** added in the panel is
> a UX-interpretation call for `04-ui.md`; if added, it runs the **same** `tape = []` clear. This flow
> fixes only that the AC the user already presses clears the tape.

---

## 6. App-load / empty-state flow

**Kind:** system. **Trigger:** page load / app mount.

**Mechanism:** the tape array initializes empty — `tape = []`, `nextId = 0` (`01-data-model §4`). Because
M3 is **in-memory only** (F-M3-2 — no `localStorage`, no restore, no cross-session sync), a fresh load
**always** starts empty; nothing carries over from a previous tab session.

**Outcome:** an **empty tape** — the panel renders its empty state (the empty-state visual is `04-ui.md`'s
concern). The first record-on-equals (flow 1) populates the first line.

---

## 7. Flow interaction map — how M3 rides M2's loop

M3 has no flow chart of its own input — it **branches off M2's equals**. The map below shows where the
single M3 listener hangs off the existing M2 dispatch loop:

```
[APP LOAD]  M2: state = initialState()   |   M3: tape = [], nextId = 0  → empty-state panel (flow 6)
      │
      │   ... user drives M2 (digits / decimal / operator / clear — M2 flows 1,2,3,5) ...
      │   after EVERY dispatch, recordOnEquals(prev,next) fires and the INT-M3-1 predicate runs;
      │   on a non-equals or non-genuine dispatch it is FALSE → no-op (flow 2).
      │
      ├─ EQUALS (M2 flow #4) ──────────────────────────────────────────────┐
      │     M2: dispatch(inputEquals) → render(state) FIRST (unchanged)     │  ← M2 readout updates
      │     M3: recordOnEquals(prev,next) fires AFTER render                │
      │            │                                                        │
      │            ├─ INT-M3-1 TRUE  → build entry (INT-M3-2) → tape.push   │
      │            │     → renderHistory() → new line SLIDES IN (flow 1)    │  ← tape grows
      │            │        chained `12+3+4=` records final step `15+4=19`  │     (flow 3)
      │            │                                                        │
      │            └─ INT-M3-1 FALSE → no-op: repeated `=`, ÷0/overflow,    │
      │                  bare `=` (flow 2) → tape UNCHANGED                 │
      │
      ├─ AC  (M2 flow #5.2, button OR Esc) ─► M2 full reset  +  M3: tape = [] → empty state (flow 5)
      ├─ CE  (M2 flow #5.1, button) ───────► M2 entry wiped  +  M3: tape UNCHANGED (flow 5)
      │
      └─ user SCROLLS the tape ─► native scroll; most-recent at the visible edge (flow 4, read-only)
```

**Cross-file contract:**
- `_briefing.md` — INT-M3-1 (predicate), INT-M3-2 (derivation), INT-M3-3 (seam location), INT-M3-4
  (chained = final binary step). This file *traces* them through the flows; it does not redefine them.
- `06-tech-choices.md` §1 — the `recordOnEquals` post-dispatch subscriber seam (the *how* of the
  observation: `subscribe()` + the `(prev,next)` notify after `render`). This file uses that seam; it
  does not pick the mechanism.
- `01-data-model.md` §1,§3,§4,§5 — `HistoryEntry` shape, the derivation formulas, the append/clear
  lifecycle, the unbounded-array-+-scroll decision. This file *triggers* append/clear; that file owns the
  data.
- `02-calculator-ui/02-flows.md` #4 (equals), #5.2 (AC) — the M2 flows M3 hooks. M3 observes their
  output; it does not re-run them and changes none of their behaviour (C3).
- `04-ui.md` — the panel pixels, slide-in CSS, empty-state visual, entry layout (OQ-M3-2), and the
  clear-UX call (OQ-M3-1, AC-only vs dedicated control). `05-edge-cases.md` — long-value overflow inside
  the narrow panel (OQ-M3-5) and the chained-calc user-facing framing (INT-M3-4).

> **Anti-inflation note (CP-13 / YAGNI).** Six flows, four of them passive system-observations of M2's
> existing loop. **No new input flow** — M3 adds no button, no key, no engine call; the recording is
> automatic off the equals the user already presses, and the only user act is scroll + the AC they
> already know. No re-run flow, no edit flow, no export flow (F-M3-3, read-only). No persistence flow
> (F-M3-2, dies with the tab).
