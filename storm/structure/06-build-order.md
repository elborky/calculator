---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/03-modules.md
  - storm/structure/05-dependency-map.md
  - storm/structure/01-vision.md
storm-phase: structure
storm-canonical: true
---

# Build Order — Calculator

> Status: **proposed** (STRUCTURE phase, AI-led draft). Owner confirms comprehension, not wording.
>
> This file turns the clean DAG from `05-dependency-map.md` into an **ordered build sequence** with per-step rationale, plus the **dark-stretch expectation-setting** and **small-wins milestone framing** the ADHD-prone profile needs (CP-10). The order is foundation-first: most-depended-on root first, visual payoff last.

---

## The sequence in one line

```
M1  ──▶  M2  ──▶  M3  ──▶  M4
engine   keypad   history  theming
(dark)   FIRST    surface  payoff
         WIN
```

Reverse-topological walk of the dependency DAG (`05-dependency-map.md:62`): build the root everything leans on (M1) first, then the surfaces, then the cross-cutting skin. No cycles, so the order is forced for M1→M2; M3-before-M4 is a deliberate choice (see step 4).

---

## Ordered build sequence — rationale per step

### Step 1 — M1 Calculation engine *(foundation root, headless)*

**Why first:** M1 depends on nothing (`05-dependency-map.md:22`). It is the foundation everything else calls — M2 renders its result, M3 records it, M4 skins surfaces built on it. Building the pure arithmetic core first means the logic is firm before any UI binds to it, so M2/M3/M4 never get reworked when the engine settles. That zero-rework property is both the technically-safest order *and* the motivationally-safest one for this profile: early dopamine bought on a not-yet-final foundation would be rework debt, and rework churn is itself a demotivation hazard (`00-domain-lens` / CP-10 dark-stretch; `05-dependency-map.md:83`).

**What lands:** four operations (add/subtract/multiply/divide), the operand/operator state machine, decimal handling, equals resolution, clear/AC, and graceful error states (divide-by-zero, overflow) (`03-modules.md:42-48`).

**Visible?** **No** — headless logic, no screen. This is the dark stretch (see callout below).

---

### Step 2 — M2 Calculator UI / keypad *(first demo-able surface)*

**Why second:** M2 depends only on M1 (`05-dependency-map.md:23`) — every button and keypress dispatches into the engine that now exists. It cannot function before M1, and nothing else needs to exist for it to work. Building it second turns the headless engine into a **touchable, working calculator** — the first thing the owner can actually open and use.

**What lands:** the keypad (digits, four operators, decimal, equals, clear/AC), the display (live entry + result + graceful error rendering), click binding, keyboard binding (0-9, + − * /, Enter/=, Esc/clear, .), responsive layout, and baseline usability (keyboard operability, focus order, contrast, semantic buttons) (`03-modules.md:63-69`).

**Visible?** **Yes** — ⭐ **first visible win lands here** (see marker below).

---

### Step 3 — M3 History tape *(second surface)*

**Why third:** M3 depends on both M1 (the result) and M2 (the equals event fires in the UI; the tape renders alongside the keypad) (`05-dependency-map.md:24`). Both must exist first. With M2 working, adding the in-session tape is a clean additive surface — it records what M1 computed at the moment M2's equals resolves, and shows it scrollable beside the keypad.

**What lands:** record each completed calculation (expression + result) on equals, display the running tape most-recent-visible, clear with AC / tab close. Ephemeral in-memory only — no persistence (`03-modules.md:84-89`).

**Visible?** **Yes** — extends the working app with a visible record.

---

### Step 4 — M4 Theming *(cross-cutting skin, visual payoff)*

**Why last:** M4 is **presentational coupling, not causal logic** (`05-dependency-map.md:27`). M2 and M3 are fully functional in default/unstyled markup before M4 touches them — nothing *blocks* on theming. It goes last because it has the **most surfaces to skin once they exist**: doing it after M2 *and* M3 means M4 makes the whole functional surface "non-boring" in one pass, rather than re-skinning as new surfaces arrive. **This is why M3 is sequenced before M4** — the full surface exists before the visual skin lands (`05-dependency-map.md:66`).

**What lands:** light/dark toggle, application of the `08-design-system.md` tokens (color, type, spacing, motion) across M2 and M3 (`03-modules.md:100-103`). The toggle also persists the chosen theme in a single `localStorage` key, with the first-load default following the OS via `prefers-color-scheme` (the one documented persistence exception; M3's history tape stays ephemeral). Its true upstream input is the design-token document (a taste decision, CP-7) — not a sibling module.

**Visible?** **Yes** — this is where the one first-class product axis ("ga bosenin") finally pays off (`00-domain-lens.md:57`; `01-vision.md:38`).

---

## ⚠️ Dark-stretch callout — set the expectation up front (CP-10)

**The dark stretch is M1 only — exactly one module deep.**

M1 is headless: it produces **no screen**. During Step 1 there is correct, tested arithmetic logic but nothing to *look at*. Per the CP-10 dark-stretch + CP-4 narration convention, this is announced **before** it starts, not discovered mid-build:

> *"The next module — the calculation engine — is headless. There won't be a demo-able screen until M2; that's normal, not stuck. I'll narrate each engine piece as it lands (the four operations, the operator state machine, error handling) so you can see the structure forming even before there's a screen."*

Because the dark stretch is only one module deep, the builder enters the valley **sighted**: a single short foundation step, then the screen appears. During Step 1, narrate per-fragment (escalate one notch on the CP-10 curve even at low stall-risk) so structural progress stays legible while no UI exists.

**First demo-able moment = end of Step 2 (M2).**

---

## ⭐ First visible win marker

| Milestone | When the owner first SEES something work |
|---|---|
| **First visible win** | **End of Step 2 (M2 complete).** A working calculator appears on screen — buttons click, keyboard types, the display computes real results, errors render gracefully. This is the moment "no screen yet" becomes "I can use this." |

Everything before this point (M1) is invisible-but-load-bearing; everything after (M3, M4) *adds to* an already-visible, already-working app. The hardest motivational gap — from "a lot of work done" to "nothing visible yet" — is crossed exactly once, at the M1→M2 boundary, and it is only one module wide.

---

## Milestone framing for small-wins narration (CP-10)

Each step is a milestone to narrate explicitly on completion. Framing held ready so the dopamine hit is concrete, not generic:

| Step | Milestone | Narration framing on completion |
|---|---|---|
| **M1** | Engine landed (foundation) | *"Foundation done: the calculation engine is built and correct — all four operations, the state machine, error handling. No screen yet (that's M2, next) — but the brain of the calculator works."* Narrate per-fragment **during** the step (each operation, state machine, error handling) to keep the dark stretch legible. |
| **M2** | ⭐ First visible win | *"Module 2 of 4 done — and here it is: a working calculator you can actually use. Click the buttons, type on your keyboard, it computes. This is the first thing you can open and play with."* Offer a live demo. |
| **M3** | Surface extended | *"Module 3 of 4 done: the history tape is live — every calculation you finish now shows in a running record beside the keypad. 3 of 4 modules complete."* |
| **M4** | Visual payoff (the point) | *"Module 4 of 4 done — the calculator is now skinned with the design system and a light/dark toggle. This is the 'ga bosenin' payoff: it's no longer template-default, it reads as deliberate. All four modules complete; STRUCTURE's build plan is fully realized."* |

**Cadence note:** M1 is the highest stall-risk step (no visible output) → narrate per-fragment there (CP-10 escalation curve). M2-M4 each *add to a visible app*, so per-module narration suffices unless a CP-3 trigger fires.

---

## Build order is complete — no TBDs

Sequence **M1 → M2 → M3 → M4** is the reverse-topological walk of the clean DAG in `05-dependency-map.md` and matches `03-modules.md:34`. Dark stretch = M1 only (one module deep); first visible win = end of M2; visual payoff = M4. Every step carries its rationale, its visibility status, and its small-wins framing. No cycles, no ambiguity, nothing deferred.
