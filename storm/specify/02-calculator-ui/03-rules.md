---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_briefing.md
  - storm/specify/02-calculator-ui/01-data-model.md
  - storm/structure/08-design-system.md
  - storm/specify/01-calculation-engine/03-rules.md
---

# M2 UI Rules — Rendering + Input-Binding Behaviour Contract

> This file is M2's **canonical, testable rule statement**. Every rule is numbered `UR-NNN` ("UI
> Rule") and phrased so a REVIEW check (manual or automated) can verify PASS/FAIL against it.
>
> **Scope boundary — read first.** These are **NOT arithmetic rules.** M1 owns all computation,
> chaining, precedence, decimal entry, divide-by-zero, overflow, error latching, and value
> normalization (`01-calculation-engine/03-rules.md` R-001..R-027). M2 **never re-states, overrides,
> or duplicates** those. M2 rules govern only three things: **(a) rendering** the held `EngineState`
> to pixels, **(b) binding** input (click + keyboard) to the M1 reducer calls, and **(c) the craft
> floor** (accessibility, contrast, tokens, responsiveness) the rendered surface must clear. Where a
> rule references engine behaviour, it does so as a *consumer* (e.g. "render the error sentence" — the
> error itself is M1's, the sentence is M2's). Field/function names match the verified M1 contract in
> `_briefing.md` and the derivations in `01-data-model.md` exactly.

---

## §1 — Primary display rendering (INT-2, F9; data-model §3.1)

**UR-001** The primary display renders the result of `getDisplayValue(state)`, then maps the result
through the M2-owned tag→sentence table (UR-002). M2 calls `getDisplayValue` once per render and
renders its return value; M2 **never computes** the displayed number itself (F2).

**UR-002** When `getDisplayValue(state)` returns an `ErrorTag`, M2 renders the M2-owned sentence, not
the raw tag (INT-2, D-M2-DM-02):

| `getDisplayValue(state)` returns | Primary display renders |
|---|---|
| a numeric string (e.g. `"42"`, `"-2"`, `"3.5"`) | the string verbatim |
| `'divide-by-zero'` | **`Cannot divide by zero`** |
| `'overflow'` | **`Number too large`** |

The branch is on the two `ErrorTag` literals (exhaustive `switch` over M1's imported union), **not**
on "does the string look non-numeric" (data-model §3.1).

**UR-003** The primary display is **right-aligned** (`08-design-system.md:82,117`).

**UR-004** Display digits use `font-variant-numeric: tabular-nums` so digits do not horizontally jitter
as the value changes (`08-design-system.md:82`). Verifiable: typing `111` then `888` must not shift
glyph x-positions.

**UR-005** The display renders correctly across all four engine conditions, each a derivation of the
single held state (no separate display field):

| State condition | What the primary display shows |
|---|---|
| **Fresh** (`initialState()` — `entryBuffer === "0"`) | `0` |
| **Mid-entry** (user typing a number) | the live `entryBuffer` string (e.g. `3.5`) |
| **Result** (`justEvaluated === true`) | the resolved value string from `getDisplayValue` |
| **Error** (`errorState !== null`) | the UR-002 sentence (`Cannot divide by zero` / `Number too large`) |

M2 does not store which condition is active — each is read from the held `EngineState` at render
(data-model §2, §3).

---

## §2 — Pending-expression line rendering (INT-3, F9; data-model §3.2)

**UR-006** Above the primary display, M2 renders a **secondary pending-expression line**, smaller per
the typographic hierarchy (`08-design-system.md:117`). Its content is **M2-derived** — M1 exposes no
helper (INT-3); M2 reads `accumulator` + `pendingOperator` directly off the held state.

**UR-007** The pending line content, when shown, is `<accumulator> <glyph>` — the accumulator rendered
via `Decimal.toString()` (a read, not arithmetic — F2) followed by the operator glyph from the
operator→glyph map (UR-013). Example: after `12 +`, the line shows `12 +`.

**UR-008** The pending line is **shown only when** `accumulator !== null` **AND** `pendingOperator !==
null` **AND** `errorState === null` **AND** `justEvaluated === false` (D-M2-DM-03). It is **hidden**
(renders empty / collapsed) in every other case: fresh state, mid-first-operand entry, post-equals
(`justEvaluated`), and error state. Verifiable per condition:

| Condition | Pending line |
|---|---|
| Fresh (`initialState`) | hidden |
| Mid-first-operand (`accumulator === null`) | hidden |
| Operator pressed (`accumulator !== null`, `pendingOperator !== null`) | shown: `<acc> <glyph>` |
| Post-equals (`justEvaluated === true`) | hidden |
| Error (`errorState !== null`) | hidden |

---

## §3 — Input binding: click ≡ keyboard (INT-1, INT-4; `03-modules.md:67`)

**UR-009** Every interactive control has **exactly one** behaviour, expressed as a single M1 reducer
call. A button **click** and its **keyboard equivalent** dispatch the **same** call with the same
arguments — they are two input paths into one handler, never two code paths (`03-modules.md:67`). The
canonical control→call table:

| Control | M1 reducer call |
|---|---|
| Digit `0`–`9` | `inputDigit(state, '<d>')` where `<d>` is the single char |
| Decimal `.` | `inputDecimal(state)` |
| Operator `+ − × ÷` | `inputOperator(state, <op>)` where `<op>` ∈ `'add'｜'subtract'｜'multiply'｜'divide'` |
| Equals `=` | `inputEquals(state)` |
| Clear-entry `CE` | `inputClearEntry(state)` |
| All-clear `AC` | `inputAllClear(state)` |

**UR-010** On any input event, M2 follows the reducer contract (INT-1, data-model §1): call the
matching `inputX` with the **current** held state, **replace** the held cell with the return value,
then re-render. M2 never mutates state in place and never short-circuits the engine (e.g. M2 must not
"helpfully" decide a keypress is a no-op — it forwards the whitelisted call and lets M1 decide,
honoring M1's R-006/R-014 latch semantics).

**UR-011** **Keyboard whitelist (INT-4 — buffer-hygiene gate).** The `keydown` handler acts **only**
on keys in the whitelist below; every other key is ignored (no call into M1, no `preventDefault`
beyond what the whitelist needs). Raw `event.key` is **never** forwarded into M1 — each whitelisted
key is mapped to a typed reducer call from UR-009. This prevents a garbage `entryBuffer` that would
make M1's `new Decimal(entryBuffer)` throw.

| `event.key` | Action |
|---|---|
| `'0'`–`'9'` | `inputDigit(state, key)` |
| `'.'` | `inputDecimal(state)` |
| `'+'` | `inputOperator(state, 'add')` |
| `'-'` | `inputOperator(state, 'subtract')` |
| `'*'` | `inputOperator(state, 'multiply')` |
| `'/'` | `inputOperator(state, 'divide')` (call `preventDefault` — `/` triggers Firefox quick-find) |
| `'Enter'` | `inputEquals(state)` |
| `'='` | `inputEquals(state)` |
| `'Escape'` | `inputAllClear(state)` |
| `'Backspace'` | **ignored** (no-op — see UR-012, D-005) |
| anything else | **ignored** |

Verifiable: dispatching a `keydown` for `'a'`, `'F5'`, `'%'`, `'#'`, etc. produces zero change to the
held state and zero call into M1.

**UR-012** **Backspace is a no-op (D-005).** M1 exposes no single-character delete; its only buffer
reset is `inputClearEntry` (whole buffer → `"0"`, R-017). Mapping `Backspace` to CE would surprise the
user (delete-one-char ≠ clear-entry), and a true partial delete would require M2 to mutate
`entryBuffer` and re-inject it — forbidden by INT-4 (M2 must never feed a hand-built buffer string into
M1). Therefore `Backspace` is omitted from the whitelist and does nothing. The productive correction
path is **CE** (clear current entry) or **AC** (full reset). *(See `_decisions.md` D-005.)*

---

## §4 — Operator / key mapping + glyphs (INT-5, F10; data-model §3.3)

**UR-013** M2 holds the bidirectional operator map as a **frozen module constant** (not reactive state
— data-model §3.3). Input direction: keyboard `+ - * /` and the four operator buttons → the `Operator`
union. Glyph direction: `Operator` → the **true-Unicode** display glyph:

| `Operator` | Input key / button | Display glyph | Codepoint |
|---|---|---|---|
| `'add'` | `+` | `+` | U+002B |
| `'subtract'` | `-` | `−` | U+2212 (minus, **not** hyphen `-`) |
| `'multiply'` | `*` | `×` | U+00D7 |
| `'divide'` | `/` | `÷` | U+00F7 |

**UR-014** Operator **button faces** render the true-Unicode glyph `+ − × ÷` (UR-013 glyph column),
**never** the ASCII input keys `+ - * /` (F10, `08-design-system.md:83`). Likewise the pending-line
operator (UR-007) uses the glyph. Verifiable: the rendered DOM text of the subtract button is U+2212,
the multiply button U+00D7, the divide button U+00F7.

**UR-015** `Enter` and `=` are both equals (UR-011); `Escape` is AC (UR-011). These keyboard aliases
are part of the canonical map and must not diverge from their button equivalents (UR-009).

---

## §5 — Error-state UI (INT-2, INT-6; data-model §3.1)

**UR-016** When `errorState !== null`, the primary display shows the UR-002 error sentence and M2
applies an **error visual treatment** (an error CSS class derived from `state.errorState !== null` —
data-model §2). Per design `08-design-system.md:58,72,149`, error text uses `--error`; the state is
conveyed by the **sentence text**, not by color alone (UR-026).

**UR-017** During an error latch, M2 still forwards every whitelisted keypress to M1 (UR-010); M1
no-ops all of digit/decimal/operator/equals (R-014) and only **CE/AC/Esc** escape (R-015, INT-6). M2
does **not** independently disable buttons — it relies on M1's latch — but it **must** keep CE and AC
(and the `Escape` key) visually active and reachable so the productive escape is legible (INT-6): the
user must never be left wondering why keys "do nothing".

**UR-018** When the latch clears (CE or AC, which M1 resets per R-015/R-017/R-018), the error
treatment and the pending line clear **by derivation** on the next render (data-model §4) — M2 stores
no error flag to manually unset.

---

## §6 — Accessibility (craft floor C3; design §8 — NON-NEGOTIABLE)

> These encode `08-design-system.md` §8 as numbered, testable rules. They hold at zero stakes — the
> craft floor does not dial (C3).

**UR-019** Every keypad control is a real **`<button>`** element — never a styled `<div>`/`<span>`.
Buttons are natively keyboard-operable and screen-reader-announced (`08-design-system.md:147`).
Verifiable: every clickable control's tag name is `BUTTON`.

**UR-020** Every button shows a **visible focus ring** = `3px solid var(--accent)` with `3px` offset
(matches the locked v3 baseline `04-ui/_picked.md`; exceeds the `08-design-system.md:145` 2px floor).
`outline: none` is **never** used without an equivalent visible replacement. Verifiable: tab to any
button → a ≥3px accent ring is rendered.

**UR-021** **Focus order follows reading order** across the keypad (`08-design-system.md:145`) —
left-to-right, top-to-bottom, matching DOM source order. No positive `tabindex` reordering. Verifiable:
sequential Tab presses visit buttons in visual reading order.

**UR-022** Every interactive control's hit area is **≥44×44px** (WCAG 2.5.5 floor); the design uses
`≥64×64px` (`08-design-system.md:146`, F8). Verifiable: each button's rendered box ≥44px on both axes.

**UR-023** The display region carries a **live-region role** (e.g. `role="status"` / `aria-live="polite"`)
so screen readers announce result and error changes (`08-design-system.md:147`). Verifiable: the
display container exposes an `aria-live`/`status` semantic; updating the result triggers an SR
announcement.

**UR-024** Operators are distinguished by **glyph + fill, not color alone** (`08-design-system.md:149`):
the true-Unicode glyph (UR-014) plus the `--operator-accent` fill (F8) together identify an operator,
so the distinction survives color-blindness and grayscale.

**UR-025** M2 honors **`prefers-reduced-motion: reduce`** (F11, `08-design-system.md:136,148`): under
that media query, transforms/translates (press-scale, result fade+rise) are dropped and state changes
are instant. Verifiable: with reduced-motion emulated, no transform/translate transition fires.

**UR-026** The product never relies on **color alone** to convey state (`08-design-system.md:149`): the
error state is conveyed by the sentence **text** in the display (UR-002/UR-016), not by a red tint
only.

---

## §7 — Contrast (craft floor C3 / F7; design §8)

**UR-027** Text over glass clears **WCAG AA** at the *worst* point of the gradient under the pane
(`08-design-system.md:144`, F7): the **display number ≥4.5:1**, **large button labels ≥3:1**.
Verifiable in REVIEW with a contrast checker against screenshots, **both** themes (M2 ships default
theme only — UR-029 — but the token set must already satisfy this; M4 dark theme is checked when it
lands).

**UR-028** If any spot fails UR-027 in BUILD/REVIEW, the remedy is **raise the panel alpha** (make the
glass less transparent) **before** darkening the text (`08-design-system.md:144`, F7) — readability
wins over maximum transparency. This is the mandated resolution order, not a free choice.

---

## §8 — Token consumption, not hardcoding (F4; design §3, §44)

**UR-029** All M2 theme-able styles — every color, glass fill, border, accent, operator accent, error
color, gradient — reference **CSS custom properties (design tokens)** from `08-design-system.md` §3,
**never** hardcoded hex/rgba theme literals in M2's rules. This lets M4 swap the whole token set on the
light/dark toggle without touching M2 markup (F4, `08-design-system.md:44,132`; D-003). M2 ships the
**default (light) theme only** — the toggle and the dark token set are M4's (F4). Verifiable: grep M2's
CSS for theme hex/rgba literals outside the token definitions → none in component rules (only
`var(--token)` references).

> Non-theme structural values (grid gap, radius, blur px, motion durations) may be literals or
> structural tokens per the design recipe (`08-design-system.md` §5–§7); UR-029 governs **theme
> colors**, which are the swap surface M4 owns.

---

## §9 — Responsive layout (F3, F8; design §6)

**UR-030** The keypad is a **CSS Grid, 4 columns** (F8, `08-design-system.md:118`); the calculator is
centered on the full-viewport gradient (`08-design-system.md:115`). Equals (and optionally `0`) may
span 2 columns (F8).

**UR-031** The layout **works on phone and desktop** and reflows between them: desktop `max-width:
360px` centered glass panel; phone full-width with `16px` page margin (`08-design-system.md:116`). No
horizontal scroll or clipped buttons at either size. Verifiable: render at ~375px and ~1280px widths →
all controls visible, tappable, unclipped.

**UR-032** The M2 layout **must not preclude M3's history panel** placement (F3,
`08-design-system.md:120`): desktop reserves side-by-side room (history to the side), phone reserves
stacked room (history above/below), switching under ~640px. M2 **does not build** the history panel
(that is M3) — it only lays out so M3 can drop in without restructuring M2's markup. Verifiable: the
calculator container is placed in a layout (flex row on desktop / column on phone) that leaves a
sibling slot, rather than being hard-centered with no room.

---

## §10 — What this file does NOT own

| Topic | Owner |
|---|---|
| All arithmetic, chaining, precedence, decimal entry, div-by-zero, overflow, latch semantics, normalization | M1 `01-calculation-engine/03-rules.md` (R-001..R-027) |
| Held-state shape, derivations, operator-map data, lifecycle | M2 `01-data-model.md` |
| Input *sequencing* / step-by-step user journeys | M2 `02-flows.md` |
| Final pixel layout, mockups, microcopy refinement, exact grid placement | M2 `04-ui.md` (+ mockups) |
| Enumerated UI edge cases (rapid keys, focus-trap, paste, etc.) | M2 `05-edge-cases.md` |
| UI-approach / bundler / CSS / font tech picks | M2 `06-tech-choices.md` + `_decisions.md` (D-001..D-004) |
| Theme toggle + dark token set | M4 (F4) |
| History tape content | M3 (F3) |

---

## Decisions logged this file

| ID | Decision | Authority |
|---|---|---|
| D-005 | `Backspace` key is a **no-op** (omitted from the keyboard whitelist). M1 has no single-char delete and INT-4 forbids M2 re-injecting a hand-built buffer; the correction path is CE/AC. | CP-7 technical |

> D-005 is appended to `_decisions.md` for M2 aggregation. UR-001..UR-032 are concrete consumer rules
> under the orchestrator's pre-approved INT-1..INT-6 framing — no arithmetic rule is restated or
> overridden.
