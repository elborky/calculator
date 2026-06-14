---
storm-phase: build
storm-canonical: false
---

# T-038 — context

Task: Test `inputOperator` — chaining div-by-zero sets error, new op not registered (D-011, E-002).

Sequence: digit '5' → op 'divide' → digit '0' → op 'add'

The ÷0 is auto-resolved when '+' is pressed. D-011: on error, the new operator is NOT registered.

Assertions:
- `errorState === 'divide-by-zero'`
- `pendingOperator === null` (not set to 'add')

Rule refs: D-011, E-002 — error during chaining resolve aborts: errorState set, new op NOT registered.
