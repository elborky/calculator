---
storm-phase: build
storm-task: T-030
storm-module: 01-calculation-engine
---

# T-030 — Test: resolveOperation divide by zero returns 'divide-by-zero' (E-001, R-010)

## Objective
Verify that `resolveOperation(new Decimal('5'), 'divide', new Decimal('0'))` returns
the string `'divide-by-zero'` — not `Infinity`, not `NaN`, not a thrown exception.

## Concern refs
- E-001 — divide-by-zero error condition
- R-010 — guard fires BEFORE computing, returns the error tag string

## Source files touched
- `src/engine.test.ts`
