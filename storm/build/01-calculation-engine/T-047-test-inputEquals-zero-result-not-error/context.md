---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-047
storm-canonical: false
---

# T-047 — Test: `inputEquals — zero result is not an error (E-024, E-039)`

## Spec refs
- 05-edge-cases.md E-024, E-039

## Sequence
digit '5' → op 'subtract' → digit '5' → equals → result is 0

## Assertions
- `errorState === null` (zero is NOT an error)
- `entryBuffer === '0'`
- `justEvaluated === true`

## Test count target: 32
