---
storm-phase: build
storm-task: T-028
storm-module: 01-calculation-engine
---

# T-028 — Test: resolveOperation multiplication correct

## Objective
Verify that `resolveOperation(new Decimal('3'), 'multiply', new Decimal('7'))` returns
a Decimal whose `.toString()` is `'21'`.

## Source files touched
- `src/engine.test.ts`
