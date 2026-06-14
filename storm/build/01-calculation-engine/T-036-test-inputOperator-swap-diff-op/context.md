---
storm-phase: build
storm-canonical: false
---

# T-036 — context

Task: Test `inputOperator` — operator-swap different op (E-017).

Sequence: digit '3' → operator 'add' → operator 'multiply' (no right operand entered)

Assertions:
- `pendingOperator === 'multiply'` (changed)
- `accumulator.toString() === '3'`
- no error

Rule refs: E-017 — swapping to a different operator with no right operand entered replaces pending op without resolving.
