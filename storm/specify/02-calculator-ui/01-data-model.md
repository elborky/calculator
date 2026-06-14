---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_briefing.md
  - storm/specify/01-calculation-engine/01-data-model.md
  - storm/structure/03-modules.md
---

# M2 Data Model — In-Memory View State

> **This is NOT a database schema, and almost not a "data model" at all.** M2 is a client-side
> view+input layer with **no persistence** (F5) — no `localStorage`, no DB, no cookie, no URL state.
> Its entire "data" is **one `EngineState` value imported from M1**, held in memory and re-rendered on
> every keypress (INT-1). Everything else M2 shows is **derived** — a pure function of that one value,
> computed at render time and stored nowhere. This file is honest about that: the held-state section
> is short by design (anti-inflation, CP-13); the bulk is the derivation contract for the things M2
> computes but does not store.
>
> Field and function names below match the **verified M1 contract** in `_briefing.md` exactly. M2
> never invents engine fields or calls arithmetic — it holds M1's state and reads it.

---

## 1. The held state — one `EngineState`, replaced never mutated (INT-1)

M2 is the **stateful host**; M1 is the **stateless reducer**. M2 holds exactly **one** value as its
single source of truth:

| What | Type | Source | Lifecycle |
|---|---|---|---|
| the current engine state | `EngineState` (imported from M1) | `initialState()` on load; each `inputX(...)` return value thereafter | in-memory only; dies with the tab (F5) |

`EngineState` is M1's 5-field object — M2 holds it **as-is**, does not extend it, does not destructure
it into separate reactive fields:

```ts
interface EngineState {
  entryBuffer: string;              // number currently being typed
  accumulator: Decimal | null;      // stored left-hand value across an operator
  pendingOperator: Operator | null; // op waiting to apply
  justEvaluated: boolean;           // true right after equals
  errorState: ErrorTag | null;      // non-null = latched error
}
```

**The update contract (the one rule of the held state):**

1. Store the engine state in **one** held/reactive variable (a `let state` re-assigned, or one
   framework signal/store cell holding the whole object — the exact primitive is `06-tech-choices.md`'s
   call once the UI approach is picked; the *shape* — one cell, whole object — is fixed here).
2. On every input event, call the matching M1 function with the **current** held value, then
   **replace** the held variable with the returned value:
   `state = inputDigit(state, '7')` — never `state.entryBuffer += '7'`.
3. **Never mutate the held object in place.** M1 returns a new state; M2 swaps the reference. (M1's
   functions are pure — mutating M2's copy would desync from M1's contract and break reducer semantics.)
4. Re-render from the freshly held value (derive display + pending line — §3).

> **Decision D-M2-DM-01 — single whole-object held cell.** M2 holds the `EngineState` as one
> indivisible cell, not five separate reactive fields. Rationale: M1's contract is *"state in → new
> state out"* (INT-1); splitting it into per-field reactivity would invite in-place mutation and
> partial updates that violate the reducer pattern. One cell, replaced atomically, keeps M2 honest to
> the contract. *(AI-autonomous, CP-7 technical.)*

---

## 2. UI-only view flags — what M2 does and does NOT store

The briefing asked: only add view state that is **genuinely needed**. Audited honestly, M2 needs
almost none. Each candidate below is resolved to *DOM-native* / *read-not-stored* / *not M2's* —
**zero** invented JS state fields:

| Candidate flag | Verdict | Why |
|---|---|---|
| **Focus / active-button state** | **DOM-native — NOT stored.** | The browser tracks focus (`:focus`, `:focus-visible`) and press (`:active`) natively. M2 styles these in CSS (focus ring §8, press-scale §7). No JS field; no need to mirror DOM state into the data model. |
| **`prefers-reduced-motion`** | **Read from media query — NOT stored.** | Honored via the CSS `@media (prefers-reduced-motion: reduce)` block (F11, §7). It's a live environment read, not application state. If any JS ever needs it (e.g. to skip a programmatic animation), read `matchMedia('(prefers-reduced-motion: reduce)').matches` at the moment of use — do not cache it as a stored field. |
| **Active theme (light/dark)** | **NOT M2's state — M4 owns it (F4).** | M2 ships one theme (default), authored against CSS custom properties. The toggle + theme state are M4's. M2 holds no theme field. |
| **Error-display styling flag** | **DERIVED — NOT stored.** | "Is the display in error mode?" is `state.errorState !== null` — a pure read of the held state (INT-6), applied as a CSS class at render. Not a separate field. |

**Net result:** M2's data model is the **one** `EngineState` value from §1 and nothing else. There is
no second state object, no view-model struct, no flags bag. This is deliberate — manufacturing view
state M2 doesn't need would violate YAGNI (CP-13). The "richness" of M2 lives in its *derivations*
(§3), not in stored data.

---

## 3. Derived values — pure functions of the held state, stored nowhere

Everything M2 displays beyond the raw state is **computed at render time** from the single held
`EngineState`. None of these are stored; each is a pure read.

### 3.1 Primary display string (INT-2)

The big result line. Two steps:

1. **Get the raw value from M1:** `getDisplayValue(state)` → returns either the `entryBuffer`-style
   value string **or** an `ErrorTag` (`'divide-by-zero'` | `'overflow'`).
2. **Map error tags to sentences (M2 owns the wording — INT-2, F5).** M1 surfaces the *tag*; M2
   renders the *sentence*:

   | `getDisplayValue(state)` returns | M2 renders |
   |---|---|
   | a numeric string (e.g. `"42"`, `"-2"`, `"3.5"`) | the string as-is (formatting/`tabular-nums` is CSS, F9) |
   | `'divide-by-zero'` | **"Cannot divide by zero"** |
   | `'overflow'` | **"Number too large"** |

   > **Decision D-M2-DM-02 — error wording (M2-owned, INT-2).** `'divide-by-zero'` → *"Cannot divide
   > by zero"*; `'overflow'` → *"Number too large"*. These are the M2-authored user-facing sentences.
   > Final microcopy is UX craft and may be refined in `04-ui.md` against the mockups, but the
   > tag→sentence **mapping responsibility** is locked to M2 here. *(AI-autonomous, CP-7; owner
   > validates the UX wording during the `04-ui.md` UX protocol.)*

   Discrimination is on the tag string — M2 must branch on the two `ErrorTag` literals, not on
   "does the string look non-numeric". (The `ErrorTag` union is M1's; M2 imports it for an exhaustive
   `switch`.)

### 3.2 Pending-expression line (INT-3, F9) — the one M2-owned derived view M1 does not expose

M1's `getDisplayValue` returns **only** the primary value. The design's secondary line (F9,
`08-design-system.md:117`) — e.g. showing `12 +` while the user types the second operand — has **no
M1 helper**. M2 **derives** it by reading two held-state fields directly:

```
pendingLine(state):
  if state.errorState !== null         → "" (hidden — error owns the display)
  else if state.justEvaluated === true → "" (hidden — result is final, no pending op)
  else if state.accumulator !== null
       and state.pendingOperator !== null
                                       → `${state.accumulator.toString()} ${glyph(state.pendingOperator)}`
  else                                 → "" (hidden — fresh state / mid-first-operand)
```

Glyph mapping uses the operator→glyph table (§3.3). Example: after `12 +`, the held state is
`accumulator = 12`, `pendingOperator = 'add'` → pending line shows `12 +`. The instant `=` resolves,
`justEvaluated` flips true and `pendingOperator` clears → the line hides.

> **Decision D-M2-DM-03 — pending-line show/hide conditions (INT-3, CP-7 AI-autonomous).** The
> *derivation approach* (M2 reads `accumulator` + `pendingOperator`, maps op→glyph) is pre-approved by
> the orchestrator (INT-3). The concrete **hide conditions** decided here: hide on (a) error state,
> (b) `justEvaluated` (post-equals), (c) fresh state / no accumulator / no pending operator. Show
> **only** when both `accumulator !== null` **and** `pendingOperator !== null` and not latched/just-
> evaluated. Exact visual content (e.g. whether to also echo the in-progress right operand) is UX
> craft for `02-flows.md` / `04-ui.md` to finalize against the mockups; this file fixes the *data
> derivation*, not the final pixels.

> **Note — `accumulator` is a `Decimal`.** `state.accumulator` is M1's `Decimal | null`, not a JS
> number. M2 renders it via `.toString()` for the pending line. M2 does **not** do arithmetic on it
> (F2) — `.toString()` is a read, not a computation.

### 3.3 Operator ↔ glyph ↔ key map (INT-5) — the one lookup table M2 holds

A small **bidirectional** map, M2-owned (INT-5, F10). It is *constant data* (a frozen lookup), not
mutable state — it lives as a module constant, not in the held cell.

**Input key / button → `Operator`** (what M2 passes to `inputOperator`):

| Input (keyboard key / button id) | `Operator` passed to M1 |
|---|---|
| `+` | `'add'` |
| `-` | `'subtract'` |
| `*` | `'multiply'` |
| `/` | `'divide'` |

**`Operator` → display glyph** (what M2 renders on the button face and in the pending line — true
Unicode, F10):

| `Operator` | Glyph | Codepoint |
|---|---|---|
| `'add'` | `+` | U+002B |
| `'subtract'` | `−` | U+2212 (minus, **not** hyphen `-`) |
| `'multiply'` | `×` | U+00D7 |
| `'divide'` | `÷` | U+00F7 |

> **Decision D-M2-DM-04 — operator map is M2-owned constant data (INT-5).** The two directions above
> form M2's single source of truth for operator identity: keyboard `+ - * /` and the four operator
> buttons resolve to the `Operator` union; the `Operator` union resolves to the true-Unicode display
> glyph. Held as a frozen module constant (not reactive state). *(AI-autonomous, CP-7.)*

---

## 4. State lifecycle

| Moment | What happens to the held state |
|---|---|
| **Page load / app mount** | seed the held cell with `initialState()` (F5: equivalent to an automatic all-clear at startup). |
| **Any input event** | `state = inputX(state, …)` → replace held cell → re-render (§1, §3). |
| **CE button / `Esc`-less clear-entry** | `state = inputClearEntry(state)` — M1 resets buffer + escapes error latch; M2 just holds the result. |
| **AC button / `Esc`** | `state = inputAllClear(state)` → returns `initialState()` (full reset). M2 holds the fresh value; pending line + error styling clear by derivation. |
| **Tab close / reload** | state is **gone**. No save, no restore — in-memory only (F5). On the next load, lifecycle restarts at `initialState()`. |

There is **no persistence layer, no `localStorage`, no serialization, no cross-tab sync** (F5). The
held cell's entire lifetime is one tab session.

> **Buffer hygiene constraint (INT-4) — a data-flow invariant, restated here because it shapes what
> M2 is allowed to feed the held state.** M2 only ever calls M1 with **well-formed, whitelisted**
> inputs: `inputDigit(state, d)` where `d` is a single char `'0'`–`'9'`; `inputDecimal(state)` for
> `.`; `inputOperator(state, op)` where `op` is a typed `Operator` from §3.3; and the parameterless
> clear/equals functions. M2 **never** passes raw `event.key` or arbitrary strings into M1 (a garbage
> buffer would make M1's `new Decimal(entryBuffer)` throw). The keyboard handler whitelists keys and
> maps them to these typed calls — it does not forward unknown keys. *(This is an input-binding rule;
> `02-flows.md` / `03-rules.md` own the full key-whitelist. Stated here because it is the contract on
> what may ever enter the held `EngineState`.)*

---

## 5. Data-flow diagram — keypress → engine → derived render

```
                 ┌─────────────────────────────────────────────────────────┐
                 │  M2 (stateful host)                                      │
                 │                                                          │
  user input     │   ┌──────────────┐   whitelist + map (INT-4, §3.3)      │
  (click / key) ─┼──▶│ input handler │──────────────┐                      │
                 │   └──────────────┘               │                      │
                 │                                   ▼                      │
                 │                          inputDigit(state,'7')          │
                 │                          inputOperator(state,'add')     │
                 │                          inputEquals(state) ...         │
                 │                                   │  (call into M1)      │
                 │   ┌───────────────────────────────┼──────────────────┐  │
                 │   │  M1 (stateless reducer, pure)  ▼                  │  │
                 │   │            (state) ──────▶ newState               │  │
                 │   └───────────────────────────────┬──────────────────┘  │
                 │                                    │                     │
                 │              state = newState  ◀───┘  (REPLACE, §1)      │
                 │              (the ONE held cell)                        │
                 │                     │                                    │
                 │      ┌──────────────┼───────────────────────────┐       │
                 │      ▼              ▼                            ▼       │
                 │  getDisplayValue  read accumulator+          (errorState │
                 │  (state)          pendingOperator            !== null?)  │
                 │      │             → pendingLine(state)          │       │
                 │  tag→sentence      → glyph(op)              error styling│
                 │  (INT-2, §3.1)     (INT-3, §3.2)                 │       │
                 │      │              │                            │       │
                 │      ▼              ▼                            ▼       │
                 │   primary       pending-expression          display     │
                 │   display          line                     class       │
                 │      └──────────────┴────────────┬───────────┘          │
                 │                                  ▼                       │
                 │                              RE-RENDER                   │
                 └─────────────────────────────────────────────────────────┘

  Stored:   ONE EngineState (§1)  +  one frozen operator-map constant (§3.3)
  Derived:  primary display string, pending-expression line, error styling   (nothing stored)
  Persisted: NOTHING (F5 — in-memory, dies with the tab)
```

---

## Decisions logged this file

| ID | Decision | Authority |
|---|---|---|
| D-M2-DM-01 | M2 holds `EngineState` as one whole-object reactive cell, replaced atomically — not five split fields. | CP-7 technical |
| D-M2-DM-02 | M2-owned error wording: `'divide-by-zero'` → "Cannot divide by zero", `'overflow'` → "Number too large" (microcopy refinable in `04-ui.md`). | CP-7 technical (UX wording owner-validated in `04-ui.md`) |
| D-M2-DM-03 | Pending-line hide/show: show only when `accumulator !== null` AND `pendingOperator !== null` AND not error AND not `justEvaluated`; hidden otherwise. | CP-7 technical (derivation pre-approved INT-3) |
| D-M2-DM-04 | Operator map is M2-owned constant data: key `+ - * /` ↔ `Operator` union ↔ true-Unicode glyph `+ − × ÷`. | CP-7 technical |

> These are concrete sub-choices under the orchestrator's pre-approved INT-1/INT-3 framing. Candidates
> for `_decisions.md` aggregation when the M2 `_index.md` is assembled.

---

## Dependencies & deferrals (summary)

- **The UI primitive that holds the cell** (`let` re-assignment vs framework signal/store) → `06-tech-choices.md` (OQ1, once UI approach is picked). This file fixes the *shape* (one cell, whole object), not the primitive.
- **Final pending-line visual content + microcopy + key whitelist** → `02-flows.md` / `04-ui.md`.
- **All held-state *transitions*** (what each `inputX` does to the fields) → M1's `01-data-model.md §2` (M2 holds; M1 mutates). M2 does not re-specify them.
- **Rendering, layout, glass styling, focus rings, motion** → `04-ui.md` + `08-design-system.md` (M2 holds no data for these; they are CSS/DOM).
