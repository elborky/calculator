---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-045
storm-canonical: false
---

# T-045 — Test: `inputEquals — divide by zero sets errorState (E-001, R-010)`

## Spec refs
- 05-edge-cases.md E-001
- 03-rules.md R-010

## Sequence
digit '5' → op 'divide' → equals
(After pressing op 'divide', entryBuffer resets to '0'. Pressing equals resolves 5 ÷ 0 → error.)

## Note on workaround
After inputOperator, entryBuffer = '0'. We do NOT press any additional digits
(pressing '0' would be no-op by double-zero rule anyway). So inputEquals sees
entryBuffer = '0' as the right operand → resolveOperation(5, divide, 0) → error.

## Assertions
- `errorState === 'divide-by-zero'`

## Test count target: 30
