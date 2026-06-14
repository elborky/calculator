---
storm-phase: build
storm-module: 01-calculation-engine
storm-canonical: true
storm-depends-on:
  - storm/specify/01-calculation-engine/_index.md
---

# M1 Calculation Engine — BUILD Plan

> **Status tracking:** [PENDING] → [IN PROGRESS] → [DONE]
> Derived from `storm/specify/01-calculation-engine/_index.md` (D-016 authority).
> Each task executed by a forked sonnet sub-agent. Orchestrator updates status.
> Source: `src/` at project root.

---

## Group 0 — Project scaffold

| # | Task | Status |
|---|---|---|
| T-001 | Init `package.json` (name, type module, test/typecheck scripts) | [DONE] |
| T-002 | Create `tsconfig.json` (strict, ESNext, moduleResolution:bundler, noEmit) | [DONE] |
| T-003 | Install `typescript@6.0.3`, `decimal.js@10.6.0`, `vitest@4.1.8` | [DONE] |
| T-004 | Create `vitest.config.ts` (minimal, globals:true optional) | [DONE] |
| T-005 | Create placeholder `src/engine.ts` (empty named export stub) | [DONE] |

## Group 1 — State type definitions

| # | Task | Status |
|---|---|---|
| T-006 | Define `Operator` union type in `src/types.ts` | [DONE] |
| T-007 | Define `ErrorTag` union type in `src/types.ts` | [DONE] |
| T-008 | Define `EngineState` interface (5 fields, Decimal import) in `src/types.ts` | [DONE] |
| T-009 | Export `initialState()` factory in `src/engine.ts` | [DONE] |
| T-010 | Test: `initialState returns correct defaults` | [DONE] |

## Group 2 — Decimal.js configuration

| # | Task | Status |
|---|---|---|
| T-011 | Create `src/decimal-config.ts` with precision/rounding/exp-bounds config | [DONE] |
| T-012 | Test: `0.1 + 0.2 = 0.3 decimal.js correctness (E-045)` | [DONE] |

## Group 3 — Digit input handler

| # | Task | Status |
|---|---|---|
| T-013 | Implement `inputDigit(state, digit)` in `src/engine.ts` | [DONE] |
| T-014 | Test: `inputDigit — appends digit normally` | [DONE] |
| T-015 | Test: `inputDigit — leading-zero replacement (R-025, E-037)` | [DONE] |
| T-016 | Test: `inputDigit — double-zero stays "0" (E-037)` | [DONE] |
| T-017 | Test: `inputDigit — fresh start after justEvaluated (E-038)` | [DONE] |
| T-018 | Test: `inputDigit — no-op in error state (E-040)` | [DONE] |

## Group 4 — Decimal point handler

| # | Task | Status |
|---|---|---|
| T-019 | Implement `inputDecimal(state)` in `src/engine.ts` | [DONE] |
| T-020 | Test: `inputDecimal — appends decimal (E-011)` | [DONE] |
| T-021 | Test: `inputDecimal — second decimal no-op (E-009, E-010)` | [DONE] |
| T-022 | Test: `inputDecimal — fresh "0." after justEvaluated (E-013)` | [DONE] |
| T-023 | Test: `inputDecimal — no-op in error state (E-014)` | [DONE] |
| T-024 | Test: `inputDecimal — leading decimal from fresh state → "0." (E-011)` | [DONE] |

## Group 5 — Arithmetic resolve helper

| # | Task | Status |
|---|---|---|
| T-025 | Implement `resolveOperation(left, op, right)` in `src/engine.ts` | [DONE] |
| T-026 | Test: `resolveOperation — addition (1.1 + 2.2 = 3.3 exact)` | [DONE] |
| T-027 | Test: `resolveOperation — subtraction` | [DONE] |
| T-028 | Test: `resolveOperation — multiplication` | [DONE] |
| T-029 | Test: `resolveOperation — division (10 ÷ 4 = 2.5)` | [DONE] |
| T-030 | Test: `resolveOperation — divide by zero → 'divide-by-zero' (E-001, R-010)` | [DONE] |
| T-031 | Test: `resolveOperation — "0.0" as divisor (E-003)` | [DONE] |

## Group 6 — Operator input handler

| # | Task | Status |
|---|---|---|
| T-032 | Implement `inputOperator(state, op)` in `src/engine.ts` | [DONE] |
| T-033 | Test: `inputOperator — first op commits buffer to accumulator` | [PENDING] |
| T-034 | Test: `inputOperator — operator-first uses implicit 0 (E-015, D-010)` | [PENDING] |
| T-035 | Test: `inputOperator — operator-swap same op no-resolve (E-016)` | [PENDING] |
| T-036 | Test: `inputOperator — operator-swap different op (E-017)` | [PENDING] |
| T-037 | Test: `inputOperator — chaining auto-resolves left-to-right (E-018, R-004)` | [PENDING] |
| T-038 | Test: `inputOperator — chaining div-by-zero sets error (D-011, E-002)` | [PENDING] |
| T-039 | Test: `inputOperator — no-op in error state (E-019)` | [PENDING] |

## Group 7 — Equals handler

| # | Task | Status |
|---|---|---|
| T-040 | Implement `inputEquals(state)` in `src/engine.ts` | [DONE] |
| T-041 | Test: `inputEquals — normal resolve (5 × 4 = 20)` | [DONE] |
| T-042 | Test: `inputEquals — no pending operator is no-op (E-020, R-006)` | [DONE] |
| T-043 | Test: `inputEquals — fresh state equals gives 0 (E-021)` | [DONE] |
| T-044 | Test: `inputEquals — negative result (E-041, R-021): 3 - 5 = -2` | [DONE] |
| T-045 | Test: `inputEquals — divide by zero sets errorState (E-001, R-010)` | [DONE] |
| T-046 | Test: `inputEquals — no-op in error state (E-023)` | [DONE] |
| T-047 | Test: `inputEquals — zero result is not error (E-024, E-039)` | [DONE] |

## Group 8 — Equals-after-equals no-op (D-017)

| # | Task | Status |
|---|---|---|
| T-048 | *(removed — repeated-equals dropped, D-017)* | [SKIP] |
| T-049 | *(removed — repeated-equals dropped, D-017)* | [SKIP] |
| T-050 | Test: `inputEquals — equals after equals is no-op (E-022/E-053, D-017): 3+4==→7` | [PENDING] |
| T-051 | Test: `inputEquals — multiple repeated equals no-op: 3+4===→7` | [PENDING] |

## Group 9 — Clear-entry (CE) handler

| # | Task | Status |
|---|---|---|
| T-052 | Implement `inputClearEntry(state)` in `src/engine.ts` | [PENDING] |
| T-053 | Test: `inputClearEntry — resets buffer, preserves pending op (E-029)` | [PENDING] |
| T-054 | Test: `inputClearEntry — escapes error latch (E-032, R-015)` | [PENDING] |
| T-055 | Test: `inputClearEntry — from mid-first-operand, accumulator stays null (E-028)` | [PENDING] |
| T-056 | Test: `inputClearEntry — CE then equals uses 0 as right operand (E-058)` | [PENDING] |

## Group 10 — All-clear (AC) handler

| # | Task | Status |
|---|---|---|
| T-057 | Implement `inputAllClear(state)` in `src/engine.ts` | [PENDING] |
| T-058 | Test: `inputAllClear — full reset from mid-expression (E-033)` | [PENDING] |
| T-059 | Test: `inputAllClear — escapes error latch (E-034, R-015)` | [PENDING] |
| T-060 | Test: `inputAllClear — no residual after AC (E-059)` | [PENDING] |

## Group 11 — Public API & display value

| # | Task | Status |
|---|---|---|
| T-061 | Define `getDisplayValue(state)` in `src/engine.ts` | [PENDING] |
| T-062 | Test: `getDisplayValue — returns entryBuffer in normal states` | [PENDING] |
| T-063 | Test: `getDisplayValue — returns errorState tag when error set` | [PENDING] |

## Group 12 — Edge-case batch: decimal.js correctness (E-045–E-049)

| # | Task | Status |
|---|---|---|
| T-064 | Test: `0.1 + 0.2 = 0.3 via engine (E-045)` | [PENDING] |
| T-065 | Test: `0.3 - 0.2 = 0.1 via engine (E-046)` | [PENDING] |
| T-066 | Test: `0.1 × 0.2 = 0.02 via engine (E-047)` | [PENDING] |
| T-067 | Test: `1 ÷ 3 finite, no error (E-048)` | [PENDING] |
| T-068 | Test: `0.1 + 0.2 - 0.3 = 0 exactly (E-049)` | [PENDING] |

## Group 13 — Edge-case batch: chaining (E-025–E-027)

| # | Task | Status |
|---|---|---|
| T-069 | Test: `2 + 3 × 4 = 20 left-to-right (E-025, R-004)` | [PENDING] |
| T-070 | Test: `1 + 1 + 1 + 1 = 4 (E-026)` | [PENDING] |
| T-071 | Test: `10 ÷ 2 + 3 = 8 (E-027)` | [PENDING] |

## Group 14 — Edge-case batch: negatives (E-041–E-044)

| # | Task | Status |
|---|---|---|
| T-072 | Test: `3 - 5 = -2 (E-041)` | [PENDING] |
| T-073 | Test: `3 - 5 = + 10 = 8 (E-042)` | [PENDING] |
| T-074 | Test: `1 - 1 - 1 = -1 (E-043)` | [PENDING] |

## Group 15 — Edge-case batch: overflow (E-006–E-008)

| # | Task | Status |
|---|---|---|
| T-075 | Test: `overflow sets errorState (E-006)` | [PENDING] |
| T-076 | Test: `large-but-valid result is not error (E-007)` | [PENDING] |
| T-077 | Test: `overflow via chained op (E-008, D-011)` | [PENDING] |

## Group 16 — Edge-case batch: justEvaluated matrix (E-050–E-055)

| # | Task | Status |
|---|---|---|
| T-078 | Test: `operator after equals carries result forward (E-051)` | [PENDING] |
| T-079 | *(covered by T-050/T-051 — E-053 no-op asserted there; no duplicate)* | [SKIP] |
| T-080 | Test: `AC after equals gives full reset (E-055, E-035)` | [PENDING] |

## Group 17 — Final check

| # | Task | Status |
|---|---|---|
| T-081 | Run `tsc --noEmit` — zero type errors | [DONE] |
| T-082 | Run `vitest run` — all tests pass, 0 failures | [DONE] |

---

*Active tasks: 78 (80 minus T-048, T-049, T-079 [SKIP])*
*Test tasks: ~58. Non-test: ~20.*
