---
storm-phase: build
storm-task: T-027
storm-module: 01-calculation-engine
---

# T-027 — Test: resolveOperation subtraction correct

## Objective
Verify that `resolveOperation(new Decimal('10'), 'subtract', new Decimal('4'))` returns
a Decimal whose `.toString()` is `'6'`.

## Source files touched
- `src/engine.test.ts`
