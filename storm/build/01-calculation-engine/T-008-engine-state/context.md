---
storm-phase: build
storm-module: 01-calculation-engine
storm-canonical: false
storm-task: T-008
---

# T-008 — Define `EngineState` interface (5 fields)

## What
Add the `EngineState` interface to `src/types.ts`, importing `Decimal` from `decimal.js`.

## Why
The engine state shape is the core data contract for M1. All subsequent tasks (initialState factory, transitions, arithmetic) depend on these typed fields being in place.

## Spec reference
`storm/specify/01-calculation-engine/01-data-model.md §1` — the 5-field state table:

| Field | Type | Purpose |
|---|---|---|
| `entryBuffer` | `string` | Current display string being entered |
| `accumulator` | `Decimal \| null` | Left-hand operand after first operator pressed |
| `pendingOperator` | `Operator \| null` | Operator waiting to be applied |
| `justEvaluated` | `boolean` | True immediately after = completes |
| `errorState` | `ErrorTag \| null` | null when healthy; set on div-by-zero or overflow |

## Acceptance
- `src/types.ts` exports `EngineState` interface with all 5 fields
- `Decimal` imported from `'decimal.js'`
- `tsc --noEmit` exits 0
