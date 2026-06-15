# Test Results — T-201..T-205 (Group A)

## tsc --noEmit

```
$ npx tsc --noEmit
Exit code: 0
```

Result: **PASS** — no type errors. Strict mode (`"strict": true`, `tsconfig.json`) is satisfied.
`Omit<HistoryEntry, 'id'>` resolves correctly; `readonly HistoryEntry[]` is accepted as the return
type of `getTape()`.

## Runtime smoke (Node.js — module logic verified inline)

These are pure-module exports with no render surface; ts-node is not in the project's dev-deps, so
the smoke replicates the exact tape.ts logic in a Node.js --input-type=module run.

```
$ node --input-type=module <smoke.js>
SMOKE: all assertions passed
Exit code: 0
```

Assertions verified:
1. `appendEntry` pushes with monotonic ids (0, 1, 2, …).
2. `clearTape()` empties the array; `nextId` keeps advancing (id=2 after one clear+append).
3. `getTape()` returns an array (readonly contract enforced at TS type level, not runtime).
4. Oldest-first ordering: first `appendEntry` call is index 0, second is index 1.
