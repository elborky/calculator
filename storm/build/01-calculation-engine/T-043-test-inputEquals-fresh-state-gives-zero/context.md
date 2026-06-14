---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-043
storm-canonical: false
---

# T-043 — Test: `inputEquals — fresh state equals gives 0 (E-021)`

## Spec refs
- 05-edge-cases.md E-021

## Sequence
`initialState()` → equals

## Assertions
- `entryBuffer === '0'`
- `justEvaluated === true`
- `errorState === null`

## Note
This overlaps with T-042 in sequence but focuses on the entryBuffer value explicitly
being '0' — confirming the zero-result case for fresh state.

## Test count target: 28
