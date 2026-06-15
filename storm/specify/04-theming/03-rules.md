---
storm-phase: specify
storm-module: 04-theming
storm-canonical: true
storm-depends-on:
  - storm/specify/04-theming/_briefing.md
  - storm/structure/08-design-system.md
---

# M4 Theming — Rules (canonical)

> This file OWNS the theme **precedence** + **persistence** rules. Other M4 concerns
> (`02-flows`, `05-edge-cases`, `06-tech-choices`, acceptance) cite these rules; they do not
> redefine them. Rules state *what must be true*, not *how* — mechanism lives in
> `06-tech-choices`.

## Vocabulary

- **Theme** — one of exactly two values: `"light"` or `"dark"`. No third value exists in M4
  (the "System" toggle option is DEFERRED per `_briefing.md` scope).
- **Stored value** — the single localStorage theme-preference key (the one documented
  persistence exception, `00-domain-lens.md §4a`).
- **OS preference** — the value reported by `prefers-color-scheme` (`light` or `dark`).
- **Resolved theme** — the single theme the app applies on a given load, computed by R-M4-01.
- **Valid stored value** — a stored value that is **exactly** the string `"light"` OR exactly
  the string `"dark"`. Anything else (absent, empty, `null`, mixed case, whitespace, any other
  string, or unreadable storage) is **NOT valid** and is treated as "no stored value" for
  precedence purposes (graceful fallback detailed in `05-edge-cases`).

---

## Rules

### R-M4-01 — Resolution precedence (first load)

On every first load, the resolved theme is computed by this strict, ordered precedence; the
first matching source wins:

1. **Valid stored value** (per Vocabulary) — if present, it wins outright.
2. Else **OS preference** — if `prefers-color-scheme` reports `light`, resolve `light`; if it
   reports `dark`, resolve `dark`.
3. Else **default `dark`** (per R-M4-03) — when nothing above resolves (no valid stored value
   AND `prefers-color-scheme` has no preference / is unavailable).

Stored value ranks **above** OS preference: an explicit user choice always overrides what the
OS reports.

### R-M4-02 — Persistence (write-on-toggle, theme-only)

On **every** user toggle, the new theme value (`"light"` or `"dark"`) is written to the single
localStorage key **immediately** as part of that toggle action — not batched, not deferred.
This write is what makes a choice survive reloads and rank above OS preference on the next load
(R-M4-01 step 1).

**Only the theme preference persists. Nothing else.** M4 introduces no other storage. In
particular the M3 history tape stays **ephemeral / in-memory** and MUST NOT be persisted
(invariant, `_briefing.md` "Invariants to NOT break"). The single theme key is the sole
permitted persistence in the whole product, per the documented tiny-value exception
(`00-domain-lens.md §4a`).

### R-M4-03 — Default theme = dark

When neither a valid stored value nor an OS preference resolves a theme (R-M4-01 step 3), the
resolved theme is **`dark`** — the shipped v3 Wildcard aurora-glass baseline (D-003). Dark is
the product's default and is **frozen / unchanged** by M4; M4 adds light + the swap, it does not
restyle dark.

### R-M4-04 — No-FOUC (resolved theme applied before first paint)

The resolved theme (R-M4-01) MUST be applied to `document.documentElement` **before the first
paint** — i.e. before the themed CSS renders any pixels. A flash of the wrong theme on load (e.g.
a dark-default flash before a stored/OS `light` is applied) is a **defect**, not acceptable
behaviour. The mechanism that guarantees pre-paint application (an inline head script that runs
ahead of render) belongs to `06-tech-choices`; this rule states only the requirement, and
acceptance MUST verify there is no flash.

### R-M4-05 — Token-swap rule (dark is default, light is the override)

The theme is selected by a single attribute on the document root, and the token layering is
fixed:

- **Dark v3 stays the `:root` default** — unchanged and frozen (the colour tokens that ship
  today remain the base `:root` block).
- **Light is a `[data-theme="light"]` override** — it overrides only the themed `:root` colour
  tokens; it does not restyle dark and does not touch structural (non-theming) literals.
- **The toggle sets `document.documentElement.dataset.theme`** to select between them.

This rule fixes the *contract* (dark = default base, light = attribute override, toggle drives
the root attribute). The exact CSS/selector mechanism — and verification that it adds **no new
dependency** (vanilla `matchMedia` + `localStorage` + CSS attribute selector expected) — is a
`06-tech-choices` decision.

### R-M4-06 — Light palette derives from the SHIPPED v3 dark baseline

The light palette is the **bright sibling of the shipped v3 aurora dark baseline** ("mirror
vibrant dark", `_briefing.md` TD-1): vibrant-but-light gradient, white translucent glass, with
the indigo/coral accents still popping. It is **NOT** derived from the stale `08-design-system`
§3.1 pastel palette (that table predates the v3 Wildcard pick and is superseded for M4 light).

The light palette MUST clear **WCAG AA** contrast against **its own** glass-over-gradient
surfaces (not against an idealized flat background):

- **Display / primary numerals:** contrast ratio **≥ 4.5:1**.
- **Large labels / large text:** contrast ratio **≥ 3:1**.

This is the same craft-floor discipline already enforced on dark (`08-design-system.md §8`,
craft floor C3). The concrete light token values + their measured ratios are produced by
`04-ui` / `06-tech-choices`; this rule states the binding requirement they must satisfy.

### R-M4-07 — OS-change handling (stored choice wins; otherwise follow live)

When the OS `prefers-color-scheme` changes **while the app is open**:

- **If a valid stored value exists** (the user has made an explicit choice), the OS change is
  **ignored** — the user's explicit preference is sticky and is not overridden by the OS.
- **If there is no valid stored value** (the user has never toggled), the app **MAY follow** the
  live OS change and re-resolve the theme to match. This keeps the never-chosen state in sync
  with the OS, consistent with R-M4-01's OS-before-default precedence.

The interactive walkthrough of this behaviour lives in `02-flows` (flow **F4**); this rule owns
the binding precedence it must follow.

### R-M4-08 — Reduced-motion (ALL theme-introduced motion suppressed)

Under `prefers-reduced-motion: reduce`, **all motion introduced by the theme layer is
suppressed**. This covers two distinct animation vectors:

1. **Theme cross-fade (300ms) — dropped to instant.** The theme switch is a **300ms token
   cross-fade** (`08-design-system.md §7`). Under reduced-motion, this cross-fade is **dropped
   to instant** — the theme swaps with no transition animation.

2. **Light-theme v3 aurora pulse — disabled (static aurora).** The v3 "Iridescent Dawn" light
   theme ships a continuous pulsing aurora background animation
   (`animation: auroraShift 12s ... infinite alternate`). Under reduced-motion, this pulse
   animation MUST be disabled — the aurora renders as a **static gradient** (no movement). The
   aurora is still visible; only the animation is removed. Mechanism: `animation: none` applied
   to the aurora element(s) inside a `@media (prefers-reduced-motion: reduce)` block.

All other theme behaviour (precedence, persistence, no-FOUC, contrast) is unchanged under
reduced-motion; only the motion is suppressed.
