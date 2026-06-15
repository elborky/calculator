---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
  - storm/specify/03-history-tape/01-data-model.md
  - storm/specify/03-history-tape/06-tech-choices.md
  - storm/specify/02-calculator-ui/05-edge-cases.md
  - storm/structure/08-design-system.md
---

# M3 Edge Cases — History Tape (HE-series)

> **Scope:** these edge cases are about the **tape's own** behaviour — what gets recorded, how a long
> entry renders inside the narrow glass panel, the empty/many states, the clear/independence semantics,
> and motion/responsive handling. They do **NOT** re-test M1 arithmetic (`01-calculation-engine`
> E-001..E-060, frozen green at REVIEW-PASS) or M2 keypad/readout edges (`02-calculator-ui`
> UE-001..UE-055, REVIEW-PASS). Where an M1/M2 case produces a state the tape must *react to*, the row
> references it (e.g. *"engine latches error E-001; the tape must NOT record"*) without re-testing the
> upstream behaviour itself.
>
> Each row is a **discrete REVIEW test scenario** (`HE` = History Edge case). "Expected handling"
> states what the tape must do; "Ties to" names the contract fact (`INT-M3-N` / `F-M3-N` /
> `D-M3-DM-N`), design rule (`08-design-system §N`), accessibility clause, or upstream case the row
> enforces. M3's set is **deliberately small** — it has one panel, one in-memory array, one recording
> predicate. No padding (CP-13 YAGNI).

---

## Long-entry display approach — decided (HE-001..HE-004, OQ-M3-5 resolved)

**Approach: wrap by default; if a single unbreakable token (a long unspaced number) still overflows the
panel width, that line becomes per-line horizontally-scrollable, right-anchored.** Never truncate /
ellipsize an expression or result — the same "no data loss" trust principle M2 honoured for the readout
(M2 D-006: shrink→scroll, never hide digits). The tape font is **fixed** at Inter `0.875rem`
(F-M3-6 design-lock) — unlike the M2 readout it does **not** auto-shrink (the tape is a list of many
small lines; per-line font-shrinking would make the list jitter and break `tabular-nums` alignment
across rows). Instead: the **expression** (which contains spaces — `12 + 3`) wraps naturally; a long
**result** with no break opportunity (a 21-digit integer or `1.23e+30`) gets `overflow-x: auto` on its
own line, right-anchored so the least-significant digits + exponent + sign stay in view. `tabular-nums`
(F-M3-6) holds throughout. This resolves **OQ-M3-5**.

> **Decision D-M3-EC-01 — long tape entry = wrap, then per-line right-anchored horizontal scroll for an
> unbreakable token; never truncate/ellipsize; tape font stays fixed (no auto-shrink).** Mirrors M2
> D-006's no-data-loss intent, adapted to a fixed-font list. See `_decisions.md`.

---

## 1. Long expression / long result in the narrow panel (OQ-M3-5)

Panel is ~240px wide (desktop side) / ~140px tall (phone stacked), both scrollable (F-M3-5).

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-001 | **Full-precision repeating result.** `1 ÷ 3 =` records a long precision string as the result (engine emits it, E-048; M2 already renders it, UE-004). | Tape stores the result string as-is (no re-round, F-M3-4); the result line wraps or, if an unbreakable run overflows ~240px, scrolls horizontally right-anchored. No digit lost. | OQ-M3-5, D-M3-EC-01, F-M3-4, E-048 |
| HE-002 | **Exponential result.** A recorded result is `1.23e+30` (engine E-007; M2 UE-003). | The `e+NN` suffix is never clipped — same wrap→right-anchored-scroll path keeps the exponent visible. | OQ-M3-5, D-M3-EC-01, E-007 |
| HE-003 | **Long expression operand.** Expression is e.g. a 21-digit accumulator `+ 3` → `123…(21 digits) + 3`. | Expression wraps within the panel (it has spaces around the glyph as natural break points); no truncation. Result on its own line below/beside per `04-ui` layout. | OQ-M3-5, D-M3-EC-01, E-036 |
| HE-004 | **Negative long result — sign stays visible.** A recorded result is a long negative value (engine E-041). | The leading true-minus `−` is part of the right-anchored view; sign never dropped on scroll. | OQ-M3-5, D-M3-EC-01, E-041 |

---

## 2. Recording predicate — what enters the tape, what never does (INT-M3-1)

The recording predicate (cited, not restated): `prevState.pendingOperator !== null` AND
`nextState.errorState === null` AND `nextState.justEvaluated === true`. The predicate **is** the filter;
exclusions below are automatic, **not** special-cased (INT-M3-1, `06-tech-choices §1`).

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-005 | **Error never recorded.** `5 ÷ 0 =` → engine latches `divide-by-zero` (E-001); M2 shows "Cannot divide by zero" (UE-008). | `nextState.errorState !== null` → predicate **false** → **no tape entry**. The calculator shows the error; the tape is untouched (no entry, no `id` consumed). | INT-M3-1, F-M3-1, E-001, UE-008 |
| HE-006 | **Overflow never recorded.** A calc overflows (E-006; M2 UE-009 "Number too large"). | Same as HE-005 — error state gates it out; tape untouched. | INT-M3-1, E-006, UE-009 |
| HE-007 | **Repeated equals records exactly ONE entry.** `3 + 4 = = =`. | First `=`: predicate true → ONE entry `"3 + 4" = "7"`. Each later `=`: `prevState.pendingOperator === null` (already cleared) → predicate **false** → no entry. Tape holds exactly one row. Coheres with M2 repeat-animation guard (UE-047). | INT-M3-1, F-M3-2 lifecycle, E-022/D-017, UE-047 |
| HE-008 | **Bare equals with nothing pending records nothing.** `5 =` (no operator pressed). | `prevState.pendingOperator === null` → predicate **false** → no entry. | INT-M3-1 |
| HE-009 | **Chained calc records the final binary step (expected, NOT a bug).** `12 + 3 + 4 =`. | At the final `=`, immediate-execution M1 has `prevState = {accumulator:15, pendingOperator:add, entryBuffer:4}` → tape records **`"15 + 4" = "19"`**, not `"12 + 3 + 4"`. This is standard basic-calculator behaviour and is in-scope; REVIEW must verify it reads as `15 + 4 = 19` and treat that as PASS, not a defect. | INT-M3-4, `01-data-model §3` |
| HE-010 | **Digit-after-equals adds no entry.** `3 + 4 = 5` (engine starts fresh entry `5`, E-038; M2 UE-055). | No equals fired on the genuine path for the `5` keypress → predicate not evaluated as true → **no new entry**. Only equals records (F-M3-1). | INT-M3-1, F-M3-1, E-038 |
| HE-011 | **Operator-first implicit-0 records faithfully.** `+ 3 =` (engine commits implicit `0` accumulator, E-015; M2 UE-033). | `prevState = {accumulator:0, pendingOperator:add, entryBuffer:3}` → records `"0 + 3" = "3"`. The implicit-0 operand the engine created is shown as-is. | INT-M3-1, INT-M3-2, E-015, UE-033 |

---

## 3. Empty tape (fresh load + post-clear)

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-012 | **Fresh load — empty tape.** Page mount: `tape = []` (`01-data-model §4`). | The panel renders its empty state cleanly (placeholder text or designed empty per `04-ui`) — no broken/blank box, no `0`-height collapse, no stray border. | F-M3-2, `01-data-model §4`, `04-ui` (empty state) |
| HE-013 | **Post-AC — empty tape re-renders.** After AC clears the tape (HE-018). | The same empty state re-renders; the panel does not leave a stale last entry or a half-cleared row. | `01-data-model §4`, `04-ui` |

---

## 4. Many entries (long session)

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-014 | **Long session → long tape, scrolls, no eviction.** Dozens of completed calculations. | Unbounded `push`; the panel scrolls (desktop side / phone capped-height). **No eviction** — every completed calc stays reachable (no-data-loss, D-M3-DM-03). Newest stays at the visible edge (F-M3-5). | D-M3-DM-03, F-M3-5, OQ-M3-4 (resolved unbounded) |
| HE-015 | **Newest entry stays at the visible edge after append.** A new equals appends while the tape is scrolled. | New line lands at the visible edge (slides in from the top per F-M3-7); the view shows the newest entry, not a stale scroll position that hides it. | F-M3-5, F-M3-7, `01-data-model §2` (newest-edge = render concern) |
| HE-016 | **No layout break under a tall tape.** Many entries push panel content height past the panel box. | Overflow is absorbed by the panel's own scroll — it does **not** stretch the page, push the calculator off-centre, or break the `app-layout` flex (the slot is `flex-shrink:0`, F-M3-8). | F-M3-5, F-M3-8 |

---

## 5. Glyph & numeric faithfulness in rendered entries

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-017 | **Operator glyph is true Unicode.** A recorded subtract/multiply/divide expression. | Expression uses the inherited `OPERATOR_TO_GLYPH` (F-M3-9): `−` U+2212 / `×` U+00D7 / `÷` U+00F7 / `+` U+002B — never ASCII `- x /`. Subtract is the real minus, not a hyphen. | F-M3-9, INT-M3-2, `01-data-model §3` |
| HE-018b | **Decimal result renders faithfully.** A recorded result like `3.5` or `0.5`. | The decimal point + digits render exactly as `getDisplayValue(nextState)` produced; M3 does not reformat (F-M3-4). `tabular-nums` keeps digit columns aligned across rows. | F-M3-4, F-M3-6 (`tabular-nums`), INT-M3-2 |

---

## 6. Clear & independence semantics (AC vs CE vs typing — INT-M3-1, lifecycle)

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-018 | **AC clears the tape.** User presses AC (`Esc` / All-Clear). | `tape = []`; empty state re-renders (HE-013). AC is the baseline tape-clear (`03-modules.md:82`, `01-data-model §4`). Whether a *dedicated* "clear history" control also exists is OQ-M3-1 (`04-ui`); if added it runs the same `tape = []`. | `01-data-model §4`, OQ-M3-1, E-033 |
| HE-019 | **CE does NOT clear the tape.** User presses CE (clear-entry). | **No-op on the tape** — CE resets M2's current entry buffer only; no completed calc is added or removed. The tape persists in full. | INT-M3-1, `01-data-model §4` (CE row) |
| HE-020 | **Typing a new number adds no entry.** User types digits (no equals). | **No tape change** — only equals on the genuine path records (F-M3-1). The tape is independent of the live M2 readout. | F-M3-1, INT-M3-1 |
| HE-021 | **AC during an error clears both error and tape.** Calculator is in a latched error (HE-005); user presses AC. | AC → `initialState()` clears M2's error state (M2 UE-022) **and** `tape = []` clears the tape. After AC: clean `0` readout + empty tape. | `01-data-model §4`, E-033, UE-022 |

---

## 7. Motion & reduced-motion (F-M3-7)

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-022 | **Slide-in motion present (default user).** New entry appended, no reduce-motion. | New line slides in from the top edge, `180ms ease-out`, gently pushing older entries down (F-M3-7). The keyed list (`HistoryEntry.id`, D-M3-DM-02) matches DOM nodes so only the new line animates, not the whole list. | F-M3-7, D-M3-DM-02 |
| HE-023 | **`prefers-reduced-motion: reduce` → instant, no transform.** OS reduce-motion on. | The slide-in is dropped to instant — no translate/transform; the entry simply appears at the visible edge. `@media (prefers-reduced-motion: reduce)` is the primary mechanism (matches M2 UE-044). | F-M3-7, §7/§8, UE-044 |

---

## 8. Responsive switch mid-session (F-M3-5, ~640px breakpoint)

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-024 | **Resize across ~640px keeps entries intact.** User resizes desktop→phone (side→stacked) or back, mid-session, with a populated tape. | All entries survive the layout switch (the data is in the module array, independent of layout, `01-data-model §2`); the panel re-lays-out (side glass ↔ stacked capped-height) and stays scrollable. No entry lost, no duplicate, no layout break. | F-M3-5, F-M3-8, `01-data-model §2` |
| HE-025 | **Newest-edge preserved across the switch.** After a responsive switch, the newest entry. | Newest stays at the visible edge in both layouts (F-M3-5); the switch does not scroll the view to a stale position hiding the latest entry. | F-M3-5, F-M3-7 |

---

## 9. Accessibility of the tape (craft floor, C3)

| # | Scenario | Expected handling | Ties to |
|---|---|---|---|
| HE-026 | **Tape text clears contrast over glass, both token sets.** Expression `--text-secondary` / result `--text-primary` over the glass-on-gradient panel. | Both clear WCAG AA (≥4.5:1) at the worst gradient point in light and dark token sets (M3 authors token-agnostic, like M2). Secondary is the dimmer of the two — it is the row to verify. | §8 (contrast), F-M3-6, §3 |
| HE-027 | **`aria-hidden` removed when the tape is populated.** The reserved slot ships `aria-hidden="true"` (F-M3-8). | M3 removes `aria-hidden` when it populates the slot so SR users reach the tape; the panel has an appropriate region/label so it is announced as history, not stray text. | F-M3-8, §8 (semantics) |
| HE-028 | **Scroll region is keyboard-reachable when it overflows.** The tape panel scrolls (HE-014). | When content overflows, the scroll container is keyboard-focusable/scrollable (conditional `tabindex` pattern, mirroring the M2 REVIEW scroll-region fix) so a keyboard-only user can read a long tape; no focus trap. | §8 (focus/scroll), F-M3-5 |

---

## Coverage note (anti-padding, CP-13 YAGNI)

28 HE rows across 9 categories — each a genuine tape-specific RECORD / RENDER / CLEAR / LAYOUT / A11Y
scenario. None re-tests M1 math (E-001..E-060, frozen) or M2 keypad/readout (UE-001..UE-055,
REVIEW-PASS); upstream cases appear only as *triggers* the tape reacts to. The count reflects honest
breadth of a small read-only in-memory tape's edges — one panel, one array, one predicate — not
padding. Each row names a concrete assert + the contract/design/a11y rule it enforces, so REVIEW can
execute it as a test.

---

## Decisions logged this file

| ID | Decision | Authority |
|---|---|---|
| D-M3-EC-01 | Long tape entry = **wrap by default; per-line right-anchored horizontal scroll for an unbreakable token; never truncate/ellipsize; tape font stays fixed (no auto-shrink)**. Resolves OQ-M3-5; mirrors M2 D-006's no-data-loss intent adapted to a fixed-font list. | CP-7 technical |

---

## Open questions resolved / deferred from here

- **OQ-M3-5 (long entry in narrow panel)** — **resolved** as D-M3-EC-01 above.
- **OQ-M3-4 (length cap)** — already resolved unbounded in `01-data-model §5` (D-M3-DM-03); HE-014
  enforces it at the edge-case level (no eviction).
- **OQ-M3-1 (clear UX: AC-only vs dedicated control)** — HE-018 fixes the *data* fact (AC → `tape = []`);
  the *affordance* choice stays `04-ui`'s. Not decided here.
- **OQ-M3-2 (entry layout: one-line vs two-line)** — referenced (HE-001/HE-003 mention "own line"); the
  layout choice is `04-ui`'s. These rows hold for either layout.
