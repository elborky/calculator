---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-003
storm-canonical: false
---

# T-003 — Install dependencies

## What
Install three pinned packages into the calculator project:
- `decimal.js@10.6.0` — runtime dependency (used in browser for floating-point correctness)
- `typescript@6.0.3` — devDependency (type-checking toolchain)
- `vitest@4.1.8` — devDependency (test runner)

## Why
The calc-engine spec (Group 0) requires these exact pinned versions to ensure reproducible builds and match the tech choices approved in SPECIFY. `decimal.js` is a runtime dep because it runs in the browser bundle; `typescript` and `vitest` are dev-only tools.

## Spec refs
- `storm/specify/01-calculation-engine/06-tech-choices.md` — pinned versions + rationale
- `storm/specify/01-calculation-engine/_index.md` — Group 0, T-003
