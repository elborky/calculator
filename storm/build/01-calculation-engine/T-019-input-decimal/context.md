---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-019
storm-canonical: false
---

# T-019 Context — `inputDecimal`

## Task
Implement `inputDecimal(state: EngineState): EngineState` in `src/engine.ts`.

## Rules Applied
- **R-014 / E-014** — error no-op: if `errorState !== null` → return unchanged
- **E-013** — justEvaluated reset: start fresh with `entryBuffer = '0.'`, `justEvaluated = false`
- **R-007 / E-009, E-010** — second decimal no-op: if `entryBuffer` already contains `'.'` → return unchanged
- **E-011** — leading decimal from fresh state: `'0'` → `'0.'` (handled by normal append path)
- Normal append: `entryBuffer += '.'`

## Prior state
`src/engine.ts` has `initialState()` and `inputDigit()`. 7 tests pass.

## Status
[DONE]
