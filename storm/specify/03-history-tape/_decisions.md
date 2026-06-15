---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: false
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
---

# M3 History Tape — Decisions Log

> Aggregated autonomous technical decisions (CP-7 scope) made by the M3 SPECIFY sub-agents.
> Format: L2-05. ID scheme: `D-M3-<CONCERN>-NN` (DM = data-model).

---

## D-M3-DM-01 — `tape` is oldest-first; newest-edge is a render concern

- **Decision:** M3's container is a module-scoped `HistoryEntry[]` stored in **append-chronological order
  (oldest-first)** via a plain `push`. "Most-recent at the visible edge" (F-M3-5) is satisfied by the
  **render layer** (e.g. `flex-direction` / reversed read), NOT by inverting the array on every insert.
- **Rationale:** keeps `append` a trivial O(1) `push`; decouples data order from visual edge so `04-ui.md`
  owns "which edge is top" without forcing a data-structure inversion. Simpler, fewer moving parts (CP-13).
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `01-data-model.md §2`.

## D-M3-DM-02 — `HistoryEntry` carries a monotonic `id` render key

- **Decision:** each entry = `{ expression: string; result: string; id: number }`. `id` is a monotonic
  in-session counter (`nextId++`), used as a **stable key** for the keyed slide-in list (F-M3-7).
- **Rationale:** the render layer animates new lines in / older lines down — a keyed list needs stable
  identity. Two entries can be content-identical (`"2 + 2" = "4"` twice), so content is not a safe key. A
  counter is the cheapest stable id. Internal only — **not user-visible, not persisted, not business data**
  (resets with the array each tab load). Justified against anti-ceremony: it earns its place by enabling the
  motion contract, not as decoration.
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `01-data-model.md §1`.

## D-M3-DM-03 — unbounded tape; overflow handled by scroll (resolves OQ-M3-4)

- **Decision:** the tape is **unbounded** — no length cap, no eviction. Growth is absorbed by the
  scroll the design already mandates (F-M3-5: desktop scrollable panel; phone capped-height scrollable).
- **Rationale:** the array grows only on a human pressing equals on a completed calculation (tens, not
  thousands per session) — no machine/network append path a cap would guard against. A cap adds a real
  eviction branch (slice + magic-N + animate-out interaction) for no benefit (CP-13 over-engineering;
  profile-fit *least-bespoke-code*, F-M3-10). Capping would *silently drop* completed calculations — the
  data loss M2's no-truncate readout principle forbids (`02-calculator-ui` D-006). Resolves **OQ-M3-4** at
  the data level. (Per-entry *long-string* overflow is the separate OQ-M3-5, deferred to `05-edge-cases`.)
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `01-data-model.md §5`.

## D-M3-TC-01 — Recording-seam mechanism: post-dispatch subscriber list (INT-M3-3)

- **Decision:** M3 records completed calculations via a `(prev, next)` **listener** registered on a small
  subscriber array added to the existing M2 `dispatch()` in `src/ui/state.ts`. After `dispatch` computes
  `nextState` and runs `render(state)`, it notifies each listener with `(prevState, nextState)`; M3's
  listener evaluates the INT-M3-1 predicate and appends to the in-memory tape.
- **Rationale:** CP-6 head-to-head (subscriber list vs pub/sub event vs equals-wrapper). Subscriber list
  wins on every axis — **least bespoke (~12 LOC)** (F-M3-10 / #FF-004 tiebreaker), **no new dependency**,
  **zero M1 coupling** (C4), **observe-not-intercept** (C3), most **testable** (pure sync fns, no DOM/event
  harness). Pub/sub adds indirection + LOC for identical capability; the equals-wrapper is heavier *and*
  fragile (closure-identity of `dispatch(s=>inputEquals(s))`, dual binding call sites, C3-violating design
  pressure). The INT-M3-1 predicate IS the equals filter → no equals-detection needed.
- **Constraints satisfied:** C1 (no M1 fn call; reads only `EngineState` shape + `getDisplayValue`), C2 (no
  `EngineState` field added), C3 (render runs first, unchanged; listeners observe after), C4 (zero M1
  coupling — M1 frozen), C5 (vanilla-TS continuity).
- **Seam interop with D-M3-DM-02:** the listener passes `{expression, result}` to the data-model's
  `appendEntry`, which adds the monotonic `id` (D-M3-DM-02) on insert. The mechanism is shape-agnostic —
  `01-data-model` owns the `HistoryEntry` definition; the seam owns only the call site. **No conflict.**
- **Tradeoff (CP-15):** none — least-bespoke, zero-coupling, observe-not-intercept all select the same
  option; no ≥2-principle tension. **Authority:** CP-7 technical. **Source concern:** `06-tech-choices.md §1-2`.

## D-M3-TC-02 — No new third-party dependency for M3 (CP-6 anti-inflation)

- **Decision:** M3 adds **zero** new runtime dependencies — no state-management lib, no event-bus/pub-sub
  lib, no observer/reactive framework, no UI framework, no persistence layer, no virtual-list lib. The
  recording seam is an internal vanilla-TS pattern; the tape is one module-scoped array; render reuses the
  M2 idiom into the pre-existing `.history-slot` (F-M3-8). Build/deploy unchanged — static Vite `dist/`,
  NGINX, no server.
- **Rationale:** F-M3-10 tech-stack continuity + #FF-004 (don't make the zero-coding owner carry a versioned
  runtime they can't debug). Every excluded library would do what a one-line `for` loop / one array / one
  render fn already does. Inherited tooling (Vite 8.0.16, TS 6.0.3, plain-CSS tokens, self-hosted Inter) is
  carried from M2's CP-6-verified `06-tech-choices.md` unchanged — no new version, no fresh verification owed.
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `06-tech-choices.md §5-6`.

## D-M3-EC-01 — Long entry: wrap → per-line horizontal scroll, fixed font (resolves OQ-M3-5)

- **Decision:** a long expression/result in the narrow tape panel (~240px desktop / ~140px phone) **wraps
  by default**; an unbreakable single token (e.g. a long exponent string `1.23e+30`) gets **per-line,
  right-anchored horizontal scroll**; the tape **never truncates/ellipsizes** (no data loss) and the **tape
  font stays fixed** (no per-line auto-shrink).
- **Rationale:** honours the same no-data-loss *intent* as M2's readout (`02-calculator-ui` D-006) but via a
  **list-appropriate** mechanism. M2's measure-and-shrink works for a single readout line; a list of many
  small lines cannot shrink per-line without jitter and breaking cross-row `tabular-nums` alignment — so
  wrap+scroll replaces shrink here. Deliberate divergence from D-006, same principle.
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `05-edge-cases.md` (HE-001..004).
