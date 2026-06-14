---
storm-phase: build
storm-canonical: false
---

# T-037 — context

Task: Test `inputOperator` — chaining auto-resolves left-to-right (E-018, R-004): 3 + 5 ×

Sequence: digit '3' → op 'add' → digit '5' → op 'multiply'

On pressing 'multiply': 3+5=8 is auto-resolved.

Assertions:
- `accumulator.toString() === '8'`
- `pendingOperator === 'multiply'`
- `entryBuffer === '0'`
- no error

Rule refs: E-018, R-004 — left-to-right chaining: when a new operator is pressed with an existing left operand, pending op, and right operand in buffer, the pending operation resolves first.
