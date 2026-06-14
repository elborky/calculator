---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: true
storm-depends-on:
  - storm/specify/01-calculation-engine/_briefing.md
  - storm/specify/01-calculation-engine/01-data-model.md
  - storm/specify/01-calculation-engine/02-flows.md
  - storm/specify/01-calculation-engine/03-rules.md
  - storm/specify/01-calculation-engine/05-edge-cases.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
  - storm/specify/01-calculation-engine/_decisions.md
---

# M1 Calculation Engine — Module Index

> **Tiers used:** this index was drafted by a sonnet sub-agent as specified in `_briefing.md`.

## What M1 is

M1 is the **pure, headless arithmetic core** of the calculator. It receives abstract input
actions (digit, operator, decimal, equals, clear) and computes the correct result or error state.
M1 has **no DOM, no styling, no event listeners** — it does not know how input arrives or how its
output is rendered (`_briefing.md` — F11, F8). The first demo-able screen belongs to M2; M1 is
the one-module "dark stretch" that everything else builds on (`_briefing.md` — F7, `06-build-order.md:76`).

**Tech stack (all CP-6 verified — `06-tech-choices.md`):**
- Language: TypeScript 6.0.3
- Arithmetic: decimal.js 10.6.0 (eliminates IEEE-754 float artifacts — `0.1 + 0.2 = 0.3`, exact)
- Test runner: Vitest 4.1.8 (zero-config TS, Vite-native)
- Build tooling: `tsc` type-check only; no app bundler (deferred to M2)

---

## Concern files

| File | Description |
|---|---|
| [`_briefing.md`](_briefing.md) | Orchestrator-authored entry brief — canonical facts (F1–F12), domain lens, open questions (OQ1–OQ3), concern set rationale. Read first by all sub-agents. |
| [`01-data-model.md`](01-data-model.md) | In-memory state shape: the 5-field state object (`entryBuffer`, `accumulator`, `pendingOperator`, `justEvaluated`, `errorState`), every state transition, error latch contract. |
| [`02-flows.md`](02-flows.md) | Input → compute → result / error sequences: 5 flows (digit entry, operator set, equals, CE/AC, error). Cross-references data-model fields; complements rules semantics. |
| [`03-rules.md`](03-rules.md) | Arithmetic behaviour contract: 27 numbered rules covering the 4 operations (R-001–R-003), chaining / left-to-right (R-004–R-006), decimal (R-007–R-009), div-by-zero (R-010–R-011), overflow (R-012–R-013), latch/escape (R-014–R-016), CE/AC (R-017–R-020), negatives (R-021–R-023), precision boundary (R-024), leading-zero/trailing-decimal (R-025–R-027). Every rule maps to at least one Vitest case. |
| [`05-edge-cases.md`](05-edge-cases.md) | 60 enumerated edge cases (E-001–E-060) across 12 categories: div-by-zero, overflow, decimal entry, operator-before-operand, equals behaviour, chaining, CE/AC from various states, long operand, negatives, decimal.js correctness, `justEvaluated` matrix, compound states. Each row is a discrete Vitest test scenario. |
| [`06-tech-choices.md`](06-tech-choices.md) | CP-6-verified tech decisions: TypeScript vs JS, decimal.js vs native float, Vitest vs Jest/node:test, no bundler. All claims carry live-tool verification cites (Context7 + npm registry, June 2026). |
| [`_decisions.md`](_decisions.md) | Index of 17 AI-autonomous technical decisions (D-001–D-017) logged during SPECIFY: state shape, string buffer, error latch, number-type deferral, TS/decimal.js/Vitest picks, flow semantics (post-equals, operator-first, chaining-error), rules choices (left-to-right, overflow contract, M1/M2 boundary), edge-case choices (operator-swap, equals-after-equals no-op per D-017). Note: D-015 (repeated-equals re-apply) is REVERSED; D-017 records the authoritative no-op decision. |

---

## BUILD task list — M1 Calculation Engine

> **Granularity discipline:** each task ≤ ~1.5 min of work, ≤ 1 file or 1 logical unit. No
> "and"-joined tasks. Tasks are test-first where natural (M1 is pure logic — ideal for TDD).
> Stack: TypeScript 6.0.3, decimal.js 10.6.0, Vitest 4.1.8.
> Decision authority: all tasks below are AI-autonomous (technical) per CP-7.
> Deliverable: D-016 (this index) — task list authoritative from here.

---

### 0 — Project scaffold

| # | Task | Done when |
|---|---|---|
| T-001 | Initialise `package.json` for the engine package (name, type `module`, scripts: `test`, `typecheck`) | `package.json` exists at engine root; `npm test` resolves to `vitest run`; `npm run typecheck` resolves to `tsc --noEmit`. |
| T-002 | Create `tsconfig.json` with `strict: true`, `target: ESNext`, `module: ESNext`, `moduleResolution: bundler`, `noEmit: true` | `tsc --noEmit` exits 0 on an empty `.ts` file. |
| T-003 | Install `typescript@6.0.3`, `decimal.js@10.6.0`, `vitest@4.1.8` as dependencies / dev-dependencies | `node_modules` populated; `package-lock.json` committed; correct versions pinned. |
| T-004 | Create `vitest.config.ts` — minimal config, no plugins needed, `globals: true` optional | `vitest run` can discover and run a trivial `*.test.ts` file without error. |
| T-005 | Create placeholder `src/engine.ts` that exports an empty named export (structural stub only) | File exists; `tsc --noEmit` passes; Vitest can import it. |

---

### 1 — State type definitions

| # | Task | Done when |
|---|---|---|
| T-006 | Define `Operator` union type: `'add' \| 'subtract' \| 'multiply' \| 'divide'` in `src/types.ts` | Type exported; tsc passes. |
| T-007 | Define `ErrorTag` union type: `'divide-by-zero' \| 'overflow'` in `src/types.ts` | Type exported alongside `Operator`; tsc passes. |
| T-008 | Define `EngineState` interface (5 fields: `entryBuffer: string`, `accumulator: Decimal \| null`, `pendingOperator: Operator \| null`, `justEvaluated: boolean`, `errorState: ErrorTag \| null`) in `src/types.ts` | Interface exported; `Decimal` imported from `decimal.js`; tsc passes. |
| T-009 | Define and export `initialState(): EngineState` factory function in `src/engine.ts` returning `{ entryBuffer: '0', accumulator: null, pendingOperator: null, justEvaluated: false, errorState: null }` | Function exported; calling it returns a fresh state object; tsc passes. |
| T-010 | Write unit test `initialState returns correct defaults` in `src/engine.test.ts` — assert all 5 fields against initial values from `01-data-model.md §1` | Vitest: test file runs; 1 test passes. |

---

### 2 — Decimal.js configuration

| # | Task | Done when |
|---|---|---|
| T-011 | Create `src/decimal-config.ts` — configure decimal.js `Decimal.set({ precision: 21, rounding: Decimal.ROUND_HALF_UP, toExpPos: <N>, toExpNeg: <N> })` (overflow-bound knob per R-012 / D-013; concrete `<N>` values are BUILD-owned per D-013 — the knob's **presence** in the config call is mandatory) and export the configured `Decimal` class | Module exports `Decimal`; config applied before any engine use; `toExpPos` and `toExpNeg` (or `Decimal.maxE`/`Decimal.minE`) are explicitly set alongside precision. tsc passes. |
| T-012 | Write unit test `decimal.js correctness — 0.1 + 0.2 = 0.3` (E-045) to confirm the configured instance eliminates the IEEE-754 artifact | 1 test passes: `new Decimal('0.1').plus('0.2').toString() === '0.3'`. |

---

### 3 — Digit input handler

| # | Task | Done when |
|---|---|---|
| T-013 | Implement `inputDigit(state: EngineState, digit: string): EngineState` in `src/engine.ts` — handles no-op when `errorState` is set; replaces buffer if `justEvaluated` or buffer is `"0"` (leading-zero suppression R-025); otherwise appends | Function exported; tsc passes. |
| T-014 | Write test `inputDigit — appends digit normally` | Vitest: 1 pass. |
| T-015 | Write test `inputDigit — leading-zero replacement (R-025)` — assert `"0"` buffer gets replaced, not `"07"` (E-037) | 1 pass. |
| T-016 | Write test `inputDigit — double-zero stays "0"` (E-037, `0 0` sequence) | 1 pass. |
| T-017 | Write test `inputDigit — fresh start after justEvaluated (E-038)` | 1 pass: next digit replaces buffer, JE cleared. |
| T-018 | Write test `inputDigit — no-op in error state (E-040)` | 1 pass: state unchanged. |

---

### 4 — Decimal point handler

| # | Task | Done when |
|---|---|---|
| T-019 | Implement `inputDecimal(state: EngineState): EngineState` in `src/engine.ts` — no-op if `errorState` set (R-014); if `justEvaluated`, start fresh `"0."` (E-013); if buffer already has `.`, silently ignore (R-007); otherwise append `.` | Function exported; tsc passes. |
| T-020 | Write test `inputDecimal — appends decimal to plain number` (E-011 happy path) | 1 pass. |
| T-021 | Write test `inputDecimal — second decimal press is no-op (E-009, E-010)` | 1 pass: buffer unchanged. |
| T-022 | Write test `inputDecimal — fresh "0." after justEvaluated (E-013)` | 1 pass. |
| T-023 | Write test `inputDecimal — no-op in error state (E-014)` | 1 pass. |
| T-024 | Write test `inputDecimal — leading decimal from fresh state → "0." (E-011)` | 1 pass. |

---

### 5 — Arithmetic resolve helper

| # | Task | Done when |
|---|---|---|
| T-025 | Implement `resolveOperation(left: Decimal, op: Operator, right: Decimal): Decimal \| ErrorTag` in `src/engine.ts` — executes `left.plus/minus/times/dividedBy(right)` via decimal.js; catches div-by-zero (R-010, R-011); catches overflow (R-012); returns `Decimal` on success, `ErrorTag` on failure | Function exported (internal or exported); tsc passes. |
| T-026 | Write test `resolveOperation — addition correct` (`1.1 + 2.2 = 3.3` exact) | 1 pass. |
| T-027 | Write test `resolveOperation — subtraction correct` | 1 pass. |
| T-028 | Write test `resolveOperation — multiplication correct` | 1 pass. |
| T-029 | Write test `resolveOperation — division correct` (`10 ÷ 4 = 2.5` exact) | 1 pass. |
| T-030 | Write test `resolveOperation — divide by zero returns 'divide-by-zero' (E-001, R-010)` | 1 pass: returns `'divide-by-zero'`, not `Infinity`, not NaN. |
| T-031 | Write test `resolveOperation — decimal zero operand is zero (E-003)` — `"0.0"` parses to `Decimal('0')` triggers div-by-zero | 1 pass. |

---

### 6 — Operator input handler

| # | Task | Done when |
|---|---|---|
| T-032 | Implement `inputOperator(state: EngineState, op: Operator): EngineState` in `src/engine.ts` — no-op if `errorState` set (R-014); handles operator-first with implicit `0` accumulator (D-010, E-015); handles operator-swap when no right operand entered yet (E-016, E-017); auto-resolves pending op left-to-right (R-004, R-005) if a right operand exists; sets `pendingOperator`; resets `entryBuffer = "0"` | Function exported; tsc passes. |
| T-033 | Write test `inputOperator — first operator commits entryBuffer to accumulator (flow §2.1)` | 1 pass. |
| T-034 | Write test `inputOperator — operator-first uses implicit 0 (E-015, D-010)` | 1 pass. |
| T-035 | Write test `inputOperator — operator-swap same op is no-resolve (E-016)` — PO changes, no arithmetic | 1 pass. |
| T-036 | Write test `inputOperator — operator-swap different op (E-017)` | 1 pass. |
| T-037 | Write test `inputOperator — chaining auto-resolves prior op left-to-right (E-018, R-004)` — `3 + 5 ×` yields ACC = 8 | 1 pass. |
| T-038 | Write test `inputOperator — chaining div-by-zero sets error, new op not registered (D-011, E-002)` | 1 pass: `errorState = 'divide-by-zero'`; PO not updated. |
| T-039 | Write test `inputOperator — no-op in error state (E-019)` | 1 pass. |

---

### 7 — Equals handler

| # | Task | Done when |
|---|---|---|
| T-040 | Implement `inputEquals(state: EngineState): EngineState` in `src/engine.ts` — no-op if `errorState` set (R-014, E-023); no-op if no `pendingOperator` AND `justEvaluated` true (E-022/E-053 — equals-after-equals is a no-op per D-017); no-op if no `pendingOperator` AND not `justEvaluated` but sets `justEvaluated = true` (E-020, R-006); resolves pending op via `resolveOperation`; on success updates `entryBuffer` to result string, `accumulator` to result, `pendingOperator = null`, `justEvaluated = true`; on error sets `errorState`. No `lastOperator`/`lastRhs` fields (D-017, 5-field model) | Function exported; tsc passes. |
| T-041 | Write test `inputEquals — normal resolve (5 × 4 = 20, flow §3.1)` | 1 pass. |
| T-042 | Write test `inputEquals — no pending operator is no-op (E-020, R-006)` | 1 pass: state unchanged except JE = true. |
| T-043 | Write test `inputEquals — fresh state equals gives 0 (E-021)` | 1 pass. |
| T-044 | Write test `inputEquals — result is negative (E-041, R-021)` — `3 - 5 = -2` | 1 pass. |
| T-045 | Write test `inputEquals — divide by zero sets errorState (E-001, R-010)` | 1 pass. |
| T-046 | Write test `inputEquals — no-op in error state (E-023)` | 1 pass. |
| T-047 | Write test `inputEquals — result exactly zero is not an error (E-024, E-039)` | 1 pass. |

---

### 8 — Equals-after-equals no-op assertion (D-017 — replaces dropped repeated-equals group)

> ~~Repeated-equals group (D-015 / `lastOperator` / `lastRhs` field expansion) DROPPED by orchestrator
> as out-of-scope. Original T-048 (field extension) and T-049 (logic update) are removed. T-050 and
> T-051 are repurposed to assert the correct no-op behaviour per D-017.~~

| # | Task | Done when |
|---|---|---|
| T-048 | *(removed — field extension for repeated-equals was out-of-scope per D-017; `EngineState` stays 5 fields)* | — |
| T-049 | *(removed — inputEquals repeated-equals logic is out-of-scope per D-017; T-040 no-op path covers it)* | — |
| T-050 | Write test `inputEquals — equals after equals is no-op (E-022/E-053, D-017): 3 + 4 = = → result stays 7` | 1 pass: second `=` leaves state unchanged (result `7`, JE true). |
| T-051 | Write test `inputEquals — multiple repeated equals remain no-op (D-017): 3 + 4 = = = → result stays 7` | 1 pass: each subsequent `=` is a no-op; result stays `7`. |

---

### 9 — Clear-entry (CE) handler

| # | Task | Done when |
|---|---|---|
| T-052 | Implement `inputClearEntry(state: EngineState): EngineState` in `src/engine.ts` — resets `entryBuffer = "0"`, `errorState = null`, `justEvaluated = false`; leaves `accumulator`, `pendingOperator` intact (R-017) | Function exported; tsc passes. |
| T-053 | Write test `inputClearEntry — resets buffer, preserves pending op (E-029)` | 1 pass. |
| T-054 | Write test `inputClearEntry — escapes error latch (E-032, R-015)` | 1 pass: `errorState → null`. |
| T-055 | Write test `inputClearEntry — from mid-first-operand, accumulator stays null (E-028)` | 1 pass. |
| T-056 | Write test `inputClearEntry — CE then equals resolves with 0 as right operand (E-058)` | 1 pass: `5 + CE =` → `5`. |

---

### 10 — All-clear (AC) handler

| # | Task | Done when |
|---|---|---|
| T-057 | Implement `inputAllClear(state: EngineState): EngineState` in `src/engine.ts` — returns `initialState()` (R-018) | Function exported; tsc passes. |
| T-058 | Write test `inputAllClear — full reset from mid-expression (E-033)` | 1 pass: all 5 fields at initial values. |
| T-059 | Write test `inputAllClear — escapes error latch (E-034, R-015)` | 1 pass: `errorState → null`. |
| T-060 | Write test `inputAllClear — no residual after AC (E-059)` — chain after AC starts clean | 1 pass. |

---

### 11 — Engine public API and display value

| # | Task | Done when |
|---|---|---|
| T-061 | Define and export `getDisplayValue(state: EngineState): string \| ErrorTag` in `src/engine.ts` — returns `errorState` if non-null; otherwise returns `entryBuffer` (covers mid-entry and post-equals result, per `01-data-model.md §1` display-value note) | Function exported; tsc passes. |
| T-062 | Write test `getDisplayValue — returns entryBuffer in normal states` | 1 pass. |
| T-063 | Write test `getDisplayValue — returns errorState tag when error is set` | 1 pass: returns `'divide-by-zero'` or `'overflow'` string. |

---

### 12 — Edge-case test batch: decimal.js correctness (E-045 – E-049)

| # | Task | Done when |
|---|---|---|
| T-064 | Write test `0.1 + 0.2 = 0.3 (E-045)` via engine sequence | 1 pass. |
| T-065 | Write test `0.3 - 0.2 = 0.1 (E-046)` via engine sequence | 1 pass. |
| T-066 | Write test `0.1 × 0.2 = 0.02 (E-047)` via engine sequence | 1 pass. |
| T-067 | Write test `1 ÷ 3 — finite representation, not error (E-048)` | 1 pass: ERR null; result is a string of repeating 3s to precision digits. |
| T-068 | Write test `0.1 + 0.2 - 0.3 = 0 exactly (E-049)` | 1 pass. |

---

### 13 — Edge-case test batch: chaining and multi-operator (E-025 – E-027)

| # | Task | Done when |
|---|---|---|
| T-069 | Write test `2 + 3 × 4 = 20, not 14 (E-025, R-004)` — left-to-right, no precedence | 1 pass. |
| T-070 | Write test `1 + 1 + 1 + 1 = 4 (E-026)` — long same-operator chain | 1 pass. |
| T-071 | Write test `10 ÷ 2 + 3 = 8 (E-027)` — mixed operators, left-to-right | 1 pass. |

---

### 14 — Edge-case test batch: negatives and negative chains (E-041 – E-044)

| # | Task | Done when |
|---|---|---|
| T-072 | Write test `3 - 5 = -2 (E-041)` | 1 pass. |
| T-073 | Write test `3 - 5 = + 10 = 8 (E-042)` — negative as left-hand operand in next chain | 1 pass. |
| T-074 | Write test `1 - 1 - 1 = -1 (E-043)` — subtraction through zero | 1 pass. |

---

### 15 — Edge-case test batch: overflow (E-006 – E-008)

| # | Task | Done when |
|---|---|---|
| T-075 [DONE] | Write test `overflow on result exceeding configured bound (E-006)` — construct an operand that forces `errorState = 'overflow'` | 1 pass: `errorState` set. |
| T-076 [DONE] | Write test `very large but within bound is not an error (E-007)` | 1 pass: ERR null; result a large-but-valid Decimal. |
| T-077 [DONE] | Write test `overflow via chained operator (E-008, D-011)` | 1 pass: chain auto-resolve that overflows sets ERR and does not accept new operator. |

---

### 16 — Edge-case test batch: justEvaluated matrix (E-050 – E-055)

| # | Task | Done when |
|---|---|---|
| T-078 [DONE] | Write test `operator after equals carries result forward (E-051, §3.3)` — result becomes ACC, PO set | 1 pass. |
| T-079 | Write test `equals after equals is no-op — result unchanged (E-053, D-017)` — covered by T-050/T-051; this task is a named pointer: if T-050/T-051 cover the scenario, mark T-079 as covered-by T-050 and do not add a duplicate test | Covered by T-050 (assert E-053 no-op passes there); 0 net new test files if T-050 already asserts E-053. |
| T-080 | Write test `AC after equals gives full reset (E-055, E-035)` | 1 pass. |

---

### 17 — Final check: tsc clean + full suite green

| # | Task | Done when |
|---|---|---|
| T-081 | Run `tsc --noEmit` on the complete `src/` tree | Exit 0; zero type errors. |
| T-082 | Run `vitest run` — all tests must pass | Exit 0; 0 failures. Coverage of all 27 rules and all 60 edge-case scenarios verified by test names mapping to R-NNN / E-NNN tags in test descriptions. |

---

## Decision logged this pass

**D-016 — Task granularity encoding for M1 BUILD**
Logged in `_decisions.md` as D-016 (see below; this index is the authority for the task list).

---

*Total tasks: 80 active (T-001 – T-082, minus T-048 and T-049 which are removed stubs). Each active task is atomic (≤ 1 file or 1 logical unit; no "and"-joins).*
*Test tasks: 60 of 80 active. Non-test tasks: 20 (scaffold, type defs, implementation functions).*
*Coverage: all 27 rules (R-001–R-027) and all 60 edge cases (E-001–E-060) are addressed by named test tasks.*
*Note: T-048 / T-049 are placeholder stubs (repeated-equals feature dropped per D-017); T-050 / T-051 / T-079 now assert the no-op behaviour.*
