---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-078
storm-canonical: false
---

# T-078 — Context: operator after equals carries result forward (E-051)

## Spec refs
- `05-edge-cases.md` E-051

## Strategy
E-051: after 3+4=7 (justEvaluated=true), pressing an operator should carry the result
(7) forward as the left operand for the next operation.

Sequence:
1. `inputDigit(s, '3')`
2. `inputOperator(s, 'add')`
3. `inputDigit(s, '4')`
4. `inputEquals(s)` → state: entryBuffer='7', accumulator=7, justEvaluated=true
5. `inputOperator(s, 'add')` → accumulator=7, pendingOperator='add', entryBuffer='0', justEvaluated=false

Assert:
- `accumulator.toString() === '7'`
- `pendingOperator === 'add'`
- `entryBuffer === '0'`
- `justEvaluated === false`
