---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
  - storm/specify/03-history-tape/01-data-model.md
  - storm/specify/03-history-tape/06-tech-choices.md
  - storm/structure/08-design-system.md
  - storm/specify/02-calculator-ui/03-rules.md
---

# M3 History-Tape Rules — Recording + Behaviour Contract

> This file is M3's **canonical, testable rule statement**. Every rule is numbered `HR-NNN`
> ("History Rule") and phrased so a REVIEW check (manual or automated) can verify PASS/FAIL.
>
> **Scope boundary — read first.** These are **NOT arithmetic rules** (M1 owns all computation —
> frozen, REVIEW-PASS, F-M3-4) and **NOT keypad/render rules** (M2 owns input binding + readout —
> `02-calculator-ui/03-rules.md` UR-001..UR-032). M3 rules govern only the **tape**: when an entry is
> recorded, what it contains, how it is ordered, that it is read-only + in-memory, when it clears, how
> long it grows, and the behavioural craft floor the tape surface must clear. Where a rule references
> engine or recording mechanics, it does so as a *consumer* citing the verified contract — it never
> re-states or overrides it. Field/predicate names match `_briefing.md` (INT-M3-*, F-M3-*) and
> `01-data-model.md` exactly; M3 inherits `OPERATOR_TO_GLYPH` (F-M3-9), it does not redefine it.

---

## §1 — Recording (INT-M3-1; F-M3-1)

**HR-001** An entry is recorded **iff** the INT-M3-1 recording predicate holds (cited, not restated):
> `prevState.pendingOperator !== null` **AND** `nextState.errorState === null` **AND**
> `nextState.justEvaluated === true`

i.e. the genuine pending-operator resolve path succeeded (`_briefing.md:82-84`). On any equals that
fails the predicate, **no entry is created**. M3 evaluates the predicate over the `(prevState,
nextState)` pair the recording seam observes around `dispatch()` (INT-M3-3, mechanism owned by
`06-tech-choices.md`); M3 performs **no arithmetic** and calls **no** M1 reducer (F-M3-4).

**HR-002** **One equals = at most one entry.** A single equals transition that satisfies HR-001
appends **exactly one** `HistoryEntry`; one that fails it appends **zero**. M3 never appends more than
one entry per equals event. Verifiable: a click/keypress equals on `12 + 3` adds exactly one tape line.

**HR-003** **Repeated `=` does not record.** After the first equals, `pendingOperator` is already
`null`, so a second (and any subsequent) equals fails HR-001's first clause → no entry (coheres with
M1's equals-after-equals no-op D-017 and M2's repeat-animation guard, `_briefing.md:87`). Verifiable:
`12 + 3 = = =` produces **one** tape line, not three.

**HR-004** **Error results are never recorded.** When the equals produces an error
(`nextState.errorState !== null` — divide-by-zero, overflow), HR-001's middle clause fails → no entry.
The tape contains **only successful calculations**; no error sentence or `ErrorTag` ever enters a tape
line (`_briefing.md:88`). Verifiable: `5 ÷ 0 =` adds **zero** tape lines.

**HR-005** **Bare `=` with nothing pending does not record.** When equals is pressed with no pending
operator (e.g. `5 =`), HR-001's first clause fails → no entry (`_briefing.md:89`). Verifiable: `5 =`
on a fresh state adds **zero** tape lines.

**HR-006** **Chained calculations record the final binary step (INT-M3-4 — expected, not a defect).**
Because M1 is immediate-execution, `12 + 3 + 4 =` evaluates the intermediate `+` on the second
operator press, so at the final equals `prevState` is `{accumulator: 15, pendingOperator: add,
entryBuffer: 4}`. The tape therefore records **`15 + 4` = `19`**, not `12 + 3 + 4`. This is standard
basic-calculator behaviour (`_briefing.md:106-111`); `05-edge-cases.md` owns the user-facing framing.
Verifiable: `12 + 3 + 4 =` produces one tape line whose expression is `15 + 4`.

---

## §2 — Entry content (INT-M3-2; data-model §1, §3)

**HR-007** Each entry holds **two display-ready strings** — `expression` and `result` — formatted at
capture time and stored as text, never recomputed at render (data-model §1). M3 stores no `Decimal`,
no `Operator`, no `EngineState` in an entry.

**HR-008** **`expression` is derived from `prevState`** (data-model §3): `prevState.accumulator` via
`.toString()` (a *read*, not arithmetic — F-M3-4), then the true-Unicode operator glyph from the
inherited `OPERATOR_TO_GLYPH[prevState.pendingOperator]` (F-M3-9 — `+ − × ÷`, real minus U+2212 not a
hyphen), then `prevState.entryBuffer`. Example: `prevState = {accumulator: 12, pendingOperator: add,
entryBuffer: "3"}` → `"12 + 3"`. Verifiable: the recorded expression of `12 + 3 =` contains U+002B;
of `7 − 2 =` contains U+2212; of `6 × 2 =` contains U+00D7; of `8 ÷ 2 =` contains U+00F7.

**HR-009** **`result` is `getDisplayValue(nextState)`** (data-model §3) — always a plain **value
string**, never an error tag. The `ErrorTag` branch of `getDisplayValue` is structurally unreachable at
capture because HR-001 already gates `nextState.errorState === null` (data-model §3 finding). Verifiable:
every recorded `result` parses as a number string; no tape `result` ever reads `Cannot divide by zero`
or `Number too large`.

---

## §3 — Ordering (data-model §2; F-M3-5, F-M3-7)

**HR-010** **Most-recent entry sits at the visible edge.** The newest completed calculation appears at
the top edge of the panel (where the slide-in lands, F-M3-7); older entries shift away from it. This is
a **render-side** ordering: the backing array stores entries oldest-first (a plain `push`, D-M3-DM-01,
data-model §2) and the render layer places newest at the visible edge. Verifiable: after recording
`A =` then `B =`, line for `B` renders above line for `A`.

---

## §4 — Read-only (F-M3-3; OQ-M3-3 resolved)

**HR-011** **No editing.** Past tape entries cannot be modified — no inline edit, no field is editable
(F-M3-3, `04-scope.md:57`). Verifiable: no tape line exposes an editable control or accepts text input.

**HR-012** **No re-run / no click-to-reuse.** Clicking, tapping, or activating a tape entry does
**nothing** — it does not load the expression back into the calculator, re-compute it, or seed the
entry buffer (F-M3-3, OQ-M3-3 confirmed OUT, `04-scope.md:58`). The tape is a record, not a control
surface. Verifiable: clicking any tape line leaves `EngineState` unchanged (no M1 call, no readout
change).

**HR-013** **No export / share / copy affordance.** M3 ships no export, share, download, or
copy-to-clipboard control on the tape or its entries (F-M3-3). (Native OS text selection of rendered
text is not an M3 feature and is neither added nor suppressed by this rule.) Verifiable: no
export/share/copy button exists in the tape panel.

---

## §5 — Persistence (F-M3-2)

**HR-014** **In-memory only.** The tape lives in module memory for the life of the tab. M3 writes
**no** `localStorage`, **no** IndexedDB, **no** cookie, **no** DB, **no** server call; there is no
serialization, no save, no restore, no cross-tab or cross-device sync (F-M3-2, data-model §4).
Verifiable: after recording entries, browser storage (localStorage/sessionStorage/IndexedDB/cookies)
contains zero tape data; a network panel shows no tape-related request.

**HR-015** **Lost on tab close / reload.** A reload or new tab starts with an **empty** tape — no
prior entry survives the session (F-M3-2, data-model §4). Verifiable: record entries, reload → tape is
empty.

---

## §6 — Clear (data-model §4; OQ-M3-1 baseline)

**HR-016** **AC clears the tape.** Pressing **AC** (all-clear) empties the tape to zero entries — the
panel returns to its empty state — alongside M2's `inputAllClear` reset of the calculator
(`03-modules.md:82`, data-model §4). Verifiable: with a non-empty tape, AC leaves zero tape lines.

**HR-017** **CE does not clear the tape.** **CE** (clear-entry) resets only M2's current entry buffer;
it adds and removes **no** tape entry (data-model §4). Verifiable: with a non-empty tape, CE leaves the
tape unchanged.

> A dedicated "clear history" affordance (beyond AC) is OQ-M3-1, a UX-interpretation call for
> `04-ui.md`. If added, it runs the same clear (tape → empty); it does not change HR-016/HR-017.

---

## §7 — Length (D-M3-DM-03; OQ-M3-4 resolved)

**HR-018** **The tape is unbounded — no length cap.** Entries accumulate by append for the whole
session; M3 evicts **no** entry to make room (D-M3-DM-03, data-model §5, resolving OQ-M3-4). Overflow
beyond the visible panel is absorbed by the **scroll** the design already mandates (F-M3-5: desktop
~240px scrollable panel; phone ~140px capped-height scrollable), never by dropping data — honoring the
same no-data-loss trust principle M2 held for its readout (M2 shrink→scroll, never truncate, D-006).
Verifiable: recording more entries than fit the panel height produces a scroll region containing **all**
entries; the oldest entry is still reachable by scrolling.

> Per-entry **long-string** overflow inside the narrow panel (wrap / truncate / ellipsis for a very
> long single expression or result) is the *separate* OQ-M3-5, a render/edge concern for
> `05-edge-cases.md` — distinct from this length-cap rule.

---

## §8 — Behavioural accessibility / craft floor (C3; design §8 — brief, UI file owns visual detail)

> These encode the **behavioural** slice of `08-design-system.md` §8 as testable rules. The craft floor
> holds at zero stakes (C3). Visual/layout detail (exact placement, sizes, colors) is `04-ui.md`'s.

**HR-019** **The tape is a semantic list.** Entries render inside a real list structure (`<ul>`/`<ol>`
with `<li>` items, or an equivalent ARIA list role) so screen readers announce it as a list and report
item count — never a flat pile of `<div>`s (craft floor; design §8 semantic-markup). Verifiable: the
tape container exposes a list role and each entry an item role.

**HR-020** **The populated slot is not `aria-hidden`.** M3 removes the `aria-hidden="true"` M2 reserved
on the empty `.history-slot` (F-M3-8) when the tape carries content, so the history is reachable by
assistive tech. Verifiable: once entries exist, the tape region is not `aria-hidden`.

**HR-021** **Reduced-motion drops the slide-in.** Under `prefers-reduced-motion: reduce`, the new-entry
slide-in (F-M3-7, `180ms ease-out` transform) is dropped — entries appear **instantly** with no
transform/translate (F-M3-7, `08-design-system.md:136,148`; parallels M2 UR-025). Verifiable: with
reduced-motion emulated, recording an entry fires no transform transition on the tape.

**HR-022** **Text-over-glass contrast holds (WCAG AA).** The tape's expression (`--text-secondary`) and
result (`--text-primary`) text clears WCAG AA over the glass panel at the worst point of the gradient
beneath it (`08-design-system.md:144`; parallels M2 UR-027). Verifiable in REVIEW with a contrast
checker against tape screenshots: result text ≥4.5:1, expression text ≥4.5:1 (normal-size body text).

**HR-023** **Tape styles consume design tokens, not hardcoded theme literals.** Every theme-able tape
color (text, any glass fill or border it adds) references a `08-design-system.md` §3 CSS custom property
(`var(--token)`), never a hardcoded hex/rgba theme literal — so M4's theme swap reaches the tape without
touching M3 markup (parallels M2 UR-029). Verifiable: grep M3's CSS for theme hex/rgba outside token
definitions → none in tape component rules.

---

## §9 — What this file does NOT own

| Topic | Owner |
|---|---|
| All arithmetic, chaining, precedence, div-by-zero, overflow, latch semantics | M1 `01-calculation-engine/03-rules.md` (R-001..R-027), frozen |
| Keypad input binding, readout rendering, error sentence, focus/hit-area | M2 `02-calculator-ui/03-rules.md` (UR-001..UR-032) |
| `HistoryEntry` shape, derivation formulas, append/clear lifecycle, length decision | M3 `01-data-model.md` |
| Recording-seam mechanism (how `(prev,next)` is observed) + host primitive | M3 `06-tech-choices.md` (INT-M3-3) |
| Entry-add user journeys / step-by-step recording flow | M3 `02-flows.md` |
| Exact placement, panel sizes, entry layout (1-line vs 2-line), microcopy, empty state | M3 `04-ui.md` (+ mockups); OQ-M3-1, OQ-M3-2 |
| Long-string-per-entry overflow (wrap/truncate/ellipsis) | M3 `05-edge-cases.md` (OQ-M3-5) |
| Theme toggle + dark token set | M4 |

---

## Rules logged this file

`HR-001..HR-023` — consumer/behaviour rules for the in-memory, read-only history tape, under the
orchestrator's pre-approved INT-M3-1..4 / F-M3-1..10 framing. No arithmetic rule (M1) and no keypad/
readout rule (M2) is restated or overridden; OQ-M3-3 (reuse OUT) and OQ-M3-4 (unbounded) are stated as
fixed boundaries, OQ-M3-1/2/5 are pointed to their owning concern files.
