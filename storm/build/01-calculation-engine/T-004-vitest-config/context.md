---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-004
storm-canonical: false
---

# T-004 — Create `vitest.config.ts`

## What
Create a minimal `vitest.config.ts` at the project root so that `npm test` (alias: `vitest run`) can discover and execute `*.test.ts` files under `src/`.

## Why
Vitest works without a config file but defaults to discovering tests broadly. An explicit config:
- Scopes test discovery to `src/**/*.test.ts` (clean, intentional)
- Makes the project ESM-compatible (type:module in package.json, ESNext module target in tsconfig)
- Provides a documented, reproducible entry point for the test runner

## Spec refs
- `storm/specify/01-calculation-engine/_index.md` Group 0 (project scaffold tasks T-001–T-005)
- Stack decision: TypeScript + decimal.js + Vitest (CLAUDE.md Last decision)

## Decisions made
- Config is minimal — `test.include` pointing to `src/**/*.test.ts` only
- No plugins needed for pure TS unit tests (Vitest handles TS natively)
- ESM-compatible: uses `import` syntax, no `require()`
- `vitest.config.ts` excluded from tsconfig `include` to avoid `noEmit` compilation issues (tsconfig only covers `src/**/*.ts` and `tests/**/*.ts`)

## Blockers
None.
