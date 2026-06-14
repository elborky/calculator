---
storm-phase: build
storm-task: T-031
storm-module: 01-calculation-engine
---

# T-031 — Test: resolveOperation "0.0" as divisor is zero (E-003)

## Objective
Verify that `resolveOperation(new Decimal('9'), 'divide', new Decimal('0.0'))` returns
`'divide-by-zero'`.

The guard uses `right.isZero()` — decimal.js treats `new Decimal('0.0').isZero()` as `true`,
so the div-by-zero guard fires even for decimal representations of zero.

## Concern refs
- E-003 — decimal zero ("0.0") as divisor edge case
- R-010 / R-011 — div-by-zero guard pre-check

## Source files touched
- `src/engine.test.ts`
