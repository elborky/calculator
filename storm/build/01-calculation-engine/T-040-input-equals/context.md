---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-040
storm-canonical: false
---

# T-040 — Implement `inputEquals`

## Spec refs
- 02-flows.md Flow 3 (equals)
- 03-rules.md R-006, R-014
- 05-edge-cases.md E-020–E-024, E-053
- _decisions.md D-017 (equals-after-equals = no-op; 5-field state, NO lastOperator/lastRhs)

## Behaviour (4 cases)
1. Error no-op (R-014, E-023): errorState !== null → return unchanged
2. No pending op + justEvaluated (D-017, E-022/E-053): pendingOperator === null && justEvaluated === true → no-op (equals-after-equals)
3. No pending op + not justEvaluated (E-020, R-006): pendingOperator === null && justEvaluated === false → set justEvaluated = true, return (display stays same)
4. Resolve (main path): pendingOperator !== null → resolveOperation(accumulator, pendingOperator, entryBuffer); on success update state; on error set errorState

## Status: IN PROGRESS
