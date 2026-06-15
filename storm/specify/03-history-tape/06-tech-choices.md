---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
  - storm/specify/02-calculator-ui/_index.md
  - storm/specify/02-calculator-ui/06-tech-choices.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
---

# Tech Choices — M3 History Tape

> CP-6 verification-gate file. M3's ONE load-bearing tech decision is **architectural, not a
> dependency**: the INT-M3-3 hook seam — *how* M3 observes `(prevState, nextState)` around the
> existing M2 `dispatch()` to record completed calculations (INT-M3-1 predicate). Per the briefing
> this is an **AI-autonomous architecture decision** (`_briefing.md:96-104`).
>
> **Headline (CP-6):** M3 introduces **NO new third-party dependency** — no store, no event-bus
> library, no observer/reactive framework. The chosen mechanism is a ~12-LOC subscriber list added
> to the *existing* vanilla-TS `dispatch()`. The CP-6 verification gate therefore concludes "no
> library to verify"; the anti-inflation list (§5) names every dependency deliberately NOT reached
> for. Tech-stack continuity with M2 is preserved verbatim (F-M3-10): vanilla TS, Vite 8, plain-CSS
> tokens, self-hosted Inter, TS 6, static `dist/` (no server).

---

## Summary of picks

| Concern | Pick | One-line why |
|---|---|---|
| **Recording-seam mechanism** (INT-M3-3) | **(a) Post-dispatch subscriber/listener list** added to `dispatch()` in `src/ui/state.ts` | Fewest bespoke LOC (~12), zero new dependency, observes-not-intercepts, zero M1 coupling, trivially testable, and reuses the `(prev,next)` pair `dispatch()` already holds. Beats a pub/sub emitter (more ceremony, indirection) and an equals-wrapper (more coupling, alters a hot path). |
| **New runtime dependency** | **None** | Internal pattern in existing vanilla TS. No store / event-bus / observer lib (§5). |
| **M3 module state** | **One module-scoped in-memory array** of `{expression, result}` | Dies with the tab (F-M3-2). A single `let entries: HistoryEntry[]` — owned by `01-data-model`, not a schema. |
| **Render approach** | **Same vanilla `render(state)` idiom as M2** — a small `renderHistory()` writing the existing `.history-slot` DOM | Continuity (F-M3-10). No framework; the slot already exists (F-M3-8). |
| **Build / deploy** | **Unchanged** — static Vite `dist/`, NGINX, no server | M3 adds source files to the **same** package; no second pipeline, no runtime added. |

---

## 1. The INT-M3-3 hook seam — head-to-head (THE M3 decision)

### The problem, stated precisely (from the verified seam)

M3 must record a calculation **iff** the INT-M3-1 predicate holds:
> `prevState.pendingOperator !== null` **AND** `nextState.errorState === null` **AND**
> `nextState.justEvaluated === true` (`_briefing.md:82-84`).

To evaluate that predicate it needs **both** the state *before* and *after* the equals reducer runs
(INT-M3-2, `_briefing.md:91-94`). The single place that holds both values is the M2 dispatch loop,
verified live at `src/ui/state.ts:44-47`:

```ts
export function dispatch(fn: (s: EngineState) => EngineState): void {
  state = fn(state);   // <- prevState is `state` here, before reassignment
  render(state);       // <- nextState is the new `state`
}
```

`prevState` is the value of `state` *before* line 45; `nextState` is the value *after*. Any
mechanism M3 picks must capture that pair without (a) calling an M1 function, (b) adding a field to
`EngineState`, or (c) changing M2's existing render/behaviour (the three hard constraints,
`_briefing.md:102-104`).

### Hard constraints every candidate must satisfy (gate — non-negotiable)

| # | Constraint | Source |
|---|---|---|
| C1 | M3 calls **no** M1 function; reads no M1 internals beyond the public `EngineState` shape + `getDisplayValue`. | `_briefing.md:102` |
| C2 | M3 adds **no** field to `EngineState`. | `_briefing.md:103` |
| C3 | The mechanism **observes** — it does not intercept or alter existing M2 render/behaviour. | `_briefing.md:104` |
| C4 | **Zero coupling to M1** (M1 is frozen, REVIEW-PASS — F-M3-4). | F-M3-4 |
| C5 | Vanilla-TS continuity — **no new framework / store / event-bus library** unless a documented constraint forces it. | F-M3-10 |

### The candidates (the three named in the briefing)

**(a) Post-dispatch subscriber/listener list** — `dispatch()` keeps a small array of listeners; after
it computes `nextState` it notifies each listener with `(prevState, nextState)`. M3 registers one
listener at startup; that listener evaluates the INT-M3-1 predicate and, on a match, appends to the
tape array.

```ts
// in state.ts — the ONE structural change to M2 (additive)
type DispatchListener = (prev: EngineState, next: EngineState) => void;
const listeners: DispatchListener[] = [];
export function subscribe(fn: DispatchListener): void { listeners.push(fn); }

export function dispatch(fn: (s: EngineState) => EngineState): void {
  const prev = state;            // capture before
  state = fn(state);             // existing line — unchanged
  render(state);                 // existing line — unchanged, runs FIRST (render unaffected)
  for (const l of listeners) l(prev, state);  // additive: notify observers
}
```

**(b) Pub/sub event** — a minimal event emitter (or a `CustomEvent` dispatched on a DOM node) that
`dispatch()` fires *after* render with `{prev, next}` in the detail; M3 subscribes via
`addEventListener` (DOM) or an `.on()` call (object emitter).

**(c) Equals-aware wrapper** — M3 wraps/intercepts the `inputEquals` intent specifically (e.g. M3
owns its own `dispatchEquals` that snapshots state around the equals reducer, or `dispatch` special-
cases the equals function reference), so the tape only ever sees the equals path.

### Scorecard (the substance — score each against the briefing's named axes)

| Axis | (a) Subscriber list | (b) Pub/sub event | (c) Equals wrapper |
|---|---|---|---|
| **Bespoke-LOC delta** (the F-M3-10 tiebreaker) | **~12 LOC** total in `state.ts`: a `listeners` array, a `subscribe()` fn, one `for` loop, and the `prev` capture. Smallest. | **~20–35 LOC**: an emitter object (`on`/`emit` + listener map) *or* CustomEvent plumbing + a typed detail interface + an `addEventListener` with a cast. More ceremony for the same effect. | **~15–40 LOC** and **branchy**: special-casing the equals function reference (fragile — `dispatch` receives `s => inputEquals(s)` *closures*, not a stable reference; see C-risk below) or a parallel `dispatchEquals` path M3 must keep in sync with bindings. |
| **Coupling to M1** (C4 — MUST be zero) | **Zero.** Listener reads only `EngineState` shape + (for the result) `getDisplayValue` — the public surface C1 permits. No M1 fn called. | **Zero** (same — reads the state pair). | **Higher risk.** To "intercept the equals intent" the wrapper must *know which dispatch is an equals* — that knowledge lives in M1's reducer identity, nudging M3 toward M1 internals. Avoidable but the design pressure is wrong. |
| **Coupling to M2 internals** | **Low + clean.** One additive seam in `dispatch()`; M2's body is otherwise untouched. The seam is a documented extension point. | **Low**, but adds an indirection layer (emitter/DOM node) M2 didn't have — a second moving part to reason about. | **High.** Either M2's `dispatch` grows an equals special-case (M2 now knows about M3's recording need — a leak), or M3 forks a parallel equals path that the keypad+keyboard bindings (T-150, T-158) must both route through — two call sites to keep consistent. |
| **Changes existing M2 behaviour?** (C3) | **No.** `render(state)` still runs first and identically; listeners fire *after*, observing only. Existing flows/animation/error rendering are byte-for-byte unchanged. | **No** (event fires after render) — but the emitter/CustomEvent is new runtime surface in the hot path. | **At risk.** Wrapping the equals path is the closest of the three to *intercepting* rather than *observing* — it touches the dispatch decision itself, exactly what C3 forbids in spirit. |
| **Testability** | **High.** `subscribe()` + `dispatch()` are pure synchronous functions; a unit test registers a spy listener, dispatches an equals, asserts the spy saw `(prev,next)` and the predicate fired. No DOM, no async, no event-loop. | **Medium.** DOM `CustomEvent` needs a DOM/jsdom harness; an object emitter is testable but you're testing your own emitter too. More surface to test. | **Medium-low.** The branchy special-case has more paths to cover (equals vs non-equals, the closure-identity edge). |
| **Profile-fit** (least bespoke for a zero-coding owner — F-M3-10) | **Best.** Fewest lines, one concept ("after each dispatch, tell my listeners"), nothing new to learn, nothing to upgrade. | Worse — introduces an event/emitter concept + its own lifecycle the owner now indirectly carries. | Worst — the most code and the most fragile (closure-identity, dual call sites). |

**C-risk (why (c) is genuinely fragile, not just heavier):** the bindings dispatch equals as a
*closure* — `dispatch(s => inputEquals(s))` / `dispatch(inputEquals)` (T-150 / T-158, `_index.md`).
A wrapper that tries to recognise "this dispatch is an equals" cannot reliably do so by function
reference (closures differ per call site / per bind). It would have to either tag the call, fork a
parallel `dispatchEquals` both binding groups must use, or sniff the resulting state — all of which
are *more* bespoke and *more* coupled than just observing every `(prev,next)` and letting the
**INT-M3-1 predicate itself** decide (which it already does, cleanly, with no equals-detection
needed — the predicate excludes non-equals transitions for free because `prevState.pendingOperator`
is only non-null on the genuine resolve path). The predicate *is* the equals filter; a wrapper that
re-implements equals-detection duplicates it.

### Decision — (a) post-dispatch subscriber list

**Pick: (a) a post-dispatch subscriber/listener list added to `dispatch()`.** It is the
**least-bespoke** option (~12 LOC, the F-M3-10 / #FF-004 tiebreaker), introduces **no new
dependency** (CP-6 — nothing to verify), satisfies **all five hard constraints** (C1–C5: zero M1
coupling, no `EngineState` field, observe-not-intercept, vanilla-TS continuity), and is the most
**testable** (pure synchronous functions, no DOM/event harness). The pub/sub emitter (b) adds an
indirection layer and more LOC for identical capability; the equals-wrapper (c) is both heavier and
structurally fragile (closure-identity, dual call sites, C3-violating design pressure).

This is a case where the #FF-004 "prefer the higher-level / least-bespoke option" default and the
"observe-not-intercept" constraint **point at the same answer** — no override needed, no tradeoff
between them. The subscriber list *is* the higher-level option here precisely because it is the
thinnest.

> **Tradeoff named (CP-15 / #FF-026):** `Tradeoff: none.` There is no genuine ≥2-principle tension
> in this pick — least-bespoke (F-M3-10), zero-coupling (C4), and observe-not-intercept (C3) all
> select option (a) together. Manufacturing a sacrificed axis here would be inverse-theater. The one
> honest *note* (not a tradeoff): (a) makes `dispatch()` very slightly less "pure" by adding a
> notify step — but that step is additive, runs after render, and changes no existing behaviour, so
> it is not a sacrifice of any principle, just the minimal seam the recording requires.

---

## 2. The precise integration point (build-ready)

**File:** `src/ui/state.ts` — the existing M2 dispatch host (no new state file for the seam itself;
M3's tape array + render live in M3's own module per `01-data-model` / `04-ui`).

**The additive change to `dispatch()` (the ONLY structural touch to M2):**

1. Capture `const prev = state;` **before** `state = fn(state);`.
2. Leave `state = fn(state);` and `render(state);` **exactly as they are** (C3 — render unchanged,
   runs first).
3. **After** render, iterate a module-scoped `listeners: DispatchListener[]` calling each with
   `(prev, state)`.
4. Export a `subscribe(fn: (prev: EngineState, next: EngineState) => void): void` that pushes onto
   `listeners`.

**The listener M3 registers (lives in M3's module, e.g. `src/ui/history/history.ts` — owned by
`01-data-model` / `02-flows`):**

```ts
// signature of the hook M3 registers — the (prev, next) observer
function recordOnEquals(prev: EngineState, next: EngineState): void {
  // INT-M3-1 predicate — the equals filter, no equals-detection needed
  if (prev.pendingOperator !== null && next.errorState === null && next.justEvaluated === true) {
    const expression = `${prev.accumulator!.toString()} ${OPERATOR_TO_GLYPH[prev.pendingOperator]} ${prev.entryBuffer}`; // INT-M3-2
    const result = getDisplayValue(next) as string; // INT-M3-2 (next is non-error by predicate)
    appendEntry({ expression, result }); // M3's own in-memory array (F-M3-2)
    renderHistory();                      // M3's own render into .history-slot (F-M3-8)
  }
}
// registered once at startup, alongside the existing bindings in main.ts:
subscribe(recordOnEquals);
```

**Notes binding this to the verified facts:**
- The listener reads **only** `EngineState` fields + `getDisplayValue` + the inherited
  `OPERATOR_TO_GLYPH` (F-M3-9, `src/ui/operator-map.ts`) — satisfying C1 (no M1 fn call;
  `getDisplayValue` is the one public reader C1 explicitly permits).
- `prev.accumulator!` is non-null *inside* the predicate guard (the predicate requires
  `prev.pendingOperator !== null`, and on the genuine resolve path the accumulator is set — see
  `_briefing.md:78-80`). The `!` is guarded, not unsafe.
- The predicate **automatically excludes** repeated `=`, divide-by-zero, overflow, and bare `=`
  with nothing pending — **no special-casing** (`_briefing.md:86-89`). This is exactly why (a)
  needs no equals-detection: the predicate is the filter.
- Registration happens at startup in `main.ts` (the existing wire-up point, verified
  `src/ui/main.ts:22-24`), one line alongside `setupClickBinding()` / `setupKeyboardBinding()`.

**Why this does not change M2 behaviour (C3 proof):**
- `render(state)` still executes on line 46 exactly as before, with the same argument, before any
  listener runs → M2's display/pending-line/error/animation rendering is untouched.
- Existing M2 unit/e2e expectations on `dispatch()`'s observable output (the rendered DOM) are
  unchanged; the listener loop produces *additional* side effects in M3's own DOM slot only.
- If M3 is ever removed, deleting the `subscribe()` call leaves `dispatch()` notifying an empty
  listener array — a no-op. The seam is reversible.

---

## 3. M3 module state — no store, a plain array (continuity)

M3's tape is **one module-scoped in-memory array** — `let entries: HistoryEntry[]` where
`HistoryEntry = { expression: string; result: string }` (the precise shape + lifecycle is
`01-data-model`'s to own; named here only to ground the seam's `appendEntry`). It dies with the tab
(F-M3-2 — no `localStorage`, no DB, no persistence). A single array + a render call **is** the state
management, exactly as M2 used a single `EngineState` cell (the M2 `06-tech-choices.md §6` rationale,
applied identically): a store library (Redux/Zustand/Jotai/nanostores) for one append-only array is
textbook over-engineering at this scale.

---

## 4. Render + build — unchanged from M2 (F-M3-10 continuity)

- **Render:** M3 adds a small vanilla `renderHistory()` that writes the **existing** DOM slot —
  `<div class="history-slot">` already present in `index.html`, laid out by `layout.css:97-100`,
  reserved empty by M2 task T-175 (F-M3-8). M3 populates it and removes the `aria-hidden="true"`.
  Same imperative idiom as M2's `render.ts` (cached element ref + targeted text writes). **No UI
  framework** — the slot exists, the idiom exists, M3 reuses both.
- **Typography / motion:** inherited as design tokens + CSS (F-M3-6 typography, F-M3-7 slide-in
  motion honoring `prefers-reduced-motion`) — authored against the **existing** `tokens.css` custom
  properties (no CSS-in-JS, no new token pipeline). This is `04-ui`'s concern; named here only to
  confirm **no new styling dependency**.
- **Build / deploy:** **unchanged.** M3 adds TypeScript + CSS source files into the **same** Vite
  package (no second `package.json`, exactly as M2 extended M1 — `_index.md` context note). `vite
  build` still emits a static `dist/` (HTML+CSS+JS+fonts) for the Dokploy Static / NGINX target —
  **no server runtime added** (`07-deployment-target.md` contract, inherited from M2 D-002). M3
  changes nothing about the build pipeline.

---

## 5. Explicitly NOT needed (anti-inflation — CP-13)

Stated outright so no downstream drafter or BUILD task reaches for these:

- **No state-management library** (Redux / Zustand / Jotai / nanostores / valtio / …). M3 holds one
  in-memory array (§3). A store for one append-only list is over-engineering — same call M2 made
  for its one `EngineState` cell.
- **No event-bus / pub-sub library** (mitt / nanoevents / EventEmitter3 / RxJS / …). The seam is a
  ~12-LOC listener array inside the existing `dispatch()` (§1 option (a)). A dependency to do what a
  one-line `for` loop does is inflation — and adds a versioned runtime surface the zero-coding owner
  can never debug (#FF-004 spirit).
- **No observer / reactive framework** (MobX / signals libs / @preact/signals / …). M3 has one
  state-change source (the dispatch seam) and one consumer (the tape render). Reactivity machinery
  has nothing to reactively manage here — the muted-reactivity argument M2 made for vanilla applies
  identically.
- **No UI framework** (React / Svelte / Solid / Preact / Lit). F-M3-10 mandates continuity; the slot
  + render idiom already exist (§4). Introducing a framework for one scrollable list would fracture
  the single vanilla-TS stack.
- **No persistence layer** (no `localStorage` wrapper, no IndexedDB lib, no DB client). F-M3-2: the
  tape is in-memory and dies with the tab. There is nothing to persist, so nothing to add.
- **No virtual-list / windowing library** (react-window / tanstack-virtual / …). The tape is a short
  in-session list; `OQ-M3-4` (length cap) is decided in `03-rules`/`05-edge-cases` at the array
  level. Native scroll on a capped list needs no virtualization at this scale.

**M3's total new runtime dependency footprint: ZERO.** It inherits M1 (decimal.js, already in the
tree, via M2's `getDisplayValue`) + M2's own code, and adds only its own vanilla TS + CSS. The
~12-LOC dispatch seam + a plain array + a small render function is the least-bespoke *and*
least-third-party surface for an in-memory, read-only, in-session tape.

---

## 6. CP-6 verification statement

Per the briefing's CP-6 instruction (`_briefing.md` concern requirements): the head-to-head
concludes **no third-party dependency is needed** — the recording seam is an internal architecture
pattern in **existing vanilla TypeScript**. There is therefore **no library/framework/component name
to verify via Context7 + WebFetch** in this file: the anti-inflation list (§5) is the explicit "no
store, no event-bus lib, no observer framework" statement the gate requires.

The one piece of **inherited** tooling — Vite 8.0.16, TypeScript 6.0.3, plain-CSS tokens,
self-hosted Inter — was CP-6-verified in M2's `06-tech-choices.md` (npm registry + Context7
`/websites/vite_dev` + WebFetch, time-anchored June 2026) and is **carried forward unchanged**
(F-M3-10 continuity); M3 introduces no new version and no new tool, so no fresh verification is owed.
Had any third-party library been proposed, it would have required the full `npx ctx7@latest
library/docs` + time-anchored WebFetch cross-check cite per CP-6 — none was, because none is needed.

---

## 7. Consistency check (CP-13 dims 5–6)

> No contradictions found with `_briefing.md` (INT-M3-1..4, F-M3-1..10), M2's `06-tech-choices.md`
> (vanilla-TS / Vite / plain-CSS / self-hosted-Inter continuity), the live `src/ui/state.ts:44-47`
> dispatch seam, or `src/ui/operator-map.ts` (F-M3-9 inheritance). The pick observes the dispatch
> loop without touching M1 (C1/C4), adds no `EngineState` field (C2), and leaves M2's render path
> byte-for-byte unchanged (C3). The seam is additive and reversible. Static Vite `dist/` (no server)
> is preserved (M2 D-002, `07-deployment-target.md`). No new dependency, no version floor at SPECIFY
> (#FF-004 — floors are a SHIP concern).
>
> **Note for `01-data-model`:** this file names `HistoryEntry = {expression, result}` only to ground
> the seam's `appendEntry` signature — the canonical shape, the internal render key (if any), and the
> append/clear lifecycle are **`01-data-model`'s** to own. If that file logs a different field name,
> the seam adapts to it (the mechanism is shape-agnostic; it passes whatever the data-model defines).
> No conflict is created here — only the seam's *call site* is fixed, not the entity definition.
