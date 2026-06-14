---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-010
storm-canonical: false
---

# T-010 Context — Test: `initialState returns correct defaults`

## Task
Write the first unit test in `src/engine.test.ts` asserting all 5 fields of `initialState()`.

## Spec Reference
- `storm/specify/01-calculation-engine/01-data-model.md` §1 — EngineState shape
- `storm/specify/01-calculation-engine/_index.md` T-010

## Prior Work
- T-009 DONE: `initialState()` exported from `src/engine.ts`
- Vitest installed and configured (no globals — explicit imports required)

## Acceptance Criteria
- `src/engine.test.ts` created
- Test `it('initialState returns correct defaults', ...)` asserts all 5 fields:
  - `entryBuffer === '0'`
  - `accumulator === null`
  - `pendingOperator === null`
  - `justEvaluated === false`
  - `errorState === null`
- `npm test` exits 0 with 1 test passing
