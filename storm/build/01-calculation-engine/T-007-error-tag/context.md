---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-007
storm-canonical: false
---

# T-007 — Define `ErrorTag` union type in `src/types.ts`

## What

Add the `ErrorTag` union type to the existing `src/types.ts` file (which already exports `Operator`).

```ts
export type ErrorTag = 'divide-by-zero' | 'overflow';
```

## Why

The engine state field `errorState` (one of the 5 fields in `EngineState`) holds either `null` or an `ErrorTag`. Without this type, T-008 (`EngineState` interface) cannot reference it safely. Defining it now keeps the type graph consistent as downstream tasks build on it.

## Spec References

- `storm/specify/01-calculation-engine/01-data-model.md` — `errorState: ErrorTag | null` field in `EngineState`
- `storm/specify/01-calculation-engine/03-rules.md`:
  - **R-010** — divide-by-zero sets `errorState = 'divide-by-zero'`
  - **R-012** — overflow sets `errorState = 'overflow'`

## Acceptance

- `src/types.ts` exports both `Operator` AND `ErrorTag`
- `ErrorTag = 'divide-by-zero' | 'overflow'`
- `tsc --noEmit` exits 0
