---
storm-phase: build
storm-canonical: false
---

# T-033 — context

Task: Test `inputOperator` — first op commits entryBuffer to accumulator.

Sequence: `initialState()` → `inputDigit(s, '5')` → `inputOperator(s, 'add')`

Assertions:
- `accumulator.toString() === '5'`
- `pendingOperator === 'add'`
- `entryBuffer === '0'`

Rule refs: E-015, D-010 (first operator press commits buffer as left operand)
