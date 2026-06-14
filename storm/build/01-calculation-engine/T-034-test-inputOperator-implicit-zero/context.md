---
storm-phase: build
storm-canonical: false
---

# T-034 — context

Task: Test `inputOperator` — operator-first uses implicit 0 (E-015, D-010).

Sequence: `initialState()` (entryBuffer='0') → `inputOperator(s, 'add')`

Assertions:
- `accumulator.toString() === '0'`
- `pendingOperator === 'add'`
- `entryBuffer === '0'`

Rule refs: E-015, D-010 — pressing an operator as the very first action uses implicit 0 as left operand.
