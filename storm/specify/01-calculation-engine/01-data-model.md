---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: true
storm-depends-on:
  - storm/specify/01-calculation-engine/_briefing.md
  - storm/structure/03-modules.md
---

# M1 Data Model — In-Memory Engine State

> **This is NOT a database schema.** M1 is headless and has no persistence (F8) — its "data model"
> is the **in-memory state shape** the arithmetic core holds while a user builds up a calculation.
> The data-architect hat is explicitly not relevant here (`_briefing.md:47-48`); the working frame
> is *logic correctness*. State is ephemeral: it lives in memory, dies with the tab, and resets on
> reload (F8). This file defines **what fields the engine holds** and **what each transition mutates**.
> User-facing input *sequencing* is `02-flows.md`'s job; arithmetic *rules* are `03-rules.md`'s. Here:
> the shape + the mutations.

---

## 1. The state object (operand/operator running state machine — F7)

A basic calculator is a small state machine: the user types a number, picks an operator, types a
second number, and presses equals. The engine must remember "what's been entered so far" between
keystrokes. The whole of that memory is captured in **one state object** with the fields below.

> **Number representation is deferred.** The fields below say `Number` abstractly. Whether that is a
> native float, a fixed-precision value, or a decimal-library value is a **technical choice made in
> `06-tech-choices.md`**, not here. Where precision or magnitude limits matter, this file states the
> *contract* (e.g. "error state is set when the result is not representable") and defers the concrete
> threshold to tech-choices (OQ1, OQ2). Treat `Number` as "the chosen numeric type" throughout.

| # | Field | Type | Purpose | Initial value |
|---|-------|------|---------|---------------|
| 1 | `entryBuffer` | string | The number the user is **currently typing**, held as a string so leading zeros, a trailing decimal point, and "one decimal only" (F2) can be enforced *during* entry before it becomes a number. This is the "live" operand. | `"0"` |
| 2 | `accumulator` | Number \| null | The **stored / left-hand value** carried across an operator — the running result so far. `null` means "nothing stored yet" (no operation pending or resolved). | `null` |
| 3 | `pendingOperator` | `'add'` \| `'subtract'` \| `'multiply'` \| `'divide'` \| null | The operation **waiting to be applied** between `accumulator` and the next operand. `null` means no operation is pending. | `null` |
| 4 | `justEvaluated` | boolean | True immediately after an **equals** resolved. Distinguishes "the displayed number is a finished result" from "the user is mid-entry" — so the next digit starts a fresh number rather than appending to the result. | `false` |
| 5 | `errorState` | `null` \| an **error value** (see §3) | Encodes a non-computable outcome (divide-by-zero, overflow — F5) as a **defined value the UI can read**. `null` = healthy. When non-null, the engine is "latched" until cleared. | `null` |

**What the engine exposes (read contract for M2).** M2 renders; M1 surfaces (F5). The engine exposes a
**current display value** derived from this state — normally `entryBuffer` (what's being typed) or the
just-resolved result, and when `errorState` is non-null, the error value itself. M1 defines *what* the
display value is; **M1 does not render it** — formatting, glyphs, and the literal error wording are M2's
job. (Negative values are a normal display value, not a special case — see §4.)

---

## 2. State transitions — what each mutates (data level)

Each user action maps to a mutation of the fields above. This section describes **what changes in the
state**, not the keypress wiring (that's M2) nor the ordered user journey (that's `02-flows.md`). The
arithmetic *semantics* of resolving an operation (including operator-chaining — OQ3) live in
`03-rules.md`; here we name only which fields move.

| Transition | Trigger (abstract action) | Effect on state |
|---|---|---|
| **Append digit** | a digit `0–9` entered | If `justEvaluated` is true OR `entryBuffer` is `"0"` → replace buffer with the digit (start fresh). Otherwise append the digit to `entryBuffer`. Clear `justEvaluated`. No-op if `errorState` is set (only clear/AC escapes — §3). |
| **Add decimal point** | `.` entered | Append `.` to `entryBuffer` **only if it has no `.` yet** (enforces F2 — one decimal per number). If `justEvaluated` true, start a fresh `"0."`. No-op if a decimal already present, or if `errorState` is set. |
| **Set operator** | one of `+ − × ÷` chosen | Commit the current `entryBuffer` as an operand; fold it into `accumulator` per the chaining rule in `03-rules.md` (if an operation was already pending, it resolves left-to-right first — OQ3). Store the new `pendingOperator`. Ready `entryBuffer` to receive the next number. Clear `justEvaluated`. No-op if `errorState` is set. |
| **Resolve equals** | `=` / Enter | Apply `pendingOperator` to (`accumulator`, current `entryBuffer`) → produce a result (per `03-rules.md`). On success: result becomes the displayed value and the next `accumulator`/buffer per the flow in `02-flows.md`; set `justEvaluated = true`; clear `pendingOperator`. On failure (div-by-zero / overflow): set `errorState` (§3) instead of a result. No-op if `errorState` already set. |
| **Clear entry (CE)** | clear-current | Reset **only** `entryBuffer` → `"0"`. Leave `accumulator`, `pendingOperator` intact (the operation in progress survives). Clear `justEvaluated`. **Also clears `errorState`** (lets the user recover the current entry without nuking everything). |
| **All-clear (AC)** | clear-all | Reset the **entire** state object to its initial values (the §1 "initial value" column): `entryBuffer = "0"`, `accumulator = null`, `pendingOperator = null`, `justEvaluated = false`, `errorState = null`. This is the full reset (F4). |

> **CE vs AC (F4) — the two distinct behaviours.** Clear-entry is *local* (wipes the number you're
> typing, keeps the pending operation); all-clear is *global* (wipes everything back to a fresh
> calculator). Both clear `errorState`, so the user is never stuck in a latched error — even a single
> clear-entry releases it. Whether the UI offers one button or two (and which is which) is M2's
> concern; M1 only guarantees both behaviours exist.

---

## 3. Error state representation (F5) — the contract

When an operation cannot produce a representable result, the engine does **not** crash and does **not**
return a bogus number. It sets `errorState` to a **defined value** that M2 can detect and render
gracefully (F5: "M1 surfaces, M2 renders").

**The contract:**

- `errorState` is `null` in all healthy states.
- It becomes a **non-null defined error value** in exactly two cases:
  - **Divide-by-zero** — equals (or a chained operator) would divide by a zero operand.
  - **Overflow / non-representable** — the result's magnitude exceeds what the chosen numeric type can
    represent (the concrete threshold is **deferred to `06-tech-choices.md`**, tied to the number-type
    choice — OQ2). The contract is "set `errorState` when the result is not finitely representable",
    not a hard-coded ceiling here.
- The error value is **machine-readable and discriminable** — i.e. the engine distinguishes *which*
  error occurred (e.g. a tagged value / enum like `'divide-by-zero'` vs `'overflow'`) so M2 can choose
  appropriate wording. M1 does **not** define the human-facing message text (that's M2 — F5, no
  rendering here).
- **Latch + escape.** Once `errorState` is non-null, digit / decimal / operator / equals transitions
  are no-ops (see §2) — the engine is latched. The **only** escape is clear-entry or all-clear (§2),
  both of which reset `errorState` to `null`. This guarantees the user can always recover.

---

## 4. Decimal, negatives, precision — state-level notes

- **One decimal per number (F2).** Enforced in the *string* `entryBuffer` at the "add decimal point"
  transition (§2) — the buffer rejects a second `.`. Holding the live operand as a string (not a
  number) during entry is *why* this is cleanly enforceable.
- **Negative values allowed (F6).** Negatives are a **normal value**, not a special state — they arise
  as the result of subtraction (e.g. `3 − 5 = −2`). `accumulator`, the result, and the display value
  may all be negative; no extra field is needed. (Note: M1's scope has **no ± sign-toggle key** — F9;
  negatives only *arise from arithmetic*, they are not directly enterable. Sign-toggle is explicitly
  out of scope.)
- **Precision / rounding (OQ1).** How many significant digits a result carries before rounding, and the
  rounding mode, depend on the numeric type and are **deferred to `06-tech-choices.md`**. The state model
  only guarantees `accumulator` and the result hold "the chosen numeric type"; it does not fix precision
  here. (The *visible* precision a user sees may be a light taste call — flagged to the orchestrator, not
  decided in this file.)

---

## 5. No persistence (F8) — ephemerality is part of the model

The entire state object lives **only in memory**. There is:

- no serialization, no `localStorage`, no DB, no cookie, no URL state;
- no cross-session or cross-tab carry-over;
- a full reset to the §1 initial values on every page load — equivalent to an automatic all-clear at
  startup.

This is not an omission to revisit — it is the deliberate model (F8; `03-modules.md:55`). History
recording is **M3's** concern and is also ephemeral; M1 holds none of it (F10).

---

## Dependencies & deferrals (summary)

- **Number type, precision, rounding mode, overflow threshold** → `06-tech-choices.md` (OQ1, OQ2).
- **Operator-chaining arithmetic semantics** (left-to-right, no precedence — OQ3) → `03-rules.md`.
- **Ordered input → compute → result/error journeys** → `02-flows.md`.
- **Enumerated edge cases** (e.g. operator pressed first, equals with no pending op, repeated equals) →
  `05-edge-cases.md`.
- **All rendering, button wiring, error message wording** → M2 (out of scope here).
