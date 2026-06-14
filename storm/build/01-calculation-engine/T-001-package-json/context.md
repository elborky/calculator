---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-001
storm-canonical: false
storm-depends-on:
  - storm/specify/01-calculation-engine/_index.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
---

# T-001 — Init package.json

## What
Create the root `package.json` for the calculator project. This is the npm manifest for the entire
app (deployment target: static web app via Dokploy/NGINX). The engine code lives in `src/` at the
project root.

## Why
The project has no `package.json` yet — this is the very first BUILD task (Group 0: scaffold).
Without it, no npm scripts, no dependency management, and no Vitest or TypeScript can be invoked.
All subsequent tasks depend on this being in place first.

## Required fields
- `"name": "calculator"` — project-level identifier
- `"version": "0.1.0"` — initial version
- `"type": "module"` — ESM (per spec: TypeScript target ESNext, module ESNext)
- `"scripts"`:
  - `"test": "vitest run"` — runs Vitest headlessly (Vitest not yet installed; script only)
  - `"typecheck": "tsc --noEmit"` — TypeScript type-check without emitting files

## Spec references
- `storm/specify/01-calculation-engine/_index.md` Group 0, T-001 — acceptance criteria
- `storm/specify/01-calculation-engine/06-tech-choices.md` — TypeScript 6.0.3, Vitest 4.1.8,
  decimal.js 10.6.0 (to be installed in T-003)
- Tech stack: TypeScript 6.0.3, decimal.js 10.6.0, Vitest 4.1.8 (CP-6 verified in spec)

## Acceptance criteria (from spec)
- `package.json` exists at project root
- `"type": "module"` present (ESM)
- `npm test` resolves to `vitest run`
- `npm run typecheck` resolves to `tsc --noEmit`
