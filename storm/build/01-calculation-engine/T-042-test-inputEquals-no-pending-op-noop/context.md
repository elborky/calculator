---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-042
storm-canonical: false
---

# T-042 — Test: `inputEquals — no pending operator is no-op (E-020, R-006)`

## Spec refs
- 05-edge-cases.md E-020
- 03-rules.md R-006

## Sequence
`initialState()` → equals (no operator ever pressed)

## Assertions
- `justEvaluated === true`
- `entryBuffer === '0'` (unchanged)
- `pendingOperator === null`
- `errorState === null`

## Test count target: 27
