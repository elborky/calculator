---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/03-modules.md
  - storm/structure/04-scope.md
storm-phase: structure
storm-canonical: true
---

# Dependency Map — Calculator

> Status: **proposed** (STRUCTURE phase, AI-led draft). Owner confirms comprehension, not wording.
>
> This file makes the **inter-module build order** canonical. It reads the four modules from `03-modules.md` and states, honestly, which module needs which — so BUILD proceeds foundation-first with no rework churn (`00-domain-lens` dark-stretch; CP-10), and so the dark stretch is entered *sighted, not blind*.

---

## Dependency table (module → depends-on)

| # | Module | Depends on | Nature of the dependency |
|---|---|---|---|
| **M1** | Calculation engine | — (nothing) | Pure headless logic. No DOM, no styling, no sibling module. It is the foundation root. |
| **M2** | Calculator UI / keypad | **M1** | The UI calls the engine. Every button/keypress dispatches into M1; the display renders M1's result and error states. M2 cannot function without M1's API. |
| **M3** | History tape | **M1**, **M2** | Records a completed calculation (expression + result) when equals resolves. The *result* comes from M1; the *moment of recording* and the surface it renders into are owned by M2 (the equals event fires in the UI). M3 sits downstream of both. |
| **M4** | Theming | **M2**, **M3** (presentational, cross-cutting) | Applies design-system tokens and the light/dark toggle to the surfaces M2 and M3 render. It depends on those surfaces *existing to be skinned* — but it carries no logic dependency: M2 and M3 are fully functional before M4 styles them. M4 is the cross-cutting skin, not a logic link in the chain. |

**Notes on the M4 dependency (honest, per CP-15 no-manufactured-dependency):** M4's link to M2/M3 is **presentational coupling, not causal logic**. M2 and M3 work correctly with default/unstyled markup; M4 makes them "non-boring" (`00-domain-lens.md:57`, the one first-class axis). It is listed last in build order because it has the most surfaces to skin once they exist — not because anything blocks on it. It consumes the design tokens authored in `08-design-system.md` (a taste decision, CP-7) — that is M4's true upstream input, a *document* dependency, not a *module* one.

---

## Build-order DAG (dependency direction)

Arrow `A ──▶ B` reads **"A depends on B"** (B must exist first). Build order is the reverse-topological walk: build the most-depended-on root first.

```
                 ┌──────────────────────────┐
                 │  M1  Calculation engine   │   ← foundation root (no UI, headless)
                 │      (no dependencies)    │
                 └────────────┬──────────────┘
                              ▲
                  depends on  │
                 ┌────────────┴──────────────┐
                 │  M2  Calculator UI/keypad  │   ← first demo-able surface
                 │      (calls M1)            │
                 └──────┬──────────────┬──────┘
                        ▲              ▲
            depends on  │              │  depends on (M1 result + M2 surface)
        ┌───────────────┴──┐   ┌───────┴──────────────┐
        │ M4 Theming        │   │ M3  History tape      │
        │ (skins M2 + M3)   │   │ (records M1 via M2)   │
        └─────────┬─────────┘   └──────────────────────┘
                  │ depends on
                  ▼
          (M2 + M3 surfaces — presentational, cross-cutting)
                  +
          08-design-system.md tokens (document input, not a module)
```

**Build sequence (foundation-first, reverse-topological):**

```
M1  ──▶  M2  ──▶  M3  ──▶  M4
engine   keypad   history  theming
```

This is the exact order stated in `03-modules.md` ("M1 → M2 → M3 → M4"). No cycles — the graph is a clean DAG. M3 and M4 both sit below M2; they could in principle be reordered (M3 before M4 is chosen so the full functional surface exists before the visual skin lands, maximising what M4 has to make non-boring in one pass).

---

## Foundation vs. surface (dark-stretch tie-in)

Per the foundation-first discipline (`00-domain-lens` / CP-10 dark-stretch expectation-setting), modules split into **foundation** (no visible screen yet) and **surface** (demo-able):

| Module | Foundation or surface? | Demo-able after build? |
|---|---|---|
| **M1** Calculation engine | **Foundation** (headless) | **No** — pure logic, no screen. This is the dark stretch. |
| **M2** Calculator UI / keypad | **Surface** | **Yes** — first demo-able screen; a working calculator appears here. |
| **M3** History tape | **Surface** | **Yes** — adds the visible tape alongside the keypad. |
| **M4** Theming | **Surface** (cross-cutting skin) | **Yes** — the "non-boring" visual payoff lands here. |

**Dark stretch = M1 only, one module deep.** There is exactly *one* foundation module that produces no screen. The first demo-able surface lands at **M2**. Per CP-4 dark-stretch narration: this is *on-plan, not stuck* — when BUILD starts M1, announce that "the calculation engine is headless; there won't be a screen until M2 — that's normal," and narrate the engine pieces as they land (the four operations, the operator state machine, error handling) so structural progress stays legible while no UI exists.

This is the motivationally-safest order too (`00-domain-lens` / CP-10): building the engine first means M2/M3/M4 never have to be reworked when the logic firms up — early dopamine bought on a not-yet-final foundation would be rework debt, and rework churn is itself a demotivation hazard for this profile.

---

## Shared concerns (consumed by multiple modules)

| Shared concern | Produced by | Consumed by | Nature |
|---|---|---|---|
| **Engine API / result + error contract** | M1 | M2 (renders it), M3 (records it) | The single computation surface. Both UI surfaces read M1's output; neither re-implements arithmetic. |
| **Design-system tokens** (color, type, spacing, motion) | `08-design-system.md` (taste decision, CP-7) → applied by **M4** | M2 surfaces, M3 surfaces | Cross-cutting visual layer. The tokens are a *document* input; M4 is the module that applies them across both rendered surfaces. This is the one genuinely cross-cutting dependency. |
| **The equals event** | M2 (UI fires it) | M1 (resolves it), M3 (records the resolved result) | The seam where all three of M1/M2/M3 meet: UI fires → engine resolves → tape records. |

> Anti-inflation guard (CP-13): no shared "state store," "event bus," or "service layer" is introduced here. The shared concerns above are a function contract (M1's API), a token sheet (M4), and one event (equals) — not infrastructure. Manufacturing a shared-services tier for a four-module client-side calculator would be over-engineering (`00-domain-lens.md:70`).

---

## Dependency map is complete — no TBDs

Clean DAG, no cycles, four modules. Build order **M1 → M2 → M3 → M4** is consistent with `03-modules.md`. Dark stretch is one module (M1) deep; first surface at M2. The only cross-cutting dependency is design-token application (M4 over M2+M3), and it is presentational, not causal.
