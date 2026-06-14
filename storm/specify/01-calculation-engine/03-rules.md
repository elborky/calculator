---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: true
storm-depends-on:
  - storm/specify/01-calculation-engine/_briefing.md
  - storm/specify/01-calculation-engine/01-data-model.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
---

# M1 Arithmetic Rules — Authoritative Behaviour Contract

> This file is the **canonical rule statement** for the arithmetic engine. It is testable — every
> numbered rule below maps to one or more unit tests. Cross-references to `01-data-model.md` (fields)
> and `06-tech-choices.md` (decimal.js config) are load-bearing; any change to those files may require
> re-evaluation of the rules here. The input *sequencing* that drives these rules lives in `02-flows.md`;
> the state *fields* that carry the values live in `01-data-model.md`; this file owns the **semantics**.

---

## §1 — The four operations (F1)

**R-001** The engine supports exactly **four arithmetic operations**: addition (`+`), subtraction (`−`),
multiplication (`×`), and division (`÷`). No other operations exist in M1's scope (F9: no percent,
no ±, no scientific functions, no memory keys).

**R-002** Each operation takes two operands: a *left operand* (`accumulator`, or the first number typed)
and a *right operand* (`entryBuffer` converted to the numeric type at evaluation time).

**R-003** Operations are computed using **decimal.js 10.6.0** (`06-tech-choices.md §2`):
- Addition: `left.plus(right)`
- Subtraction: `left.minus(right)`
- Multiplication: `left.times(right)`
- Division: `left.dividedBy(right)` (subject to R-010 for divide-by-zero)

No native IEEE-754 float arithmetic is used for the four operations. This is the correctness guarantee
that makes `0.1 + 0.2 = 0.3` (not `0.30000000000000004`).

---

## §2 — Operator chaining / precedence (OQ3 — resolved)

**R-004 (CANONICAL — OQ3 resolved):** This is a **basic calculator**. It uses **strictly left-to-right
evaluation with NO operator precedence.**

> `2 + 3 × 4 = (2 + 3) × 4 = 20` — not `2 + (3 × 4) = 14`.

When the user enters an operator while a pending operation exists, the engine **resolves the pending
operation first** (left-to-right), makes the result the new `accumulator`, then sets the new operator
as `pendingOperator`. This is the single authoritative chaining rule.

**R-005** Corollary — pressing a second operator without pressing equals first is not an error. It
auto-resolves the previous pending operation (R-004) and seamlessly chains. Example:
- `5 × 3 +` → resolves `5 × 3 = 15`, stores `accumulator = 15`, pending = `+`.

**R-006** Pressing equals with no pending operator (e.g. user presses `=` immediately or after a
previous equals) is a **no-op** — it produces no change to the displayed value and no error. The engine
stays in its current state. Edge cases are fully enumerated in `05-edge-cases.md`.

---

## §3 — Decimal point entry (F2)

**R-007** Each number being entered may contain **at most one decimal point**. The engine enforces this
at the `entryBuffer` string level (`01-data-model.md §1,§4`):
- A decimal point press when `entryBuffer` already contains `.` is **silently ignored** (no error, no
  state change, no visible feedback — the key simply does nothing).

**R-008** If the user presses decimal immediately after an operator or equals (i.e. starting a new
number), the engine starts a fresh `entryBuffer` of `"0."` — producing `0.X` entry semantics. The
leading `0` is structural and not redundant (R-014 below).

**R-009** There is no rule requiring the user to enter a digit before or after the decimal point during
typing. A trailing decimal (e.g. `"3."`) is a valid mid-entry state. When the buffer is committed as an
operand at operator or equals press, a trailing decimal is treated as the integer value (e.g. `"3." →
Decimal('3')`).

---

## §4 — Division by zero (F5)

**R-010** Dividing by zero (right operand = `Decimal('0')`) is a **defined error state**, not a crash
and not JavaScript `Infinity`.

Formally: if `pendingOperator === 'divide'` and `right.isZero() === true`, the engine:
1. Sets `errorState` to the tagged value `'divide-by-zero'`.
2. Does NOT assign any numeric result to `accumulator`.
3. Latches the engine (R-016 below).

**R-011** The engine never returns or exposes a JavaScript `Infinity`, `-Infinity`, or `NaN` through
normal operation paths. These values are caught at the decimal.js boundary and routed to `errorState`
instead. (decimal.js itself does not propagate `NaN` through `.plus/.minus/.times/.dividedBy` on valid
`Decimal` inputs — this guarantee is inherited from the library.)

---

## §5 — Overflow (F5)

**R-012** When a result's magnitude or precision exceeds the configured decimal.js limits, the engine
sets `errorState` to the tagged value `'overflow'` instead of storing the out-of-range result.

**Overflow threshold — configuration contract (OQ2):** The concrete threshold is **not a hard-coded
number in this rules file**. It is determined by the decimal.js `precision` and `toExpPos` / `toExpNeg`
config in the engine's initialisation. The config owner is **M1's implementation** (`06-tech-choices.md
§2`). The rule here is: *any result that decimal.js cannot represent within the configured precision
and exponent range triggers `errorState = 'overflow'`*. Implementation guidance: a `precision` of 21
significant digits (decimal.js default) covers all calculator-relevant values; a display-safe `toExpPos`
cap (e.g. `15`) is a reasonable starting floor — the exact values are a BUILD-time config decision, not
a SPECIFY-time taste call.

**R-013** Negative overflow (result of large magnitude in the negative direction) follows the same rule
as positive overflow — `errorState = 'overflow'`. The `'overflow'` tag does not distinguish sign;
the sign is irrelevant when the value is non-representable.

---

## §6 — Error state latch and escape (F4, F5)

**R-014 (Latch rule):** When `errorState` is non-null, the following inputs are **no-ops** (produce no
state change):
- Any digit `0–9`
- Decimal point `.`
- Any operator `+ − × ÷`
- Equals `=`

The engine is latched until explicitly cleared.

**R-015 (Escape rule):** The **only** transitions that clear `errorState` are:
- **Clear-entry (CE):** resets `errorState = null` AND `entryBuffer = "0"`. Leaves `accumulator` and
  `pendingOperator` intact.
- **All-clear (AC):** resets the entire state to initial values (including `errorState = null`).

The user is never permanently stuck in an error state — both CE and AC provide a path out.

**R-016 (Discriminability):** `errorState` is a tagged value that distinguishes `'divide-by-zero'`
from `'overflow'`. M2 uses this tag to choose the appropriate human-facing message text. M1 does not
define or render message text (F5: "M1 surfaces, M2 renders").

---

## §7 — Clear-entry vs All-clear (F4)

**R-017 (CE — clear-entry):**
- Resets `entryBuffer → "0"`.
- Resets `errorState → null`.
- Sets `justEvaluated → false`.
- **Leaves `accumulator` and `pendingOperator` unchanged.** An in-progress expression (`5 + |`) is
  preserved; the user can re-enter only the current operand.

**R-018 (AC — all-clear):**
- Resets the entire engine state to initial values:
  `entryBuffer = "0"`, `accumulator = null`, `pendingOperator = null`,
  `justEvaluated = false`, `errorState = null`.
- This is a full calculator reset — no memory of any prior expression.

**R-019** Both CE and AC always escape the error latch (R-015). Neither triggers a no-op when
`errorState` is set.

**R-020** The UI-level distinction between one button vs two buttons (a single button that changes
label from "CE" to "AC" depending on state, or two separate buttons) is **M2's concern**, not M1's.
M1 guarantees that **both behaviours are available** as distinct engine actions.

---

## §8 — Negative results (F6)

**R-021** Negative results are **normal values** — they are not special engine states. They arise
naturally from subtraction (e.g. `3 − 5 = −2`). The `accumulator`, result, and the derived display
value may all be negative.

**R-022** M1 has **no ± sign-toggle key** (F9 — explicitly out of scope). Negative values can only
arise from arithmetic results, not from direct entry. A user cannot type a negative number as input;
they can only produce one as an output.

**R-023** Negative results propagate correctly into subsequent chained operations (R-004). Example:
`3 − 5 + 10 = (−2) + 10 = 8`.

---

## §9 — Internal precision boundary (M1 vs M2)

**R-024 (Boundary rule — do not re-litigate downstream):** The engine computes at **decimal.js
precision** (configured at engine init, `06-tech-choices.md §2`). The internal `Decimal` result may
carry up to the configured number of significant digits.

**Display digit count is exclusively M2's concern.** M1 produces a `Decimal` value (or an error tag).
M2 decides how many digits to show (e.g. truncate at 10 significant digits for the display, or use
scientific notation for large values). M1 does not round or format for display — it exposes the full
internal precision value and the `toString()` representation. This boundary is **final**: the
visible-precision residual (OQ1 taste slice) is **deferred to M2 rendering** and must not be
re-relitigated in M1 build tasks.

---

## §10 — Leading-zero and trailing-decimal normalization (entry level)

**R-025 (Leading-zero rule):** `entryBuffer` starts as `"0"`. When the user presses a non-zero digit
while `entryBuffer === "0"`, the zero is **replaced** (not appended), producing `"7"` not `"07"`.
When the user presses `0` while `entryBuffer === "0"`, the buffer stays `"0"` (no double-zero).

**R-026 (Trailing-decimal at commit):** When `entryBuffer` is committed to a `Decimal` value (at
operator press or equals press), a trailing decimal is legal — `"3."` parses as `Decimal('3')`. No
normalization of `entryBuffer` is required prior to commit; `new Decimal(entryBuffer)` handles it.

**R-027 (Leading-zero with decimal):** `"0."` is a valid mid-entry state (e.g. typing `0.5`). The
leading zero is retained in the buffer during entry and displayed as-is. It is NOT suppressed.

---

## §11 — What this file does NOT own

The following are explicitly outside this file's scope — they are owned by the named downstream file
and must not be duplicated here:

| Topic | Owner |
|---|---|
| Input sequencing, user journey flows | `02-flows.md` |
| State field definitions, transition table | `01-data-model.md` |
| Enumerated edge cases (repeated equals, operator-first, etc.) | `05-edge-cases.md` |
| Concrete decimal.js precision/magnitude config values | `06-tech-choices.md §2` |
| Display digit count, formatting, error message wording | M2 (out of M1 scope) |
| History recording | M3 (out of M1 scope) |
| Persistence of any kind | Explicitly prohibited (F8) |
