---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_briefing.md
  - storm/specify/02-calculator-ui/01-data-model.md
  - storm/specify/01-calculation-engine/02-flows.md
  - storm/structure/08-design-system.md
---

# M2 Flows — Input → Engine-Call → Re-Render Sequences

> **Scope:** the user-facing flows of the **keypad UI** only. Every flow is the same three-beat
> shape: **trigger → whitelist/map → call one M1 `inputX(state)` → replace the held cell → re-render**
> from the new state (INT-1, `01-data-model.md` §1). M2 **never computes** (F2) — all arithmetic and
> all state transitions belong to M1; this file describes only *which* M1 function each user action
> calls and *what the user sees* afterward. The held state, derivations (display string, pending line,
> glyph map) and their show/hide conditions are defined in `01-data-model.md` §3 and are referenced,
> not re-specified, here.
>
> **NOT in this file:** arithmetic / state-transition mechanics (M1's `02-flows.md` — what `inputX`
> does *internally*); pixels, layout, focus-ring/glass styling (`04-ui.md` + `08-design-system.md`);
> history (M3, F3); theme toggle (M4, F4); framework/bundler code specifics (BUILD). Flows here are
> **behavior-level**, approach-agnostic: they assume one held `EngineState` cell and one `render()`
> that reads it.
>
> **The universal post-call step (written once, referenced as "re-render" below):**
> after `state = inputX(state, …)`, M2 re-derives and repaints — primary display = tag→sentence over
> `getDisplayValue(state)` (INT-2, §3.1); pending line = `pendingLine(state)` (INT-3, §3.2); error
> styling = `state.errorState !== null` as a CSS class (INT-6, §2). Nothing is stored; all three are
> pure reads of the freshly held state.

---

## Flow index

| # | Flow | Trigger(s) | M1 call |
|---|---|---|---|
| 1 | Digit press | digit button / key `0`–`9` | `inputDigit(state, d)` |
| 2 | Decimal press | `.` button / `.` key | `inputDecimal(state)` |
| 3 | Operator press | operator button / `+ - * /` key | `inputOperator(state, op)` |
| 4 | Equals | `=` button / `Enter` or `=` key | `inputEquals(state)` |
| 5 | Clear (CE / AC) | CE button / AC button / `Esc` | `inputClearEntry` / `inputAllClear` |
| 6 | Error (latched) | any flow returns `errorState !== null` | (display-only; latch is M1-side) |
| 7 | App-load | page load / mount | `initialState()` |
| 8 | Keyboard binding | global `keydown` | dispatches to flows 1–5 |

**The convergence invariant (`03-modules.md:67`).** Click and keyboard are **not two logic paths** —
both modalities resolve to the **same** M1 call. A digit *button* and a number *key* both call
`inputDigit(state, d)`; an operator *button* and a `+` *key* both call `inputOperator(state, 'add')`.
The only difference is the *source* of the trigger; the engine call, the state replacement, and the
re-render are identical. Flows 1–5 below describe that shared call; flow 8 describes how the keyboard
source funnels into it.

---

## 1. Digit press flow

**Trigger:** click on a digit button `0`–`9`, **or** keydown of a number key `0`–`9` (routed by flow 8).

**Steps:**
1. Resolve the digit to a single character `d ∈ {'0','1',…,'9'}` (button carries its own digit;
   keyboard path whitelists `event.key` first — INT-4, flow 8).
2. Call `state = inputDigit(state, d)` — the **only** way a digit enters M1. M2 passes a single
   whitelisted char, never a raw string (INT-4, `01-data-model.md` §4).
3. **Re-render.**

**Engine call:** `inputDigit(state, d)`.

**Resulting state change (M1-owned — see M1 `02-flows.md` §1):** appends/replaces `entryBuffer`
(leading-zero hygiene; post-equals fresh-start when `justEvaluated` was true). M2 does not compute
this — it holds the returned state.

**What re-renders:** primary display shows the new `entryBuffer` (via `getDisplayValue`, §3.1). The
pending line is **unchanged** by a digit when an operator is pending (still shows `<acc> <glyph>`);
it stays hidden in a fresh sequence (§3.2 conditions).

**Motion:** button **press** scale `0.96` + fill-brightness lift on `:active` (design §7, 80ms) —
CSS-native on click; on a keyboard digit there is no `:active`, so the press animation does not fire
(acceptable — keyboard users get the display update; an optional programmatic press-flash is `04-ui.md`
craft, not required here). No result motion (that is equals only).

---

## 2. Decimal press flow

**Trigger:** click on the `.` button, **or** keydown of `.` (flow 8).

**Steps:**
1. Call `state = inputDecimal(state)` (no argument — the decimal point is a fixed action).
2. **Re-render.**

**Engine call:** `inputDecimal(state)`.

**Resulting state change (M1-owned — M1 §1.2):** appends `.` to `entryBuffer` if none present;
**no-op** if `entryBuffer` already contains `.` (one decimal per number, F2). M2 does not enforce this
guard — M1 does; M2 just re-renders whatever state comes back (so a second `.` simply yields an
unchanged display).

**What re-renders:** primary display shows `entryBuffer` (e.g. `"0."` then `"0.3"`). Pending line
unchanged.

**Motion:** button press (design §7) on click; none on keyboard.

---

## 3. Operator press flow

**Trigger:** click on an operator button (`+ − × ÷`), **or** keydown of `+ - * /` (flow 8).

**Steps:**
1. Map the input to the typed `Operator` via the **M2-owned operator map** (INT-5, §3.3):
   button id / key `+ - * /` → `'add' | 'subtract' | 'multiply' | 'divide'`. M2 passes the typed
   union member, never a raw glyph or key string (INT-4).
2. Call `state = inputOperator(state, op)`.
3. **Re-render.**

**Engine call:** `inputOperator(state, op)` where `op: Operator`.

**Resulting state change (M1-owned — M1 §2):** commits `entryBuffer` into `accumulator`, registers
`pendingOperator`, resets `entryBuffer`. If an operator was **already** pending, M1 auto-resolves the
prior operation left-to-right *first* (chaining, M1 §2.2) — that resolution can itself raise an error
(→ flow 6). All of this is M1's; M2 only re-renders the result.

**What re-renders:** the **pending-expression line now shows `<accumulator> <glyph>`** —
`pendingLine(state)` returns e.g. `"12 +"` because `accumulator !== null` **and**
`pendingOperator !== null` (§3.2). The glyph is the true-Unicode form from the operator map
(`+ − × ÷`, F10, §3.3). Primary display shows the reset `entryBuffer` (typically `"0"`), ready for the
right-hand operand. (On a chained resolve, the primary display first reflects M1's intermediate result
now sitting in `accumulator`, surfaced through the pending line.)

**Motion:** button press (design §7). No result fade (that is equals only) — even on a chained
auto-resolve, the operator press uses the press motion, not the result motion (the result motion is
reserved for an explicit `=`, keeping "I finished" visually distinct from "I'm continuing").

---

## 4. Equals flow

**Trigger:** click on the `=` button, **or** keydown of `Enter` or `=` (flow 8; both keys map to the
same call).

**Steps:**
1. Call `state = inputEquals(state)`.
2. **Re-render.**

**Engine call:** `inputEquals(state)`.

**Resulting state change (M1-owned — M1 §3):** resolves the pending operation; result lands in
`entryBuffer` (and `accumulator` for chaining), `pendingOperator` clears, `justEvaluated` → `true`.
If there is **no** pending operator, M1 no-ops (displays the current value, M1 §3.2). If the resolve is
unrepresentable (÷0 or overflow), M1 latches `errorState` instead (→ flow 6). M2 computes none of this.

**What re-renders:** primary display shows the **result** string (via `getDisplayValue`, §3.1). The
**pending line clears** — `pendingLine(state)` returns `""` because `justEvaluated === true` (§3.2
hide condition). After equals, the next digit starts fresh and the next operator chains from the result
(M1 §3.3) — M2 just holds the state; those are flows 1 and 3 on the post-equals state.

**Motion:** **result fade+rise** — `opacity 0→1` + `translateY(6px→0)` over `200ms ease-out`
(design §7, "Result (equals)"). This is the one flow that fires the result motion; it marks "this
value updated." Honor `prefers-reduced-motion` (drop the transform, keep the instant value swap —
design §7/§8, read live via media query, `01-data-model.md` §2). The equals **button** also gets the
standard press motion on click.

---

## 5. Clear flows — CE and AC

Two distinct clears, two distinct engine calls (mirrors M1 §4 — CE = local wipe, AC = full reset).

### 5.1 Clear-entry (CE)

**Trigger:** click on the **CE** button. *(CE has no dedicated key in the whitelist — `Esc` is bound
to AC, the heavier escape; CE stays button-only. See flow 8.)*

**Steps:** `state = inputClearEntry(state)` → **re-render.**

**Engine call:** `inputClearEntry(state)`.

**Resulting state change (M1-owned — M1 §4.1):** resets `entryBuffer` to `"0"`, clears
`justEvaluated`, **and clears `errorState` if latched** — the pending operation (`accumulator` +
`pendingOperator`) **survives**. M2 holds the result.

**What re-renders:** primary display → `"0"`. Pending line **persists** if an operation was pending
(still `<acc> <glyph>`) — the in-progress calculation is recoverable. Error styling clears if it was
set.

**Motion:** button press (design §7).

### 5.2 All-clear (AC)

**Trigger:** click on the **AC** button, **or** keydown of `Esc` (flow 8).

**Steps:** `state = inputAllClear(state)` → **re-render.**

**Engine call:** `inputAllClear(state)` (returns `initialState()`-equivalent — full reset, M1 §4.2).

**Resulting state change (M1-owned):** all five fields reset to fresh — `entryBuffer = "0"`,
`accumulator = null`, `pendingOperator = null`, `justEvaluated = false`, `errorState = null`.

**What re-renders:** primary display → fresh `"0"`; **pending line hidden** (no accumulator / no
pending operator, §3.2); error styling cleared. The calculator is back to its load state.

**Motion:** button press (design §7).

> **CE vs AC for the user.** CE = "fix the number I'm typing, keep the calculation"; AC = "start
> over." Both escape an error latch (flow 6); CE is the lighter escape that preserves the pending op.
> The data effects are M1's (§4 of M1 flows); M2's job is to make the two buttons visually distinct
> and re-render the returned state.

---

## 6. Error flow (latched)

**Trigger:** **not a key** — this flow fires whenever any of flows 1–4 returns a state with
`errorState !== null` (a ÷0 or overflow that M1 latched during an equals or a chained operator
resolve — M1 §5). M2 detects it purely by reading the returned state.

**Steps:**
1. After the triggering `inputX` call, the held state now has `errorState` set (`'divide-by-zero'` or
   `'overflow'`).
2. **Re-render** in error mode:
   - Primary display shows the **error SENTENCE**, not the tag (INT-2 / D-M2-DM-02, §3.1):
     `'divide-by-zero'` → **"Cannot divide by zero"**; `'overflow'` → **"Number too large"**.
   - **Error styling applied** — the CSS error class is added because `state.errorState !== null`
     (INT-6, §2). Per design §8, the error is conveyed by **text**, not color alone (don't-rely-on-
     color-alone).
   - Pending line is **hidden** (`pendingLine` returns `""` on error, §3.2 — error owns the display).

**Engine call:** none of its own — the latch happened inside the flow that triggered it. Flow 6 is the
*display* response to a latched state.

**Resulting state change:** none initiated by M2. The state stays latched until the user escapes.

**What the user sees and which keys stay productive (INT-6, M1 §5.2–5.3):** while latched, M1
**no-ops** every digit / decimal / operator / equals — so those buttons and keys do nothing at the
**engine level** (the held state does not change, the display keeps showing the error sentence). The
**only productive inputs are CE and AC** (and the `Esc` key → AC):
- **CE** clears the error but **keeps** the pending operation (flow 5.1) — the user can retry the
  operand.
- **AC** / **Esc** fully resets (flow 5.2).

Because the no-op is enforced **at the engine** (M1), M2 does not need to disable buttons to be
*correct* — pressing `5` while latched simply produces an unchanged state and a no-op re-render. But to
avoid the user "wondering why keys don't work" (INT-6), M2 **makes CE/AC the obvious escape**: the
error styling on the display signals the latched mode, and `04-ui.md` may additionally de-emphasize the
inert keys and/or emphasize CE/AC (UX craft, deferred to `04-ui.md` — this flow fixes the *behavior*:
CE/AC/Esc are the escapes, everything else is inert until escape).

**Motion:** no result fade (the error is not a computed result). Button press still fires on CE/AC
click. (An optional error-shake is **out of scope** — design §7 motion table lists no error motion, and
adding one would be scope-creep; if desired it is `04-ui.md`'s call, not assumed here.)

---

## 7. App-load flow

**Trigger:** page load / app mount.

**Steps:**
1. Seed the single held cell: `state = initialState()` (`01-data-model.md` §4 — equivalent to an
   automatic all-clear at startup, F5).
2. Render the **default theme** (M2 ships one theme, authored against CSS custom properties so M4 can
   swap later — F4; M2 does **not** build a toggle).
3. **Initial render:** primary display shows `"0"`; pending line hidden (fresh state, §3.2); no error
   styling.
4. **Focus handling:** the keypad is keyboard-operable from load. Per design §8, focus follows reading
   order across the grid and every button shows a visible focus ring (`2px solid var(--accent)`); the
   global keydown handler (flow 8) is attached so number/operator keys work **without** first clicking a
   button. (Whether to set initial DOM focus on a specific element, e.g. the body or AC, is a small UX
   choice for `04-ui.md`; the requirement here is that keyboard input is live from load — flow 8 is
   bound at mount.)

**Engine call:** `initialState()`.

**Resulting state:** `["0" | null | null | false | null]` held; nothing persisted (F5 — dies with the
tab; next load restarts here).

**What renders:** the fresh calculator — display `"0"`, default-theme glass, no pending line.

**Motion:** none required on load (a one-time mount fade is optional `04-ui.md` polish, not specified
here).

---

## 8. Keyboard binding flow

A single global `keydown` handler is the keyboard **source** that funnels into flows 1–5. It is the
enforcement point for buffer hygiene (INT-4) — the place a raw `event.key` must be **whitelisted and
mapped** before any M1 call.

**Trigger:** `keydown` anywhere in the app (one document/root-level listener, attached at mount —
flow 7).

**Steps (the whitelist-then-dispatch table):**

| `event.key` | Whitelisted? | Action | Dispatches to |
|---|---|---|---|
| `'0'`–`'9'` | ✅ | `inputDigit(state, key)` (key **is** the single char) | flow 1 |
| `'.'` | ✅ | `inputDecimal(state)` | flow 2 |
| `'+'` | ✅ | map → `'add'`, `inputOperator(state, 'add')` | flow 3 |
| `'-'` | ✅ | map → `'subtract'`, `inputOperator(state, 'subtract')` | flow 3 |
| `'*'` | ✅ | map → `'multiply'`, `inputOperator(state, 'multiply')` | flow 3 |
| `'/'` | ✅ | map → `'divide'`, `inputOperator(state, 'divide')`; `preventDefault` (`/` is Firefox quick-find) | flow 3 |
| `'Enter'` | ✅ | `inputEquals(state)` | flow 4 |
| `'='` | ✅ | `inputEquals(state)` | flow 4 |
| `'Escape'` | ✅ | `inputAllClear(state)` | flow 5.2 |
| **anything else** | ❌ | **ignored** — return early, no engine call, no `preventDefault` | — |

**The hard rules (INT-4, `01-data-model.md` §4):**
1. **Whitelist, never forward.** Only keys in the table above reach M1. Every other key (letters,
   `Backspace`, `Tab`, arrows, `F5`, modifier combos, …) is silently ignored — the handler returns
   early. **Never pass raw `event.key` to `inputDigit`** except where the key already *is* a single
   `'0'`–`'9'` char that the whitelist confirmed.
2. **Map before calling.** Operator keys `+ - * /` are translated through the M2 operator map (§3.3)
   to the typed `Operator` union *before* `inputOperator` — never the raw glyph/key.
3. **`preventDefault` where the key has a conflicting browser default.** Notably `/` (Firefox quick-
   find) and `Enter` if the calculator ever sits in a form context; apply `preventDefault` on the
   whitelisted keys that would otherwise trigger browser behavior. Do **not** `preventDefault` on
   ignored keys (let `F5`, devtools, tab-navigation, etc. work normally).
4. **Convergence (`03-modules.md:67`).** Each row dispatches to the **same** engine call its
   click-equivalent uses (flows 1–5). There is no keyboard-specific calculation logic — the keydown
   handler is a thin source adapter onto the shared flows.
5. **Ignore auto-repeat / modifiers as appropriate.** Held-key auto-repeat naturally re-fires the same
   whitelisted call (acceptable — equivalent to repeated taps). Combos like `Ctrl/Cmd+R`, `Cmd+C` carry
   a modifier and a non-whitelisted intent → fall through to "ignored" so browser shortcuts keep working
   (do not hijack `=`/digits when a command/control modifier is held).

**Engine calls:** whichever flow 1–5 call the whitelisted key maps to.

**Resulting state change / re-render / motion:** identical to the click path of the dispatched flow —
the keyboard is a different *trigger*, the same *behavior*. (Press-scale motion is `:active`-driven and
so click-only; a keyboard press updates the display without the press flash — see flow 1.)

---

## 9. Flow interaction map — composing the keypad flows

The flows above are slices; real use chains them. M2's job at every node is the same: call M1, replace
the cell, re-render.

```
[APP LOAD — flow 7]  state = initialState()  → display "0", no pending line
      │
      ├─ digit (flow 1, click OR key) ───────────────┐
      │     state = inputDigit(state, d) → re-render  │
      │                                               ▼
      ├─ decimal (flow 2) ──────────────────► entryBuffer grows; display updates
      │     state = inputDecimal(state)
      │
      ├─ operator (flow 3, click OR key) ────► pending line shows "<acc> <glyph>"
      │     map key/btn → Operator (INT-5)        (chaining auto-resolves prior op in M1)
      │     state = inputOperator(state, op)            │
      │                                                 ├─ resolve raises ÷0/overflow?
      │                                                 │      → ERROR (flow 6)
      │                                                 └─ ok → keep typing right operand
      │
      ├─ equals (flow 4, =/Enter OR btn) ────► RESULT (fade+rise §7); pending line CLEARS
      │     state = inputEquals(state)                  │
      │                                                 ├─ ÷0 / overflow → ERROR (flow 6)
      │                                                 │     display = sentence (INT-2),
      │                                                 │     error styling on; only CE/AC/Esc productive
      │                                                 └─ ok → post-equals: next digit=fresh,
      │                                                          next operator=chain (M1 §3.3)
      │
      └─ clear:
            CE (flow 5.1, button) ─► display "0", pending op SURVIVES, error cleared
            AC (flow 5.2, button OR Esc) ─► full reset → load state

  Keyboard source (flow 8): global keydown → whitelist (INT-4) → map → dispatches into flows 1–5.
                            Same engine calls as clicks. Unknown keys ignored.
```

**Cross-file contract:**
- `01-data-model.md` — the single held cell, the derivations (`getDisplayValue` tag→sentence §3.1,
  `pendingLine` §3.2, operator map §3.3) and their show/hide conditions. This file *triggers* those
  derivations; it does not redefine them.
- `01-calculation-engine/02-flows.md` — what each `inputX` does to the state *internally* (M1 owns the
  transitions; M2 only holds the result). Flows here say *when M2 calls which function*; M1's flows say
  *what the function computes*.
- `08-design-system.md` §7 — motion (button press 80ms; result fade+rise 200ms; `prefers-reduced-
  motion`); §8 — focus ring, semantics, error-by-text-not-color, tap targets.
- `03-rules.md` (M2) — the full key-whitelist as a *rule* + any input-binding rules; `04-ui.md` — the
  pixels, the inert-key de-emphasis during error, initial focus target; `05-edge-cases.md` (M2) —
  boundary input bindings (rapid keys, focus-loss, held-key repeat) extending flow 8.

> **Anti-inflation note (CP-13/YAGNI).** Exactly the keypad surface: 8 flows, no more. **No history
> flow** (that is M3's add-entry/render — F3), **no theme-toggle flow** (M4 — F4), no settings, no
> persistence (F5). Each flow delegates to one verified M1 function; M2 invents no calculation path.
