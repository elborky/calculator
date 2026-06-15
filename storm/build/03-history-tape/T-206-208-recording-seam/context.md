---
storm-phase: build
storm-module: 03-history-tape
storm-canonical: false
storm-task-group: B
storm-tasks: T-206, T-207, T-208
---

# Context — T-206..T-208: Recording Seam in state.ts (INT-M3-3)

## What

Additive patch to `src/ui/state.ts` (the only structural change to M2 in all of M3):

1. **T-206** — add `DispatchListener` type alias + `listeners: DispatchListener[]` module-scoped array.
2. **T-207** — export `subscribe(fn: DispatchListener): void` that pushes onto `listeners`.
3. **T-208** — extend `dispatch()` to capture `prev` before mutation, keep `render(state)` unchanged
   and first, then notify all listeners with `(prev, state)` after render.

## Why

M3 must evaluate the INT-M3-1 predicate `(prevState.pendingOperator !== null AND nextState.errorState === null AND nextState.justEvaluated === true)` to decide when to record a calculation. That predicate requires **both** the state before and after the equals reducer runs. The only place in M2 that holds both is `dispatch()` — after `state = fn(state)` but before the reference is lost.

The subscriber list (option (a) from the head-to-head) is the least-bespoke mechanism (~12 LOC total), introduces zero new dependency, and observes-not-intercepts (C3). The competing options — pub/sub event emitter (b) and equals-wrapper (c) — have more LOC, more coupling, or structural fragility (closure-identity problem for (c)).

## Spec references

- `storm/specify/03-history-tape/06-tech-choices.md §1` — full head-to-head + decision (option (a))
- `storm/specify/03-history-tape/06-tech-choices.md §2` — precise 4-step integration point (build-ready)
- `storm/specify/03-history-tape/_briefing.md:82-104` — INT-M3-1..3, hard constraints C1-C5
- `src/ui/state.ts:44-47` — verified live seam location (pre-patch)

## Hard constraints proof (C1–C5)

| Constraint | How patch satisfies it |
|---|---|
| C1 — no M1 function called | `state.ts` patch calls nothing from `../engine`. No import added. |
| C2 — no field added to `EngineState` | `EngineState` type is unchanged; `DispatchListener` is local to state.ts. |
| C3 — observe, not intercept; render unchanged + first | `render(state)` stays on the same line in the same order; listeners fire after, in a separate `for` loop. |
| C4 — zero M1 coupling | Only `EngineState` (already imported) is used in the type. No new M1 import. |
| C5 — no new dependency | Pure vanilla TS; no new import, no package.json change. |

## Integration contract for downstream groups

- **Group C** (`src/ui/history/history.ts`) imports `subscribe` from `../state` and calls `subscribe(recordOnEquals)`.
- **Group D** (`src/ui/main.ts`) triggers Group C's init at startup — no direct `subscribe` call needed from main.ts because Group C's module-level side-effect handles registration on import.
- `DispatchListener` is exported from `state.ts` — Group C can use it for the typed listener signature.

## Files touched

- `src/ui/state.ts` — sole change (additive patch)
- `storm/build/03-history-tape/T-206-208-recording-seam/context.md` — this file
- `storm/build/03-history-tape/T-206-208-recording-seam/test-results.md` — self-test log
