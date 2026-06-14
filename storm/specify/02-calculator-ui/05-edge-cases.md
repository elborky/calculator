---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_briefing.md
  - storm/specify/02-calculator-ui/01-data-model.md
  - storm/structure/08-design-system.md
  - storm/specify/01-calculation-engine/05-edge-cases.md
---

# M2 Edge Cases — Rendering, Input & Layout (UE-series)

> **Scope:** M2 is a **view+input layer** (F1, F2). These edge cases are about **rendering the
> result correctly, accepting input safely, and laying out the keypad** — NOT arithmetic. M1's 60
> arithmetic edge cases (`01-calculation-engine/05-edge-cases.md`, E-001..E-060) are **already proven
> green at REVIEW-PASS** and are **NOT re-tested here**. Where an M1 case produces a state M2 must
> render, the row references it as *"engine handles X (E-0NN); M2 must render the result of X
> correctly"*. M2 never recomputes (F2) — it renders `getDisplayValue(state)` + the M2-derived
> pending line (INT-2, INT-3).
>
> Each row is a **discrete REVIEW test scenario** (`UE` = UI Edge case). "Behavior" states what M2
> must do; "Ties to" names the design-system rule (`08-design-system.md §N`), accessibility clause,
> or M1 contract (INT-N / E-0NN) the row enforces. Both theme references mean the default theme's two
> live token states (light tokens §3.1 / dark tokens §3.2); M2 ships one theme (F4) but authors styles
> token-agnostic, so a row asserting "both themes" verifies the token-swap target M4 will exercise.

---

## Long-number display approach — decided (D-006, see end of file)

**Approach: auto-shrink font (measure-and-step-down) → horizontal-scroll fallback. Never truncate /
ellipsize a numeric result.** A calculator silently hiding digits is a correctness/trust failure on
the product's one quality axis. The display already uses `clamp(2.5rem, 12vw, 4rem)` (§4); on overflow
M2 measures the rendered text width against the panel and steps the font-size down to a floor
(`~1.25rem`); if the value still overflows at the floor, the display line becomes
horizontally-scrollable (overflow-x, right-anchored so the least-significant digits and any exponent
stay visible). `tabular-nums` (§4) holds throughout — digits never jitter. Error **sentences** (which
are text, not numbers) may wrap to a 2nd line OR shrink, but never scroll (no precision to lose).

---

## 1. Long-number display (engine emits up to ~21 sig-digits + exponent; M2 renders)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-001 | **Result wider than display panel — many integer digits.** Engine returns e.g. a 21-digit integer within precision (engine handles via E-036). | M2 auto-shrinks the display font toward the floor so the whole number fits; never truncates/ellipsizes. `tabular-nums` preserved. | §4 (`tabular-nums`, `clamp`), D-006, E-036 |
| UE-002 | **Result still overflows at the font-size floor.** Value too long even at `~1.25rem`. | Display line becomes horizontally scrollable (overflow-x), right-anchored so least-significant digits + sign stay in view. No digit hidden permanently. | §6 (display panel), D-006 |
| UE-003 | **Exponential / scientific notation result.** decimal.js emits a value with an exponent (e.g. `1.23e+30`) within bound (engine handles E-007). | M2 renders the full exponent string faithfully via the same shrink→scroll path; the `e+NN` suffix is never clipped off. | §4, D-006, E-007 |
| UE-004 | **Long repeating-decimal result.** `1 ÷ 3 =` → decimal.js precision-truncated string (engine handles E-048). | M2 renders the full precision string as-is; shrink/scroll applies if it overflows. M2 does not re-round (F2). | §4, F2, E-048 |
| UE-005 | **Negative long result — sign must stay visible.** Long negative value (engine handles E-041). | The leading `−`/`-` sign is part of the right-anchored scroll view; shrink keeps it visible when possible. Sign never dropped. | §4, D-006, E-041 |
| UE-006 | **Display returns to normal size after a short value.** Long value shrank the font; next entry is short. | Font-size resets to the `clamp()` default for the short value — shrink is per-render, not sticky. | §4, D-006 |
| UE-007 | **Long mid-entry operand (not yet a result).** User types a 20+ digit operand; `getDisplayValue` returns the live `entryBuffer` (engine handles E-036). | Same shrink→scroll treatment applies to in-progress entry, not only to results. | §4, D-006, E-036 |

---

## 2. Error rendering (M1 surfaces tag; M2 renders sentence — INT-2)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-008 | **Divide-by-zero error renders.** Engine latches `'divide-by-zero'` (E-001); `getDisplayValue` returns the tag. | M2 renders **"Cannot divide by zero"** (D-M2-DM-02), not the raw tag, branching on the `ErrorTag` literal. | INT-2, E-001, D-M2-DM-02 |
| UE-009 | **Overflow error renders.** Engine latches `'overflow'` (E-006). | M2 renders **"Number too large"** (D-M2-DM-02). | INT-2, E-006, D-M2-DM-02 |
| UE-010 | **Error sentence fits the display panel.** Both sentences are short, but the panel is narrow on small phones. | Error text fits via shrink/wrap (wrap to 2 lines allowed for sentences); never overflows the glass panel edge or gets clipped. | §6, §8 (readability), D-006 |
| UE-011 | **Error styling is visibly distinct.** `state.errorState !== null` applied as a CSS class at render (derived, not stored). | Display shows error styling using `--error` (§3.1/§3.2) so the user sees it's an error state, not a number. Distinction is not color-alone — it's also the *sentence text* (§8). | INT-6, §8 ("don't rely on color alone"), §3 |
| UE-012 | **Error text clears `--error` contrast bar in both themes.** `--error` is `#d63031` (light) / `#ff7675` (dark). | Error sentence holds WCAG AA against the glass-over-gradient backdrop at the worst gradient point, both token sets. | §8 (contrast ≥4.5:1), §3.1/§3.2 |
| UE-013 | **Pending line hidden during error.** INT-3 / D-M2-DM-03: pending line returns `""` when `errorState !== null`. | The secondary pending-expression line is not rendered while latched — the error sentence owns the display. | INT-3, D-M2-DM-03 |
| UE-014 | **Only CE/AC/Esc are productive while latched.** Engine no-ops all other input (E-056). | M2's input layer dispatches the keypress to M1 (which no-ops); display does not change for non-CE/AC keys, so the latch reads as intentional, not broken. CE/AC/Esc visibly clear it. | INT-6, E-056, E-032/E-034 |

---

## 3. Glass readability fallback (`backdrop-filter` unsupported — design §5)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-015 | **`backdrop-filter` unsupported (old browser).** No blur capability. | M2's CSS falls back to the higher-alpha solid-ish fill (`rgba(255,255,255,0.85)` light / `rgba(30,30,50,0.85)` dark) via `@supports not (backdrop-filter: blur(1px))`; never transparent-with-no-blur. Text stays legible. | §5 (fallback), §8 (readability) |
| UE-016 | **Display number legible in fallback mode.** Glass blur gone, only solid fill remains. | `--text-primary` on the higher-alpha fallback panel still clears WCAG AA (≥4.5:1) over the gradient. | §8, §5 |
| UE-017 | **`-webkit-backdrop-filter` path (older Safari).** Safari needs the prefixed property. | Both `backdrop-filter` and `-webkit-backdrop-filter` are authored (§5); Safari gets blur, not the fallback. | §5 |

---

## 4. Keyboard edge cases (whitelist + don't hijack browser shortcuts — INT-4)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-018 | **Rapid key mashing.** User hammers digit/operator keys fast. | Each keydown maps to one whitelisted `inputX` call; held state replaced each time (INT-1). No dropped/duplicated state, no buffer corruption — M1 is a pure reducer, M2 just sequences calls. | INT-1, INT-4 |
| UE-019 | **Held-key auto-repeat.** OS fires repeated `keydown` for a held digit. | Each repeat is a normal `inputDigit` call (appends a digit) — acceptable and correct. M2 does not need to debounce; the engine handles each as a discrete digit. | INT-1, INT-4 |
| UE-020 | **Non-whitelisted key ignored.** User presses `a`, `F1`, arrow keys, etc. | Handler whitelists keys; unknown `event.key` is **not** forwarded to M1 (would risk a garbage buffer). The key is a no-op for the calculator; no `preventDefault` on non-whitelisted keys. | INT-4 (buffer hygiene) |
| UE-021 | **`Enter` and `=` both trigger equals.** Two keys, one action. | Both map to `inputEquals(state)` (INT-5/contract table). Equivalent behavior. | INT-5, F1, E-020 |
| UE-022 | **`Esc` triggers All-Clear.** | `Esc` maps to `inputAllClear(state)` → `initialState()` (E-033). Pending line + error styling clear by derivation. | §lifecycle (01-data-model §4), E-033 |
| UE-023 | **Modifier combos NOT hijacked — copy.** User presses `Ctrl/Cmd+C` (e.g. to copy the result). | M2 does **not** `preventDefault` modifier combos; the browser's native copy fires normally. The calculator only claims bare digit/operator/`.`/Enter/=/Esc/Backspace keys. | INT-4, "don't break browser shortcuts" (pre-approved) |
| UE-024 | **Modifier combos NOT hijacked — paste / devtools / reload.** `Ctrl/Cmd+V`, `F12`, `Ctrl/Cmd+R`. | All pass through untouched — handler ignores any event with `ctrlKey`/`metaKey`/`altKey` set (those are not whitelisted bare keys). | INT-4, pre-approved (don't preventDefault everything) |
| UE-025 | **Keyboard + mouse interleaved.** User clicks a digit, then types an operator, then clicks equals. | Both input paths dispatch the same `inputX` reducers against the one held state (INT-1); order is whatever the events arrive in. No path-specific state — click and key are equivalent entry points. | INT-1, F1 |
| UE-026 | **`Backspace`/CE key (if mapped) is whitelisted only as the intended action.** | If a key is bound to CE, it maps to `inputClearEntry`; otherwise Backspace is non-whitelisted and a no-op (no raw forwarding). Exact key→CE binding is `02-flows.md`/`03-rules.md`'s whitelist; this row asserts no raw passthrough. | INT-4 |

---

## 5. Focus / tap edge cases (accessibility §8)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-027 | **Focus ring visible on every button, both themes.** Tab through the keypad. | Each `<button>` shows `2px solid var(--accent)` + `2px` offset on `:focus-visible`; never `outline: none` without replacement. `--accent` chosen visible on both glass themes. | §8 (focus states), §3 |
| UE-028 | **Tap target ≥44px on smallest phone.** 320px-wide viewport. | Buttons stay `≥44×44px` (spec target 64px) even when the grid shrinks to fit 320px; never sub-44px. | §8 (min tap target), §6 |
| UE-029 | **Focus not lost after a press.** User presses a button via keyboard/click. | Focus remains on a sensible element (the pressed button or a stable anchor) after re-render — the imperative `render(state)` must not blow away + recreate focused DOM such that focus is dropped to `<body>`. | §8 (focus states), INT-1 (re-render) |
| UE-030 | **No focus trap.** User can Tab forward and Shift+Tab backward through all buttons and out. | Focus order follows reading order across the 4-col grid (§8); no element traps focus; Tab eventually leaves the keypad. | §8 (focus order) |
| UE-031 | **Buttons are real `<button>` elements.** Screen-reader + keyboard operability. | All keys are semantic `<button>`, not styled `<div>` — keyboard-operable and SR-announced. Display has a live-region role so results are announced. | §8 (semantics) |
| UE-032 | **Focus ring not clipped by glass overflow/border-radius.** Buttons have `border-radius: 16px`. | The `2px` offset ring renders fully outside the rounded button edge and is not clipped by any `overflow: hidden` on the glass body. | §8, §5/§6 |

---

## 6. Pending-expression line edge cases (M2-derived — INT-3, D-M2-DM-03)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-033 | **Operator-first → implicit-0 accumulator.** `+ 3` — engine commits `"0"` as ACC (E-015). | Pending line derives from `accumulator=0`, `pendingOperator='add'` → renders `0 +` (glyph from §3.3 map). Shows the implicit-0 operand the engine created. | INT-3, E-015, D-M2-DM-03 |
| UE-034 | **Operator glyph in pending line is true Unicode.** Pending op is subtract/multiply/divide. | Pending line maps `'subtract'→−` (U+2212), `'multiply'→×` (U+00D7), `'divide'→÷` (U+00F7) — never `- x /`. | F10, INT-5, D-M2-DM-04 |
| UE-035 | **Post-equals operator carries result into pending line.** `3 + 4 = +` — engine carries `7` as new ACC (E-051). | Once the carry happens, pending line shows `7 +`. (At the instant of `=` itself, `justEvaluated` is true → line hidden, UE-036; the line reappears when the next operator commits the carried result.) | INT-3, E-051, D-M2-DM-03 |
| UE-036 | **Pending line hidden right after equals.** `justEvaluated === true` (E-022/E-051 pre-carry). | Pending line returns `""` (D-M2-DM-03 hide condition b) — the result is final, no dangling operator shown. | INT-3, D-M2-DM-03 |
| UE-037 | **Pending line hidden in fresh state.** `initialState()` — ACC null, PO null. | Pending line `""` (hide condition c). Nothing shown above the `0` result. | INT-3, D-M2-DM-03 |
| UE-038 | **Pending line hidden in error state.** Covered by UE-013 but asserted as a derivation row. | `errorState !== null` → pending line `""` (hide condition a). | INT-3, D-M2-DM-03, INT-6 |
| UE-039 | **Accumulator is a `Decimal`, rendered via `.toString()`.** Long or negative accumulator in pending line. | M2 renders `accumulator.toString()` (a read, not arithmetic — F2); a long accumulator in the pending line follows the same legibility constraints as the display (the line is smaller, §6). | INT-3, F2, §6 |

---

## 7. Responsive layout edge cases (design §6)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-040 | **Very narrow viewport — 320px.** Smallest common phone width. | 4-col grid stays usable; buttons stay `≥44px`; calculator takes full width minus the `16px` page margin (§6). No horizontal page scroll, no sub-44px buttons. | §6, §8 (tap target) |
| UE-041 | **Very wide viewport — desktop/ultrawide.** | Calculator body stays `max-width: 360px`, centered both axes (flexbox, `min-height: 100vh`) — does not stretch full-width. Gradient breathing room preserved. | §6 (layout) |
| UE-042 | **Landscape phone (short height).** Wide but low viewport. | Calculator stays centered and fully visible; if height is insufficient, the centered container is reachable (page scrolls to it) rather than clipping the display or bottom button row. | §6 |
| UE-043 | **Layout leaves room for M3 history (not built).** M2 owns keypad+display only (F3); §6 reserves history placement. | M2's centered single-panel layout does not preclude M3's side (desktop) / stacked (phone) history panel — it does not hard-claim the full row/column M3 will use. | F3, §6 (history placement) |

---

## 8. Reduced-motion (design §7, §8)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-044 | **`prefers-reduced-motion: reduce` set.** OS-level reduce-motion on. | `@media (prefers-reduced-motion: reduce)` drops transforms/translates: button-press scale, result fade+rise are removed; state changes are instant. | §7, §8 (reduced motion, not optional) |
| UE-045 | **Reduced-motion read live, not cached.** If any JS animation is ever conditional. | Read `matchMedia('(prefers-reduced-motion: reduce)').matches` at the moment of use; not stored as state (01-data-model §2). The CSS `@media` block is the primary mechanism. | §7, 01-data-model §2 |
| UE-046 | **Motion present when reduce is NOT set.** Default user. | Button press scales `0.96` (80ms); result fades+rises (200ms) per §7 — the premium beat is present for users who allow motion. | §7 |

---

## 9. Rapid / repeated equals (M1 no-ops repeated `=` — E-022/D-017)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-047 | **Repeated `=` is a visual no-op.** `3 + 4 = =` — engine returns unchanged state (E-022, D-017). | M2 must **not** re-fire the result fade+rise animation or double-render on the second (state-unchanged) `=`. Same state in → no visible glitch. | E-022, D-017, §7 |
| UE-048 | **Rapid `=` spam.** User mashes `=` many times after a result. | All but the first are state-unchanged no-ops (E-022); M2 renders identically each time, no animation re-trigger, no flicker. | E-022, INT-1, §7 |
| UE-049 | **Result animation fires once on the real equals.** First `=` of `3 + 4 =` actually changes state. | The fade+rise plays exactly once for the genuine state change (unless reduced-motion, UE-044). | §7, E-020 |

---

## 10. Decimal / edge input rendering (engine normalizes; M2 renders faithfully — F2)

| # | Scenario | Expected M2 behavior | Ties to |
|---|---|---|---|
| UE-050 | **Leading decimal renders `"0."`.** User presses `.` first — engine makes EB `"0."` (E-011). | M2 renders `getDisplayValue` faithfully: `0.` then `0.5` as digits follow. No bare `.`; M2 does not pre-empt or reformat. | F2, E-011, INT-2 |
| UE-051 | **Second decimal point — no visible change.** `3 . 1 . 4` — engine no-ops the 2nd `.` (E-009). | Display shows `3.14`; the ignored 2nd `.` produces no flicker or duplicate dot — M2 just re-renders the (unchanged-by-the-2nd-dot) buffer. | F2, E-009, INT-2 |
| UE-052 | **Multiple operator presses — swap renders.** `5 + ×` — engine swaps PO to multiply (E-017). | Pending line re-renders from `5 ×` after the swap (glyph updates); no double operand, no error. M2 reflects the engine's swapped state. | F2, E-017, INT-3 |
| UE-053 | **Leading-zero suppression renders.** `0 0 7` — engine yields EB `"7"` (E-037). | Display shows `7`, not `007` — M2 renders the engine's suppressed buffer as-is, no client-side zero-stripping of its own (F2). | F2, E-037, INT-2 |
| UE-054 | **Trailing decimal then operator.** `3 . +` — engine holds `"3."` then commits `Decimal('3')` (E-012). | While typing, display shows `3.`; after `+`, pending line shows `3 +` (commit normalized the trailing dot away on the engine side). M2 renders each state faithfully. | F2, E-012, INT-2, INT-3 |
| UE-055 | **Digit after equals starts fresh.** `3 + 4 = 5` — engine resets to fresh entry `"5"` (E-038). | Display jumps from `7` to `5` (fresh entry), pending line hidden (no pending op). M2 renders the fresh-start state; no leftover `7`. | F2, E-038, INT-2, INT-3 |

---

## Coverage note (anti-padding, CP-13 YAGNI)

55 UE rows across 10 categories — each is a genuine RENDER / INPUT / LAYOUT scenario distinct from
M1's arithmetic. No row re-tests engine math (that's E-001..E-060, frozen green). Rows are bounded to
M2's actual surface: one display, one pending line, ~16 buttons, one keyboard handler, one glass
fallback, one responsive grid. The count reflects honest breadth of a small UI's *rendering* concerns,
not padding — each row names a concrete assert + the design/accessibility/contract rule it enforces,
so REVIEW can execute it as a test.

---

## Decision logged this file

| ID | Decision | Authority |
|---|---|---|
| D-006 | **Long-number display = auto-shrink font (measure→step-down to ~1.25rem floor) → horizontal-scroll fallback (right-anchored), `tabular-nums` preserved; never truncate/ellipsize a numeric result.** Error *sentences* may wrap/shrink but not scroll. Rationale: a calculator silently hiding digits is a correctness/trust failure on the product's one quality axis; shrink-then-scroll keeps every digit + exponent + sign reachable. | CP-7 technical |

> Appended to `_decisions.md` as D-006. Concrete sub-choice under the orchestrator's pre-approved
> "M2 renders engine output faithfully" framing (F2, INT-2).
