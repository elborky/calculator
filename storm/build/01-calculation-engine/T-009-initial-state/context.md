---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-009
storm-canonical: false
---

# T-009 — Export `initialState()` factory in `src/engine.ts`

## What
Replace the empty `export {}` stub in `src/engine.ts` with a named export function
`initialState(): EngineState` that returns a fresh, zeroed engine state.

## Why
The engine must have a well-typed, canonical starting state. Every downstream function
(digit input, operator application, evaluation, clear) either accepts or resets to this
baseline. Having a factory (vs. a bare literal) means callers always get a new object —
no shared-reference bugs.

## Spec reference
`storm/specify/01-calculation-engine/01-data-model.md` §1 — Initial State Values:

| Field | Initial value |
|---|---|
| `entryBuffer` | `'0'` |
| `accumulator` | `null` |
| `pendingOperator` | `null` |
| `justEvaluated` | `false` |
| `errorState` | `null` |

## Notes
- `decimal-config.ts` (T-011) does not exist yet; `initialState()` does not reference
  Decimal directly since `accumulator` starts as `null`.
- Types imported from `./types` (already complete after T-006–T-008).
