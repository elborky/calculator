---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: true
storm-depends-on:
  - storm/specify/01-calculation-engine/_briefing.md
  - storm/specify/01-calculation-engine/01-data-model.md
  - storm/specify/01-calculation-engine/03-rules.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
---

# M1 Edge Cases — Enumerated Handling

> **Scope:** headless arithmetic core ONLY — no DOM, no rendering, no key-wiring. Each row is a
> testable Vitest case. UI/rendering concerns (error message wording, button layout, display
> formatting) are M2's job and are **excluded** here. Rules quoted here as "ref: 03-rules.md" are
> delegated to that file; until it is authored, the data-model source of truth is `01-data-model.md`.

---

## How to read this file

Each edge case is a **discrete test scenario**. The "Trigger" column is the abstract action sequence
(not keypress names — those are M2's concern). The "Expected engine behaviour" column states what
the engine's **state object** and **display value** must be after the trigger — in terms the data
model (`01-data-model.md` §1) defines. All arithmetic uses **decimal.js** (`06-tech-choices.md` §2);
"correct result" means decimal.js's output, not IEEE-754's.

Abbreviations: `EB` = `entryBuffer`, `ACC` = `accumulator`, `PO` = `pendingOperator`,
`JE` = `justEvaluated`, `ERR` = `errorState`. "Healthy" = ERR is `null`.

---

## 1. Division and zero-division edges

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-001 | **Divide by zero — explicit** | `5 ÷ 0 =` | `ERR` set to `'divide-by-zero'`; engine latched. Display value = error sentinel. ACC, PO are discarded. Only CE or AC escapes. |
| E-002 | **Divide by zero — chained operator triggers resolve** | `5 ÷ 0 ×` | Same as E-001: the `×` press triggers left-to-right resolution of the pending `÷ 0` before accepting the new operator; resolution fails → `ERR = 'divide-by-zero'`; `×` is not accepted. |
| E-003 | **Divide by zero — decimal zero operand** | `5 ÷ 0.0 =` | `"0.0"` parses to `Decimal('0')` → same div-by-zero outcome as E-001. Zero is zero regardless of decimal notation. |
| E-004 | **Divide positive by itself** | `7 ÷ 7 =` | ERR null; result = `Decimal('1')` (not `1.0000…`). JE true. |
| E-005 | **Divide zero by non-zero** | `0 ÷ 5 =` | ERR null; result = `Decimal('0')`. Not an error — only dividing BY zero is disallowed. |

---

## 2. Overflow and very-large-result edges

> The overflow threshold is decimal.js's configured precision/magnitude bound (D-006, OQ2,
> `06-tech-choices.md §2`). "Exceeds threshold" means a result whose exponent exceeds
> `Decimal.maxE` or whose significant digits exceed `Decimal.precision`, producing a
> non-finite value in decimal.js.

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-006 | **Result exceeds magnitude bound** | Operand at or near `Decimal.maxE` limit × large multiplier = | `ERR` set to `'overflow'`; engine latched. Display value = error sentinel. Escape: CE or AC. |
| E-007 | **Very large but within bound** | `1e15 × 1e15 =` (if within configured precision) | ERR null; result rendered as-is by decimal.js. No error — overflow only fires at the configured magnitude ceiling, not just "big numbers." |
| E-008 | **Chained operations push result over limit mid-chain** | Prior result near overflow × operator → new operand = | If the chained resolve produces a non-finite value → `ERR = 'overflow'`; the new operator is not stored. |

---

## 3. Decimal point entry edges

> `entryBuffer` is a string during entry; `.` is enforced at the string level before parsing (D-002,
> `01-data-model.md §2`).

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-009 | **Second decimal point press — ignored** | `3 . 1 . 4` | EB becomes `"3.14"`. Second `.` is a no-op. Single decimal enforced (F2). |
| E-010 | **Third and subsequent decimal point presses** | `1 . 2 . 3 . 4` | Each `.` after the first is a no-op. EB = `"1.234"`. Idempotent ignore. |
| E-011 | **Leading decimal — e.g. ".5"** | `. 5` (decimal pressed before any digit) | If EB = `"0"` (initial) and a `.` arrives, EB becomes `"0."`. Then `5` → `"0.5"`. Display: `0.5`. (Note: starting with `.` produces a valid `0.` prefix — not a bare `.`.) |
| E-012 | **Trailing decimal — user presses `.` then an operator without a second digit** | `3 . +` | EB = `"3."` when operator is pressed; `"3."` is parsed to `Decimal('3')` for the operand commit. No error — the trailing `.` is silently normalised on parse. |
| E-013 | **Decimal pressed after justEvaluated** | `3 + 4 = .` | JE is true when `=` resolves. The `.` press starts a fresh entry: EB resets to `"0."`, JE cleared. Next digit appends to form `"0.X"`. |
| E-014 | **Decimal pressed while in error state** | (ERR set) `.` | No-op. Engine is latched; `.` is ignored until CE or AC clears `ERR`. |

---

## 4. Operator pressed before any operand / repeated operator presses

> These concern what the engine does when an operator arrives in unusual states. The left-to-right
> chaining rule means any operator press resolves a pending operation first (ref: 03-rules.md).

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-015 | **Operator pressed as very first input** | `+ 3 =` | No operand has been entered yet; ACC is null, EB = `"0"`. Pressing `+` commits `"0"` as the first operand (ACC = Decimal(0)), sets PO = 'add'. User then enters `3 =` → result = `3`. Treat "operator first" as "0 OP …". |
| E-016 | **Operator repeated — same operator** | `5 + +` | The second `+` press: current EB (`"5"`) was already committed to ACC on the first `+`; the second `+` finds EB still at its post-commit reset. Treat as an **operator swap** — PO stays `'add'`. No double-apply. |
| E-017 | **Operator swap — different operator** | `5 + ×` | First `+` committed `"5"` to ACC, set PO = 'add'. `×` arrives before a second operand → swap: PO changes from 'add' to 'multiply'. No arithmetic resolved yet (the second operand hasn't been entered). |
| E-018 | **Operator after operator after partial operand** | `3 + 5 ×` | Left-to-right chaining: `×` press triggers resolve of pending `3 + 5 = 8` first (ACC = 8), then PO = 'multiply'. Next operand will multiply 8. |
| E-019 | **Operator pressed in error state** | (ERR set) `+` | No-op. Engine latched. |

---

## 5. Equals key edges

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-020 | **Equals with no pending operation** | `7 =` | ACC is null, PO is null. `=` has nothing to resolve. Engine treats this as identity: result = current EB parsed as a number (i.e. `7`). JE set true. No error. |
| E-021 | **Equals immediately at startup** | `=` (fresh state) | EB = `"0"`, ACC = null, PO = null. Same as E-020 with operand = `0`. Result = `0`, JE = true. |
| E-022 | **Repeated equals — re-apply last operation** | `3 + 4 = =` | First `=`: `3 + 4 = 7`, JE true. Second `=`: re-applies last operator (`+`) with last right-hand operand (`4`) to the current result (`7`) → `7 + 4 = 11`. JE true. Each subsequent `=` re-applies the same pair. (D-009 — see §9.) |
| E-023 | **Equals in error state** | (ERR set) `=` | No-op. Engine latched. |
| E-024 | **Equals resolving to exactly zero** | `5 - 5 =` | ERR null; result = `Decimal('0')`. Not an error — zero is a valid result; only dividing BY zero is the error (E-001). |

---

## 6. Operator chaining (left-to-right, no precedence)

> Basic calculator model: no operator precedence. All pending operations resolve left-to-right
> on each new operator press or equals (ref: 03-rules.md; OQ3 resolved as left-to-right — `_briefing.md`).

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-025 | **Multi-operator chain** | `2 + 3 × 4 =` | `2 + 3` resolves to `5` when `×` is pressed (left-to-right); then `5 × 4 = 20`. Result = `20`, not `14` (no precedence). |
| E-026 | **Long chain, all same operator** | `1 + 1 + 1 + 1 =` | Each `+` resolves prior: `1+1=2`, `2+1=3`, `3+1=4`. Result = `4`. |
| E-027 | **Mix of operators all resolving left-to-right** | `10 ÷ 2 + 3 =` | `10 ÷ 2 = 5` on `+` press; `5 + 3 = 8` on `=`. |

---

## 7. Clear-entry (CE) and All-clear (AC) from various states

> `01-data-model.md §2` defines the exact field mutations for each; this table tests the
> **state context** from which each is invoked.

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-028 | **CE mid-first-operand** | `1 2 3 CE` | EB reset to `"0"`. ACC still null, PO still null, JE false. ERR null (no change). The incomplete first operand is gone. |
| E-029 | **CE after operator set** | `5 + CE` | PO = 'add', ACC = 5 survive. EB reset to `"0"`. User can now type a new second operand. |
| E-030 | **CE mid-second-operand** | `5 + 9 8 CE` | Same as E-029 — EB back to `"0"`, pending `+` and ACC = 5 survive. |
| E-031 | **CE when justEvaluated** | `3 + 4 = CE` | EB reset to `"0"`, JE cleared. ACC / PO are whatever they are post-equals (engine implementation detail — ref 02-flows.md). ERR null. |
| E-032 | **CE escapes error latch** | (ERR set) `CE` | ERR → null. EB reset to `"0"`. ACC, PO survive if they existed before the error. Engine healthy again. (D-003, `01-data-model.md §3`) |
| E-033 | **AC from mid-expression** | `5 + 9 AC` | Full reset: EB = `"0"`, ACC = null, PO = null, JE = false, ERR = null. Fresh calculator. |
| E-034 | **AC escapes error latch** | (ERR set) `AC` | Full reset (same as E-033). ERR → null. No partial state survives. |
| E-035 | **AC from justEvaluated** | `3 + 4 = AC` | Full reset. JE → false. No "memory" of prior result. |

---

## 8. Digit entry and long-operand edges

> `entryBuffer` is a string; decimal.js parses it on commit. No separate digit-count limit is
> imposed at the engine level — entry length is a display/UX concern for M2 (e.g. display truncation).
> The engine will parse whatever string is committed. Overflow only fires on the *result* (§2 above).

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-036 | **Long operand within decimal.js precision** | Entry of 20+ digit integer within decimal.js's configured precision | Parsed as a `Decimal` value correctly; no engine error. If the operand itself exceeds the configured precision, the overflow case (E-006) applies on commit/resolve. |
| E-037 | **Leading zero suppression** | `0 0 7` | First `0` at startup: EB = `"0"` (initial). Second digit `0`: EB = `"0"` (a second leading zero is not appended to `"0"` — replace, not append). `7`: replaces `"0"` → EB = `"7"`. Result: `"7"`, not `"007"`. (`01-data-model.md §2` — "If `entryBuffer` is `"0"` → replace buffer with the digit.") |
| E-038 | **Digit entry after justEvaluated** | `3 + 4 = 5` | JE is true after `=`. Digit `5` arrives: fresh entry — EB = `"5"`, JE cleared. Previous result is discarded from entry (ACC also reset for a fresh chain — ref 02-flows.md for exact post-equals ACC state). |
| E-039 | **Zero entry** | `0 =` | EB = `"0"`, ACC null, PO null. `=` is identity → result = `Decimal('0')`. No error, no special treatment. JE true. |
| E-040 | **Digit entry in error state** | (ERR set) `5` | No-op. Digit ignored until CE or AC clears ERR. |

---

## 9. Negative result edges

> Negatives arise from subtraction only (F6). There is no ± sign-toggle (F9 — explicitly out of scope).

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-041 | **Simple negative result** | `3 - 5 =` | Result = `Decimal('-2')`. ERR null. Display value is `-2`. JE true. |
| E-042 | **Negative result as left-hand operand in next chain** | `3 - 5 = + 10 =` | After first `=`: result = `-2`, JE true. `+` commits the result as new ACC (`-2`), PO = 'add'. `10` entered, `=` → `-2 + 10 = 8`. Correct — negative accumulator is a normal value. |
| E-043 | **Subtraction through zero** | `1 - 1 - 1 =` | `1 - 1 = 0` on second `-` press; `0 - 1 = -1` on `=`. No error; result = `-1`. |
| E-044 | **Negative × negative** | `3 - 5 = × 3 - 5 = ×` (or equivalent chain) | Not directly enterable from a single equals chain — negatives only arise as results, not typed. Intermediate negative result used as ACC chaining into a multiply: e.g. (`-2`) `×` `(-3)` if engineered through two sessions of subtraction. Result = `6`. No error — decimal.js handles negative × negative correctly. |

---

## 10. Decimal precision — decimal.js correctness guarantee

> These cases confirm that decimal.js (D-006) eliminates the IEEE-754 artifacts the vision's
> "basics are flawless" (`01-vision.md`) forbids.

| # | Edge case | Trigger sequence | Expected engine behaviour (decimal.js) |
|---|---|---|---|
| E-045 | **Classic float artifact** | `0.1 + 0.2 =` | Result = `Decimal('0.3')` exactly. NOT `0.30000000000000004`. (`06-tech-choices.md §2` — Context7-verified: `new Decimal('0.1').plus('0.2').toString() === '0.3'`) |
| E-046 | **Subtraction float artifact** | `0.3 - 0.2 =` | Result = `Decimal('0.1')` exactly. NOT `0.09999999999999998`. |
| E-047 | **Multiplication float artifact** | `0.1 × 0.2 =` | Result = `Decimal('0.02')` exactly. |
| E-048 | **Division with repeating decimal** | `1 ÷ 3 =` | Result = `Decimal('0.3333…')` to decimal.js's configured precision. Finite truncated representation — not an error. Precision digits determined by `Decimal.precision` config (ref: 03-rules.md for the configured value). |
| E-049 | **Chained float operations** | `0.1 + 0.2 - 0.3 =` | Result = `Decimal('0')` exactly. IEEE-754 would give a non-zero near-zero artifact; decimal.js resolves correctly. |

---

## 11. `justEvaluated` flag — fresh-start behaviour matrix

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-050 | **Digit after equals** | `3 + 4 = 5` | See E-038. JE cleared; new number entry starts. |
| E-051 | **Operator after equals** | `3 + 4 = +` | JE true, then `+` arrives. The result (`7`) is committed as the new ACC (carry-forward). PO = 'add'. JE cleared. User continues building expression from the result. |
| E-052 | **Decimal after equals** | `3 + 4 = .` | See E-013. JE true → `.` starts fresh `"0."`. |
| E-053 | **Equals after equals** | `3 + 4 = =` | See E-022. Repeated-equals pattern — re-applies last op + last rhs. |
| E-054 | **CE after equals** | `3 + 4 = CE` | See E-031. EB → `"0"`, JE cleared. |
| E-055 | **AC after equals** | `3 + 4 = AC` | See E-035. Full reset. |

---

## 12. Mixed / compound state edges

| # | Edge case | Trigger sequence | Expected engine behaviour |
|---|---|---|---|
| E-056 | **Error latch is total — all inputs ignored except CE/AC** | (ERR set) any digit / `.` / operator / `=` | All no-ops. Only CE or AC transitions the engine out of the latch. Verified against each action type in the transition table (`01-data-model.md §2`). |
| E-057 | **New calculation immediately after equals without operator** | `3 + 4 = 9 ×` | JE true after `=`. `9` starts a fresh entry (E-038). `×` commits `9` to ACC, PO = 'multiply'. Prior result (`7`) is gone — replaced by a fresh expression. Correct: JE-flag fresh-start behaviour. |
| E-058 | **Operator then CE then equals** | `5 + CE =` | CE resets EB to `"0"`, PO = 'add', ACC = 5 survive (E-029). `=` resolves `5 + 0 = 5`. |
| E-059 | **AC mid-chain, then normal use** | `3 + 4 AC 2 × 3 =` | AC wipes everything (E-033). `2 × 3 =` starts fresh → `6`. No residual from `3 + 4`. |
| E-060 | **Pressing equals only (no digits ever entered)** | `=` (fresh state) | See E-021. Result = `0`, JE true. |
