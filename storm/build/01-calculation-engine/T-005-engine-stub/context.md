---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-005
storm-canonical: false
storm-depends-on:
  - storm/specify/01-calculation-engine/_index.md
  - storm/build/01-calculation-engine/_plan.md
---

# T-005 — Create placeholder `src/engine.ts` (empty named export stub)

## What
Create the `src/` directory and a minimal `src/engine.ts` file that exports an empty named export (`export {}`). This is a structural stub — no logic yet.

## Why
TypeScript requires at least one input file to compile without a "no input files" error. Vitest needs an importable module entry point for subsequent test tasks. All engine functions will be implemented in later tasks (T-009, T-013, etc.).

## Spec reference
- `storm/specify/01-calculation-engine/_index.md` — Group 0: Project scaffold (T-005 row)
- Engine source lives at `src/engine.ts` per spec authority D-016.

## Acceptance criteria
- `src/engine.ts` exists with at least one named export
- `npx tsc --noEmit` exits 0
- Vitest can import the file without error
