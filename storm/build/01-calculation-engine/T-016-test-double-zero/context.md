---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-016
storm-canonical: false
---

# T-016 — Test: `inputDigit — double-zero stays "0" (E-037)`

## Spec reference
`storm/specify/01-calculation-engine/05-edge-cases.md` E-037: pressing '0' when buffer is already '0' must keep buffer as '0' (not produce '00').

## Test case
- Input: `inputDigit(initialState(), '0')`
- Expected: `entryBuffer === '0'`

## Prior state
4 tests passing (T-010, T-012, T-014, T-015).
