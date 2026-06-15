---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/01-vision.md
  - storm/structure/02-user-roles.md
  - storm/capture/03-ideation-coverage.md
storm-phase: structure
storm-canonical: true
---

# Modules — Calculator

> Status: **proposed** (STRUCTURE phase, AI-led draft). Owner confirms comprehension, not wording.

---

## The honest headline

This is a **four-module** decomposition, and that is already generous for a zero-stakes client-side calculator. There is no backend, no data model, no auth, no multi-role surface (`02-user-roles.md:18`) — so there is nothing to split into "service" / "persistence" / "API" layers. The split below is by **concern**, not by tier: pure logic, the visual surface, an ephemeral record, and look-and-feel.

Resisting further decomposition is itself the design (`00-domain-lens.md:70`; CP-13 over-engineering dim). Splitting "buttons" from "display," or "addition" from "division," would be theater — they share state and ship together. Four modules is the floor that keeps each concern nameable without manufacturing seams.

---

## Module list

| # | Module | One-line purpose | Visible surface? |
|---|---|---|---|
| **M1** | **Calculation engine** | Pure arithmetic logic — turns input into a correct result or a graceful error. | No (headless logic) |
| **M2** | **Calculator UI / keypad** | The interactive surface — buttons, display, and the wiring from click/keyboard to the engine. | Yes (the app) |
| **M3** | **History tape** | An in-session record of past calculations, shown alongside the keypad. | Yes |
| **M4** | **Theming** | Light/dark toggle and application of the design-system tokens that make it "non-boring." | Yes (cross-cutting) |

Foundation-first build order (`00-domain-lens` / CP-10 dark-stretch): **M1 → M2 → M3 → M4**. M1 is headless and produces no screen — the first demo-able surface lands at M2. That dark stretch is one module deep and expected, not stuck.

---

## M1 — Calculation engine

**Purpose:** the pure, headless core. Given a sequence of inputs (numbers, operators, decimal, clear, equals) it computes the correct result and flags error states. No DOM, no styling, no knowledge of how input arrives.

**Key responsibilities:**
- The four arithmetic operations: add, subtract, multiply, divide (`pre-approved scope`).
- Input handling at the value level: digit entry, decimal point (one per number), the running operand/operator state machine.
- Equals: resolve the pending operation and produce a result.
- Clear / AC: reset current entry vs. reset all state.
- Error states: divide-by-zero and numeric overflow surfaced as a defined error value the UI can render gracefully (`01-vision.md:39`; `03-ideation-coverage.md:51`).
- Decimal and negative results (negatives arise from subtraction; assumed-yes per `03-ideation-coverage.md:50`).

**Explicitly NOT in M1:**
- No rendering, no buttons, no event listeners — it does not touch the DOM (that is M2).
- No memory keys (M+, M−, MR, MC) — out of scope (`01-vision.md:50`).
- No scientific/extended functions, no percent, no ± sign-toggle — out of scope (`01-vision.md:51-52`).
- No history storage — it computes; M3 records.
- No persistence — state is in-memory and dies with the tab (`02-user-roles.md:57`).

---

## M2 — Calculator UI / keypad

**Purpose:** the interactive surface the end-user actually touches — the button grid, the result display, and the binding that routes both mouse clicks and physical keyboard presses into M1.

**Key responsibilities:**
- Render the keypad: digit buttons, the four operators, decimal, equals, clear/AC.
- Render the display: live current entry and the equals result, including graceful rendering of M1's error state (e.g. "Cannot divide by zero") rather than a raw crash (`01-vision.md:39`).
- Click input binding: button presses dispatch to the engine.
- Keyboard input binding: physical keys (0–9, + − * /, Enter/=, Esc/clear, .) mapped to the same engine actions — a chosen feature (`01-vision.md:40`; `02-user-roles.md:39`).
- Baseline usability: keyboard operability, focus order, contrast, semantic buttons — the craft floor holds at zero stakes (`00-domain-lens.md:59`; `01-vision.md:41`).
- Responsive layout so it works on phone and desktop (`03-ideation-coverage.md:52`).

**Explicitly NOT in M2:**
- No arithmetic logic — M2 never computes; it delegates every operation to M1.
- No history list rendering — that surface is M3 (M2 owns the keypad + display only).
- No theme/color decisions — M2 consumes design tokens but the toggle and token set live in M4.
- No persistence or accounts — single anonymous stateless user (`02-user-roles.md:28`).

---

## M3 — History tape

**Purpose:** an in-session, in-memory record of completed calculations, displayed alongside the keypad so the user can glance back at what they just computed.

**Key responsibilities:**
- Record each completed calculation (expression + result) when equals resolves.
- Display the running tape in the UI, most-recent-visible, scrollable if it grows.
- Clear the tape (at minimum, clears with a full AC / tab close).

**Explicitly NOT in M3:**
- **No persistence.** The tape is ephemeral in-memory state and dies with the tab — no localStorage, no DB, no cross-session or cross-device carry-over (`00-domain-lens.md:67`; `02-user-roles.md:41,57`).
- No editing or re-running past entries — it is a read-only record, not a re-computation surface (avoids scope creep, `01-vision.md:54`).
- No export, share, or copy-to-clipboard feature — out of scope as feature bloat.
- No arithmetic — M3 records what M1 computed; it does not calculate.

---

## M4 — Theming

**Purpose:** the look-and-feel layer that carries the one first-class product axis — "ga bosenin" (`00-domain-lens.md:57`; `01-vision.md:38`). Owns the light/dark toggle and the application of the design-system tokens across M2 and M3.

**Key responsibilities:**
- Light/dark theme toggle (2-state) — a chosen feature, user-flippable (`01-vision.md:40`; `02-user-roles.md:42`); the toggle lives in the `.toggle-slot` reserved in M2's markup.
- First-load default follows the OS via CSS `prefers-color-scheme`; once the user flips the toggle, their choice overrides the OS default and is remembered.
- Persist the chosen theme preference in `localStorage` under a single small key (e.g. `"theme"`) — the **one documented persistence exception** in this product (see "Explicitly NOT in M4" below; cf. `00-domain-lens.md` §4a).
- Apply the design-system tokens (color, typography, spacing, motion) defined in `08-design-system.md` so the calculator reads as deliberate, not template-default (`01-vision.md:38`).
- Cross-cutting: M4 styles the surfaces M2 and M3 render; it is the visual skin over both.

**Explicitly NOT in M4:**
- It does **not** author the design system — the aesthetic direction (a business/taste decision) is captured in `08-design-system.md` per CP-7; M4 *applies* those tokens.
- **The theme *preference* persists; nothing else does.** The single `localStorage` theme key is the sole carve-out from the product-wide no-persistence stance — the **M3 history tape stays ephemeral / in-memory and dies with the tab** (`03-modules.md:89`). No history persistence, no DB, no server-side, no cross-**device** sync (localStorage is same-device only).
- No explicit 3rd "System" toggle option for now — light/dark only; an explicit "System" choice is **deferred** to a later CAPTURE re-entry (the first-load default already follows the OS).
- No per-user theming, no theme accounts, no custom-theme builder — single anonymous user, no settings backend (`02-user-roles.md:56`).
- No business logic or input handling — purely presentational.

---

## What is deliberately NOT a module (anti-inflation)

| Not a module | Why |
|---|---|
| Persistence / storage layer | No data survives the tab; nothing to persist (`02-user-roles.md:57`). |
| Auth / accounts / user management | Zero roles, single anonymous user (`02-user-roles.md:54`). |
| Backend / API / services | Client-side only, no server (`01-vision.md:53`). |
| Settings / preferences module | The only "setting" is the theme toggle, which lives in M4. A standalone settings module for one toggle is over-engineering. |
| Separate "input router" module | Click and keyboard binding both live in M2 — they target the same engine actions; splitting them manufactures a seam. |

> Anti-inflation guard (CP-13): four concern-modules is the honest floor for a zero-stakes calculator. The gravity here is design-craft + framework-exercise — not a layered enterprise architecture (`00-domain-lens.md:70`).

---

## Module count: **4** (M1 engine, M2 UI/keypad, M3 history, M4 theming). No TBDs — every module fully specified at structure altitude.
