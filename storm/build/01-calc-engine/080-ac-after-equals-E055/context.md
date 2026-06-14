---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-080
storm-canonical: false
---

# T-080 — Context: AC after equals gives full reset (E-055, E-035)

## Spec refs
- `05-edge-cases.md` E-055, E-035
- `03-rules.md` R-018

## Strategy
E-055: after 3+4=7 (justEvaluated=true), pressing AC → full reset (R-018).
E-035: AC always resets all 5 fields to initial values, regardless of state.

Sequence:
1. 3 + 4 = → state: entryBuffer='7', accumulator=7, justEvaluated=true
2. inputAllClear() → full reset

Assert all 5 fields at initial values:
- `entryBuffer === '0'`
- `accumulator === null`
- `pendingOperator === null`
- `justEvaluated === false`
- `errorState === null`
