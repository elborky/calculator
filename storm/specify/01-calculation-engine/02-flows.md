---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: true
storm-depends-on:
  - storm/specify/01-calculation-engine/_briefing.md
  - storm/specify/01-calculation-engine/01-data-model.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
---

# M1 Flows — Input → Compute → Result / Error Sequences

> **Scope:** Logic-level sequences only — NO DOM, NO button wiring, NO rendering (M2 owns all of
> that). M1 is a headless engine; "input" below means an abstract action delivered to the engine
> (digit value, operator kind, equals signal, clear signal). The engine's state fields are defined
> in `01-data-model.md` §1; arithmetic rules and edge-case enumeration live in `03-rules.md` and
> `05-edge-cases.md` respectively. This file cross-references those — it does not duplicate their
> content.
>
> **Notation.** State after each step is written as:
> `[entryBuffer | accumulator | pendingOperator | justEvaluated | errorState]`
> Initial / healthy state: `["0" | null | null | false | null]`

---

## 1. Digit-entry flow — building the current operand

Digits `0–9` accumulate in `entryBuffer` (a string, per D-002). The string model enforces
"one decimal per number" (F2) and leading-zero hygiene without parsing the number prematurely.

### 1.1 Straight digit sequence (no prior operator)

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 0 | Initial state | — | `["0" \| null \| null \| false \| null]` |
| 1 | Digit `2` | `entryBuffer` replaced (was `"0"`) | `["2" \| null \| null \| false \| null]` |
| 2 | Digit `5` | Digit appended | `["25" \| null \| null \| false \| null]` |
| 3 | Digit `0` | Digit appended | `["250" \| null \| null \| false \| null]` |

**Leading-zero rule:** if `entryBuffer` is exactly `"0"` and a non-zero digit arrives, the buffer
is **replaced**, not appended (`"0" + "5"` → `"5"`, not `"05"`). If the digit is `0` and the buffer
is already `"0"`, it remains `"0"` (no-op append). This keeps the entry human-readable.
→ Full enumeration: `05-edge-cases.md` (leading-zero cases).

### 1.2 Decimal point entry (F2 — one per number)

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 1 | `.` entered | No `.` in buffer → append | `["0." \| null \| null \| false \| null]` |
| 2 | Digit `3` | Append | `["0.3" \| null \| null \| false \| null]` |
| 3 | `.` entered again | `.` already present → **no-op** | `["0.3" \| null \| null \| false \| null]` |
| 4 | Digit `5` | Append | `["0.35" \| null \| null \| false \| null]` |

Guard: before appending `.`, check `entryBuffer.includes('.')`. If true → silently ignore.
→ Rule authority: `03-rules.md` (decimal-entry rule). Edge cases: `05-edge-cases.md`.

### 1.3 Digit after `justEvaluated = true` (fresh start)

When the user has just received a result (equals resolved), the next digit must **start a new
number**, not append to the displayed result.

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 0 | Post-equals state | Result `42` displayed | `["42" \| 42 \| null \| true \| null]` |
| 1 | Digit `7` | `justEvaluated` true → buffer **replaced**, `justEvaluated` cleared | `["7" \| null \| null \| false \| null]` |

Note: `accumulator` is also cleared here because there is no pending operator — the user is
starting fresh. If an operator *were* pending (chaining flow, §3), accumulator would survive and
hold the result; only `entryBuffer` resets. See §3 for the chaining path.

---

## 2. Operator-set flow — F1 (add / subtract / multiply / divide)

Setting an operator commits `entryBuffer` as a value and registers `pendingOperator`. Operator
chaining (operator pressed while one is already pending) auto-resolves the previous operation
left-to-right before storing the new operator — this is the defining behaviour of a **basic
(non-scientific) calculator** (OQ3, resolved; rule authority → `03-rules.md`).

### 2.1 First operator in a fresh sequence

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 0 | Entry `["5" \| null \| null \| false \| null]` | — | — |
| 1 | Operator `+` | Parse `entryBuffer` → `5`; store in `accumulator`; set `pendingOperator = 'add'`; reset `entryBuffer = "0"`; clear `justEvaluated` | `["0" \| 5 \| 'add' \| false \| null]` |

The engine is now in an **operator-pending** state, waiting for the right-hand operand.

### 2.2 Operator chaining — left-to-right, no precedence

A **basic calculator** applies one operator at a time, strictly left-to-right. There is no
operator precedence — `2 + 3 × 4` evaluates as `(2 + 3) × 4 = 20`, not `2 + (3 × 4) = 14`.
When a second operator is pressed while one is pending, the engine resolves the pending operation
**first**, stores the result, then registers the new operator.

**Example: `2 + 3 ×`**

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 0 | Entry `2` | — | `["2" \| null \| null \| false \| null]` |
| 1 | `+` | Commit `2` → `accumulator`; set `pendingOperator = 'add'`; `entryBuffer = "0"` | `["0" \| 2 \| 'add' \| false \| null]` |
| 2 | Entry `3` | Append | `["3" \| 2 \| 'add' \| false \| null]` |
| 3 | `×` (new operator while one pending) | **Auto-resolve:** `accumulator + entryBuffer` → `2 + 3 = 5`; result becomes new `accumulator`; set `pendingOperator = 'multiply'`; `entryBuffer = "0"`; `justEvaluated = false` | `["0" \| 5 \| 'multiply' \| false \| null]` |

Step 3 is the chaining step. The engine does NOT wait for `=` — pressing a new operator is
equivalent to pressing `=` followed immediately by the new operator. The left-to-right resolution
is mandatory for correctness as a basic calculator.
→ Rule authority: `03-rules.md` (chaining rule). Edge cases: `05-edge-cases.md`.

### 2.3 Operator pressed with no prior entry (no left-hand operand)

If `accumulator` is `null` and `pendingOperator` is `null` (engine is at initial state or after
AC) and an operator is pressed before any digit, the engine has no left-hand value to bind. The
conventional treatment: treat the current `entryBuffer` value (`"0"`) as the implicit left-hand
operand — i.e. store `0` in `accumulator` and register the operator. This produces sensible
behaviour (e.g. `+ 5 =` yields `5`).
→ Edge-case authority: `05-edge-cases.md` (operator-first variant).

---

## 3. Equals flow — F3 (resolving the pending operation)

`=` (or Enter) resolves the pending operation. Two sub-cases: a pending operation exists, or it
does not.

### 3.1 Normal equals resolve

**Continuing the §2.2 example: state `["4" | 5 | 'multiply' | false | null]`, then `=`**

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 0 | State | `5 × …` pending, user typed `4` | `["4" \| 5 \| 'multiply' \| false \| null]` |
| 1 | `=` | Resolve: `5 × 4 = 20`; result `20` becomes `entryBuffer`; `accumulator` is updated per §3.3; clear `pendingOperator`; set `justEvaluated = true` | `["20" \| 20 \| null \| true \| null]` |

The **display value** after equals is `entryBuffer` = `"20"`. `accumulator` is set to `20` so that a
subsequent operator (e.g. `+`) can chain from the result (§3.3).

### 3.2 Equals with no pending operator

If `pendingOperator` is `null` (no operation in progress) when `=` is pressed, there is nothing to
resolve. The engine stays in its current state — `entryBuffer` is unchanged and displayed as-is.
This is a no-op at the logic level (not an error).
→ Edge-case authority: `05-edge-cases.md`.

### 3.3 Post-equals state — accumulator and chaining

After a successful `=`:
- `justEvaluated = true` flags that the displayed number is a **finished result**, not mid-entry.
- The next **digit** clears the result and starts a fresh number (§1.3).
- The next **operator** *chains from the result*: `accumulator` already holds the result; the engine
  sets `pendingOperator` and readies `entryBuffer` for the next input. Importantly, `justEvaluated`
  is cleared by the operator action — the result is now the left-hand operand of a new chain.

| Next action after `= 20` | Behaviour |
|---|---|
| Digit `7` | Start fresh: buffer `"7"`, `accumulator null` (§1.3) |
| Operator `+` | Chain: `pendingOperator = 'add'`, `accumulator = 20`, buffer reset |
| `=` again | No pending op → no-op (displays `20`) |

---

## 4. Clear-entry vs All-clear flows — F4 (two distinct behaviours)

Both clear inputs; they differ in scope. Authoritative rule: `01-data-model.md` §2, §3.

### 4.1 Clear-entry (CE) — local wipe

Clears only `entryBuffer` — the number currently being typed. The pending operation survives.

**Example: mid-calculation, user mis-typed the second operand**

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 0 | Mid-entry | `5 + …`, user typed `99` | `["99" \| 5 \| 'add' \| false \| null]` |
| 1 | CE | Reset `entryBuffer = "0"`; clear `justEvaluated`; **also clear `errorState`** if set | `["0" \| 5 \| 'add' \| false \| null]` |
| 2 | Digit `3` | Enter correct second operand | `["3" \| 5 \| 'add' \| false \| null]` |
| 3 | `=` | Resolve: `5 + 3 = 8` | `["8" \| 8 \| null \| true \| null]` |

CE lets the user correct a mis-typed operand without abandoning the whole calculation.

### 4.2 All-clear (AC) — full reset

Resets the entire state object to initial values. Everything is gone — pending operation, stored
accumulator, error state.

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| Any | AC | Reset all five fields to initial values | `["0" \| null \| null \| false \| null]` |

Equivalent to reloading the calculator. The next action starts from scratch.

### 4.3 CE vs AC decision table

| Situation | CE effect | AC effect |
|---|---|---|
| Mid-entry, no operator yet | Buffer → `"0"`; `accumulator` stays null | Full reset (identical outcome here) |
| Mid-entry, operator pending | Buffer → `"0"`; operator + accumulator survive | Full reset; operator + accumulator gone |
| Error state latched | Clears `errorState`; operator + accumulator survive | Full reset |
| After equals | Buffer → `"0"`; `justEvaluated` cleared | Full reset |

Both CE and AC escape the error-latch state (§5). CE is the lighter escape — the user can recover
the in-progress operation.

---

## 5. Error flow — F5 (divide-by-zero and overflow)

When the engine cannot produce a representable result, it enters a **latched error state** instead
of returning a bogus number or throwing. The error state is a discriminable tagged value (D-003).

### 5.1 Entering the error state

**Example: divide-by-zero**

| Step | Action | Effect | State after |
|------|--------|--------|-------------|
| 0 | — | — | `["0" \| 8 \| 'divide' \| false \| null]` |
| 1 | `=` (right operand is `0`) | `8 ÷ 0` — unresolvable; set `errorState = 'divide-by-zero'` instead of result; **do not** update `accumulator` or `entryBuffer` | `["0" \| 8 \| 'divide' \| false \| 'divide-by-zero']` |

**Example: overflow**

Same structure — if the resolved decimal.js result exceeds the engine's configured precision/
magnitude bound (OQ2, resolved by D-006 / `06-tech-choices.md` §2), the engine sets
`errorState = 'overflow'` instead of storing the non-representable value.

### 5.2 Latched state — no-ops

While `errorState` is non-null, the following transitions become **no-ops** (silently ignored):
- Digit entry
- Decimal-point entry
- Operator entry
- Equals

The engine does not compound a poisoned value by computing further on it. The display value is the
error tag, which M2 renders as a human-readable message.

### 5.3 Escaping the error latch

**Only** CE and AC clear `errorState`. Both are valid escapes; CE is the lighter one.

| Escape action | State after |
|---|---|
| CE | `["0" \| <prior accumulator> \| <prior pendingOperator> \| false \| null]` — clears error and entry; the in-progress operation can resume |
| AC | `["0" \| null \| null \| false \| null]` — full reset |

After escape, the engine is healthy and accepts input normally.

### 5.4 Error state summary

```
Trigger         → errorState tag        → user action → escape
────────────────────────────────────────────────────────────────
÷ 0 via =       → 'divide-by-zero'     → CE or AC    → healthy
÷ 0 via chain   → 'divide-by-zero'     → CE or AC    → healthy
overflow via =  → 'overflow'           → CE or AC    → healthy
overflow via chain → 'overflow'        → CE or AC    → healthy
```

"Via chain" means the resolving step is triggered by a new operator press (§2.2), not `=` — the
error can arise in either path.
→ Rule authority: `03-rules.md` (divide-by-zero rule, overflow rule).
→ Edge-case authority: `05-edge-cases.md` (error-chain scenarios, repeated clear attempts).

---

## 6. Flow interaction map — reading the flows together

The five sections above are individual flow slices. Real use combines them. This map shows the
common compositional paths:

```
[INITIAL STATE]
      │
      ├─ Digit → [§1 Digit-entry]
      │          │
      │          ├─ Operator → [§2 Operator-set]
      │          │              │
      │          │              ├─ Digit → [§1] → Operator → [§2.2 Chain: auto-resolve] → ...
      │          │              │
      │          │              └─ Digit → [§1] → Equals → [§3 Resolve]
      │          │                                            │
      │          │                                            ├─ Error? → [§5 Error-latch]
      │          │                                            │            └─ CE/AC → healthy
      │          │                                            │
      │          │                                            └─ Success → [§3.3 Post-equals]
      │          │                                                          ├─ Digit → fresh [§1]
      │          │                                                          └─ Operator → chain [§2]
      │          │
      │          └─ CE → buffer reset [§4.1] / AC → full reset [§4.2]
      │
      └─ Operator (no prior digit) → [§2.3 implicit 0 left-hand]
```

**Cross-file contract:**
- `01-data-model.md` — the fields this file mutates; the error-latch contract.
- `03-rules.md` — arithmetic semantics for each resolve step (decimal precision, chaining rule,
  divide-by-zero, overflow detection). Flows here describe *when* resolve fires; rules file
  describes *what computation* happens.
- `05-edge-cases.md` — exhaustive enumeration of boundary inputs (operator-first, equals-first,
  double-decimal, repeated-equals, etc.). Flows here show the happy paths and the primary error
  paths; edge cases extend them.
