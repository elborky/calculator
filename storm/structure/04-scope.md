---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/01-vision.md
  - storm/structure/03-modules.md
  - storm/capture/03-ideation-coverage.md
storm-phase: structure
storm-canonical: true
---

# Scope — Calculator

> Status: **proposed** (STRUCTURE phase, AI-led draft). Owner confirms comprehension, not wording.
>
> This file makes the owner's pre-approved scope **canonical**: the convergence forcing-function for the open feature set flagged in CAPTURE (`03-ideation-coverage.md:46-53,62`). Every item below is the bounded MVP slice. Anything not listed In-scope is, by definition, not in this build.

---

## In-scope (MVP)

The committed build, mapped to the four modules from `03-modules.md`. Each line is a capability the MVP **will** ship.

| In-scope capability | Lives in | Source |
|---|---|---|
| Basic 4-function arithmetic: add, subtract, multiply, divide | **M1** Calculation engine | pre-approved scope; `03-modules.md:43` |
| Decimal point entry (one per number) | **M1** | pre-approved scope; `03-modules.md:44` |
| Equals — resolve pending operation to a result | **M1** | pre-approved scope; `03-modules.md:45` |
| Clear / AC — reset current entry vs. reset all | **M1** | pre-approved scope; `03-modules.md:46` |
| Graceful error states (divide-by-zero, overflow) surfaced to the UI | **M1** → rendered by **M2** | `01-vision.md:39`; `03-ideation-coverage.md:51` |
| Keypad surface: digit + operator + decimal + equals + clear/AC buttons | **M2** Calculator UI / keypad | `03-modules.md:64` |
| Result display rendering current entry, result, and error text | **M2** | `03-modules.md:65` |
| Click input binding (mouse/touch → engine) | **M2** | `03-modules.md:66` |
| Keyboard input (0–9, + − * /, Enter/=, Esc/clear, .) | **M2** | pre-approved scope; `01-vision.md:40`; `03-modules.md:67` |
| Baseline usability: keyboard operability, focus order, contrast, semantic buttons | **M2** | craft floor C3; `00-domain-lens.md:59`; `01-vision.md:41` |
| Responsive layout (phone + desktop) | **M2** | `03-ideation-coverage.md:52` |
| History tape — session-only, in-memory record of completed calculations | **M3** History tape | pre-approved scope; `03-modules.md:84` |
| Non-boring, intentional visual design via design-system tokens | **M4** Theming | pre-approved scope (the one first-class axis); `01-vision.md:38` |
| Light / dark theme toggle (2-state, user-flippable; first-load default follows OS `prefers-color-scheme`) | **M4** | pre-approved scope; `01-vision.md:40`; `03-modules.md:101` |
| Theme preference persisted in a single `localStorage` key (the one documented persistence exception) | **M4** | M4 re-entry slice; `03-modules.md` M4; `00-domain-lens.md` §4a |

**Coverage check against pre-approved IN list** — all eight items accounted for: 4-function arithmetic ✓, clear/AC ✓, decimal ✓, equals ✓, history tape (session-only) ✓, theme toggle ✓, keyboard input ✓, non-boring polished visual design ✓.

---

## Out-of-scope (now)

Explicitly **not** in this build. Each carries a one-line reason — the anti-creep record (CP-8). If any of these is requested later, it is a **new slice** (CAPTURE re-entry, revolving door), not a quiet absorption into the MVP.

| Out-of-scope | Why it's out (one line) |
|---|---|
| Memory keys (M+, M−, MR, MC) | Pre-approved OUT; adds state + four buttons that don't serve "simple + non-boring" (`01-vision.md:50`). |
| Scientific / extended functions (trig, powers, roots, parentheses) | Pre-approved OUT; turns a basic calculator into a different product (`01-vision.md:51`). |
| Percent (%) and ± sign-toggle | Pre-approved OUT; convenience keys outside the basic-4 brief (`01-vision.md:52`). |
| **History** persistence (cross-session / reload survival) | OUT; the **history tape stays in-memory and dies with the tab** — no localStorage, no carry-over for history (`00-domain-lens.md:67`; `03-modules.md:89`). |
| Cross-**device** persistence / sync (any data) | OUT; localStorage is same-device only, and there is no backend to sync through (`01-vision.md:53`). The one persisted item — the theme preference (In-scope, M4) — does **not** cross devices. |
| Accounts / auth / login | Pre-approved OUT; single anonymous user, nothing to gate or own (`00-domain-lens.md:31,66`). |
| Backend / server / API | Pre-approved OUT; client-side-only utility, no server tier (`01-vision.md:53`). |
| Multi-user / sharing / collaboration | Pre-approved OUT; single general web user, no second actor exists (`00-domain-lens.md:31`). |
| History export / share / copy-to-clipboard | Feature bloat beyond a read-only session tape (`03-modules.md:91`). |
| Editing or re-running past history entries | History is a read-only record, not a re-computation surface (`03-modules.md:90`). |
| Per-user theming / custom-theme builder | One light/dark toggle is the whole theming surface; a builder is over-engineering (`03-modules.md:108`). |

---

## Maybe-later (parking-lot candidates)

Noted so they are not *lost*, but **NOT committed** — recorded here only to keep the In/Out boundary honest. None of these is a promise. Each would enter via `/storm-park` and a CAPTURE re-entry if the owner ever wants it; none is implied by this MVP.

- **Memory keys** (M+, M−, MR, MC) — the most natural "next button set" if the calculator ever grows.
- **Scientific / extended mode** — a separate, toggle-able panel rather than bloating the basic keypad.
- **History persistence** — localStorage for the history tape, surviving a reload. *(Still a candidate — last-used **theme** persistence has graduated to In-scope (M4); history persistence has **not**.)*
- **Explicit "System" theme option** — a 3rd toggle state beside light/dark that defers to the OS at runtime. **Deferred** from the M4 slice (the first-load default already follows the OS); would re-enter via a fresh CAPTURE slice.
- **Percent / ± convenience keys** — small additions that some users expect on a basic calculator.
- **Copy result / copy history line** — clipboard convenience if real usage shows demand.

> These are candidates, not roadmap. Listing them is **not** scheduling them. The discriminator stays "simple + non-boring" — a maybe-later only graduates to In-scope through an explicit owner decision in a fresh CAPTURE slice.

---

## Scope guardrail statement

**The simplicity is intentional, and guarding it is part of the work — not a limitation to apologize for.**

This product is most exposed to exactly one failure mode: feature creep, because it is trivially easy to add "just one more button." The whole point (design-craft + a clean STORM run, `00-domain-lens.md:17,19`) is undermined the moment the function set inflates. Therefore:

- **New features get parked, not absorbed.** Any capability not on the In-scope list above is auto-parked to `storm/meta/parking-lot.md` (CP-8) and routed through a CAPTURE re-entry — never silently folded into the MVP.
- **The product strategist hat here is the brake, not the engine** (`00-domain-lens.md:60`; `01-vision.md:54`).
- **Re-scoping is a first-class, visible move** (revolving-door CAPTURE re-entry), never a quiet scope grab. If REVIEW surfaces "can it also…", that is a Domain-Lens drift signal to re-validate, not a green light to extend (`00-domain-lens.md:79`).

> Anti-inflation guard (CP-13 over-engineering / YAGNI dims): the gravity is design-craft + framework-exercise — nothing heavier. Resist reflexively summoning security/data/compliance scope or extra capability (`00-domain-lens.md:70`; `01-vision.md:56`).

---

## Scope is complete — no TBDs. In/Out/Maybe-later boundary fully resolved at structure altitude; the open feature set from CAPTURE (`03-ideation-coverage.md:46-53`) is converged.
