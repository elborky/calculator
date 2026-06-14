---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-077
storm-canonical: false
---

# T-077 — Context: overflow via chained operator (E-008, D-011)

## Spec refs
- `05-edge-cases.md` E-008
- `01-data-model.md` D-011

## Strategy
E-008: chained operations can push a result over the limit mid-chain.
D-011: on error during chain auto-resolve, the new operator is NOT stored.

Construct state:
- `accumulator = new Decimal('9e+9000000000000000')` (near maxE)
- `pendingOperator = 'multiply'`
- `entryBuffer = '10'`  (right operand — not '0', so swap guard won't fire)

Press `inputOperator(state, 'add')` → auto-resolve fires: 9e+9000000000000000 × 10 → overflow.
D-011: `pendingOperator` is set to null (new 'add' op NOT stored).

Assert:
- `errorState === 'overflow'`
- `pendingOperator === null`
