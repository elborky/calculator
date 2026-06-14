---
storm-phase: build
storm-task: T-026
storm-module: 01-calculation-engine
---

# T-026 — Test: resolveOperation addition (1.1 + 2.2 = 3.3 exact)

## Objective
Verify that `resolveOperation` returns a Decimal whose `.toString()` is `'3.3'`
when called with `(new Decimal('1.1'), 'add', new Decimal('2.2'))`.

This is the classic IEEE-754 floating-point artifact test — native JS gives 3.3000000000000003.
With decimal.js configured in `src/decimal-config.ts`, the result must be exactly `'3.3'`.

## Concern refs
- E-045 (IEEE-754 artifact eliminated by decimal.js)
- decimal-config precision/rounding settings

## Source files touched
- `src/engine.test.ts` (add one `it` block inside new/existing `describe('resolveOperation')`)
