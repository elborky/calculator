---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-075
storm-canonical: false
---

# T-075 — Context: overflow sets errorState (E-006)

## Spec refs
- `03-rules.md` R-012
- `05-edge-cases.md` E-006

## Strategy
Overflow in decimal.js fires when the result's exponent exceeds `Decimal.maxE` (9e+15),
producing a non-finite (Infinity) result. `resolveOperation` checks `!result.isFinite()`
and returns `'overflow'` (R-012).

Construct state directly:
- `accumulator = new Decimal('9e+9000000000000000')` — near the maxE limit
- `pendingOperator = 'multiply'`
- `entryBuffer = '10'`
- Call `inputEquals` → resolveOperation returns `'overflow'`

Assert: `errorState === 'overflow'`
