---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-006
storm-canonical: false
---

# T-006 — Define `Operator` union type in `src/types.ts`

## What
Create `src/types.ts` and export the `Operator` union type:
```ts
export type Operator = 'add' | 'subtract' | 'multiply' | 'divide';
```

## Why
The engine state object has a `pendingOperator` field typed as `Operator | null`
(see spec `01-data-model.md` §1, field 3). This type must be defined before
`EngineState` (T-008) can be authored. Defining it as a union type (rather than
an enum) keeps the type lightweight, tree-shakeable, and directly readable in
test assertions.

## Spec References
- `storm/specify/01-calculation-engine/01-data-model.md` §1 — field 3 (`pendingOperator`)
- `storm/specify/01-calculation-engine/_index.md` — Group 1 "State type definitions"
