---
storm-phase: build
storm-canonical: false
---

# T-039 — context

Task: Test `inputOperator` — no-op in error state (E-019).

Construct state with `errorState: 'divide-by-zero'`. Call `inputOperator(state, 'add')`.

Assertions:
- State unchanged: `errorState` still `'divide-by-zero'`
- `pendingOperator` still `null`

Rule refs: E-019, R-014 — operator input in error state is a complete no-op.
