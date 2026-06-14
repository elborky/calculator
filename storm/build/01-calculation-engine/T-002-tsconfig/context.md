---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-002
storm-canonical: false
storm-depends-on:
  - storm/specify/01-calculation-engine/_index.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
---

# T-002 — Create `tsconfig.json`

## What
Create `tsconfig.json` at project root with strict TypeScript settings targeting ESNext, using bundler module resolution, and `noEmit: true` (M1 has no bundle output; Vite/bundler is M2).

## Why
M1 is a headless calculation engine — pure TypeScript logic, no UI, no bundle. `noEmit` means `tsc` is used only for type-checking (via `npm run typecheck`). The `bundler` moduleResolution is Vite-compatible so M2 can adopt Vite without changing tsconfig. `strict: true` enforces the full suite of TypeScript strict checks (nullability, implicit any, etc.) which is the craft floor per STORM C3.

## Spec refs
- `storm/specify/01-calculation-engine/_index.md` Group 0 / T-002 acceptance criteria
- `storm/specify/01-calculation-engine/06-tech-choices.md` — TypeScript 6.0.3, ESNext target, decimal.js, Vitest

## Acceptance criteria
- `tsconfig.json` at project root
- `strict: true`
- `target: "ESNext"`
- `module: "ESNext"`
- `moduleResolution: "bundler"`
- `noEmit: true`
- `include: ["src/**/*.ts", "tests/**/*.ts"]`

## Status
[DONE]
