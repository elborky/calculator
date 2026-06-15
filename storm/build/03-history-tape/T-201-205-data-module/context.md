---
storm-phase: build
storm-module: 03-history-tape
storm-canonical: false
---

# Task Group A — HistoryEntry type + tape module (T-201..T-205)

## What

Two new files in `src/ui/history/`:

- **`types.ts`** — exports `HistoryEntry` interface verbatim from spec §1 (T-201, D-M3-DM-02).
- **`tape.ts`** — exports three functions over a module-private state cell (T-202..T-205):
  - `appendEntry(Omit<HistoryEntry,'id'>): void` — push with auto-assigned monotonic id (T-203, INT-M3-2)
  - `clearTape(): void` — `tape = []`; nextId keeps advancing (T-204, HR-016)
  - `getTape(): readonly HistoryEntry[]` — read-only accessor (T-205)

No other files are touched in this group.

## Why

M3 records completed calculations in an in-memory array that lives for one browser-tab session
(F-M3-2). This group establishes the data primitives every downstream group depends on:

- Group B (recording seam in state.ts) calls `appendEntry`.
- Group C (render) calls `getTape` + `clearTape`.
- Tests (Group H) import all three functions directly.

## Spec references

| Ref | Content |
|---|---|
| `01-data-model.md §1` | HistoryEntry entity — expression, result, id fields |
| `01-data-model.md §2` | Container — module-private `tape` array + `nextId`; oldest-first ordering (D-M3-DM-01) |
| `01-data-model.md §4` | Lifecycle — append on INT-M3-1 predicate, clear on AC, tab-close discard |
| `01-data-model.md §5` | Unbounded tape; no length cap (D-M3-DM-03) |
| `06-tech-choices.md §3` | Module state: one `let tape: HistoryEntry[]` — no store lib, no persistence |

## Key decisions implemented

- **D-M3-DM-01:** array is oldest-first (`push`); newest-at-visible-edge is a render concern.
- **D-M3-DM-02:** each entry carries a monotonic `id: number` as render key.
- **D-M3-DM-03:** tape is unbounded (no cap, no eviction).
- **nextId non-reset:** data-model §4 explicitly notes nextId MAY keep advancing on clear to avoid stale-DOM collisions — simplest implementation, adopted here.

## Craft floor notes

- No `any` used; `Omit<HistoryEntry, 'id'>` is the precise input type for `appendEntry`.
- `getTape()` returns `readonly HistoryEntry[]` — callers cannot mutate the array.
- Pure module-private state (`let` cells); zero hidden global mutation beyond this module.
- Matches M2 idiom (`let state: EngineState` in `state.ts`) — single replaceable cell pattern.
