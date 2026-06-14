---
storm-phase: build
storm-canonical: false
---

# T-035 — context

Task: Test `inputOperator` — operator-swap same op no-resolve (E-016).

Sequence: `initialState()` → digit '3' → operator 'add' → operator 'add' (same, no right operand entered)

After second 'add':
- `pendingOperator === 'add'`
- `accumulator.toString() === '3'`
- no error (no arithmetic happened)

Rule refs: E-016 — pressing same operator again with no right operand entered is a no-resolve swap.
