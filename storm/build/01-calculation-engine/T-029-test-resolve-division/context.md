---
storm-phase: build
storm-task: T-029
storm-module: 01-calculation-engine
---

# T-029 — Test: resolveOperation division correct (10 ÷ 4 = 2.5)

## Objective
Verify that `resolveOperation(new Decimal('10'), 'divide', new Decimal('4'))` returns
a Decimal whose `.toString()` is `'2.5'`.

10 ÷ 4 = 2.5 — terminates cleanly in decimal, no rounding edge cases.

## Source files touched
- `src/engine.test.ts`
