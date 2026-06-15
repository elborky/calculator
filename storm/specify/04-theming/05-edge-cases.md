---
storm-phase: specify
storm-module: 04-theming
storm-canonical: true
storm-depends-on:
  - storm/specify/04-theming/_briefing.md
---

# M4 Theming — Edge Cases

> Enumerates the failure / boundary cases for the theme toggle + persistence + resolution
> seam, each with its defined handling (`EC-M4-NN`). Cite-don't-restate: the canonical
> *rules* (resolution precedence, "valid" value definition, no-FOUC) live in `03-rules`;
> *flows* in `02-flows`; *motion/contrast discipline* in `08-design-system.md §7/§8`. This
> file owns only the **edge handling**.

**Governing invariant:** theme resolution NEVER throws to the user and NEVER blocks the
calculator. A theme failure degrades to a working calculator at the OS-default (or default
dark) theme — the app is a zero-stakes utility; a broken toggle must never break arithmetic
(`00-domain-lens.md`; M1/M2 untouched per `_briefing.md` Invariants).

---

## EC-M4-01 — `localStorage` unavailable / blocked

**Cases covered:** private/incognito mode with storage disabled, browser setting disables
storage, storage quota exceeded on write, `SecurityError` thrown on mere *access* to
`window.localStorage` (e.g. third-party-context / strict cookie blocking), `localStorage`
undefined.

**Handling:** every `localStorage` read AND write is wrapped in `try/catch`.
- **Read failure** → treat as "no stored value" → fall through to the resolution precedence
  (`03-rules`): `prefers-color-scheme` → else default dark.
- **Write failure** → swallow silently; the toggle still flips the live theme
  (`data-theme` on `<html>`), it just doesn't persist. Session is **in-memory only** —
  the choice holds for the page lifetime, lost on reload.
- Never surface an error, never re-throw. A blocked-storage browser gets a fully working
  toggle that simply forgets across reloads.

## EC-M4-02 — Corrupt / unexpected stored value

**Cases covered:** stored value is not exactly `"light"` or `"dark"` — tampered, empty
string, old/renamed format, JSON blob from a future schema, whitespace, wrong case.

**Handling:** the stored value is **validated against the `03-rules` "valid" definition**
(exact match `"light" | "dark"`). Anything else is treated as **absent** → fall through to
OS-default resolution (`prefers-color-scheme` → else default dark). Invalid values are NOT
"repaired" or partially parsed; they are ignored. (Optionally the next valid toggle
overwrites the bad key via last-write-wins, EC-M4-06 — but resolution does not depend on
that.) See `03-rules` for the canonical valid-value rule.

## EC-M4-03 — No `prefers-color-scheme` support / `matchMedia` undefined

**Cases covered:** very old browser where `window.matchMedia` is undefined, or
`matchMedia('(prefers-color-scheme: dark)')` returns `matches === false` for *both*
light and dark queries (no OS signal).

**Handling:** guard `matchMedia` existence before calling. If absent or it yields no usable
preference, resolution falls to the **default dark** baseline — the shipped v3 Wildcard theme
(`_briefing.md` CF-1, dark stays the frozen default). No throw. This is the terminal fallback
of the `03-rules` precedence chain.

## EC-M4-04 — FOUC (flash of wrong theme on load)

**Risk:** if theme resolution runs *after* CSS paints, the user sees the default theme flash
before the stored/OS theme applies — a visible flicker on every load.

**Handling:** an **inline `<head>` script** runs the resolution chain (EC-M4-01..03 +
`03-rules` precedence) and sets `document.documentElement.dataset.theme` **before first
paint**, so the correct theme is present on the very first rendered frame. Cite `03-rules`
no-FOUC requirement (canonical owner) + `_briefing.md` no-FOUC seam.

**Build / bundle implication (load-bearing):** the resolution script MUST be **inlined into
`index.html`'s `<head>`** — it CANNOT be a deferred/async/external bundle chunk, because any
of those execute after paint and reintroduce the flash. This is a hard constraint on the
build step: the bundler must keep this snippet inline (no extraction into the JS bundle), and
it must run synchronously before the stylesheet-driven render. `06-tech-choices` records the
exact inlining mechanism; acceptance verifies no flash.

## EC-M4-05 — Reduced motion (`prefers-reduced-motion: reduce`)

**Risk:** the 300ms theme cross-fade (`08-design-system.md §7`) is unwanted motion for users
who opt out.

**Handling:** under `prefers-reduced-motion: reduce`, the theme switch is **instant** — the
300ms `transition` on `background`/`color`/`border` is dropped (e.g. `transition: none`), the
token set swaps with no cross-fade. The toggle's *outcome* is identical; only the animated
beat is removed. This honours the §7 motion spec and §8 reduced-motion line (accessibility,
not optional) — design-system is the canonical owner; this file only names it as an edge to
verify.

## EC-M4-06 — Rapid toggle spam

**Risk:** flipping the toggle very fast could corrupt state or queue stale `localStorage`
writes that land out of order.

**Handling:** **last-write-wins.** The live theme is driven directly by
`document.documentElement.dataset.theme` (synchronous DOM state — always reflects the latest
click). Each toggle writes the *current* resolved value to `localStorage`; a later write
overwrites an earlier one, so the persisted value always matches the final visible state.
No queue, no debounce needed for correctness. Interrupting an in-flight CSS cross-fade
mid-transition is **fine** — the browser simply re-targets the transition to the new token
set; no broken intermediate state. (If a write fails per EC-M4-01, the live state is still
correct.)

## EC-M4-07 — OS theme change mid-session (no explicit choice stored)

**Cases covered:** user has NOT toggled this session (no valid `localStorage` value), and the
OS flips light↔dark while the page is open (e.g. macOS auto-night, manual OS switch).

**Handling:** while no explicit user choice is stored, the app **follows the OS** — a
`matchMedia('(prefers-color-scheme: ...)')` change-listener re-resolves and re-applies the
theme live (cross-fade per EC-M4-05 motion rules). Once the user makes an **explicit** toggle
choice (a valid value is stored), the explicit choice **wins** and OS changes no longer
override it. Canonical behaviour owned by `02-flows F4` / `03-rules`; this file only enumerates
it as the mid-session edge and its handling. (Implementations that resolve only at load are an
acceptable narrower variant if `03-rules` so specifies; the listener is the richer reading and
is preferred where `03-rules` mandates live OS-follow.)

## EC-M4-08 — AA contrast failure spot in the light theme

**Risk:** the light theme is "mirror vibrant dark" (`_briefing.md` TD-1) — a vibrant
blue/violet/pink gradient under white translucent glass. A bright gradient region can drive a
spot where `--text-primary` (or a large label) fails WCAG AA against the *actual*
glass-over-gradient backdrop (display ≥4.5:1, large labels ≥3:1).

**Handling — fixed remediation order (cite `08-design-system.md §8`):** at the failing spot,
**raise `--glass-fill` alpha first** (make the glass less transparent so it occludes more of
the bright gradient and lifts contrast) **before** darkening `--text-primary`. Readability
wins over maximum transparency; text-darkening is the second lever, not the first. §8 is the
canonical owner of this discipline (line 144); BUILD verifies with a contrast checker against
screenshots of *both* themes at the worst gradient point. Craft floor C3 — light must clear
the same AA bar as dark.

---

## Coverage note

| Edge | Canonical rule owner (cite, not restate) |
|---|---|
| EC-M4-01/02 | `03-rules` (valid-value + precedence) |
| EC-M4-03 | `03-rules` (terminal default-dark fallback), `_briefing.md` CF-1 |
| EC-M4-04 | `03-rules` (no-FOUC), `_briefing.md` seam |
| EC-M4-05 | `08-design-system.md §7` (motion / reduced-motion) |
| EC-M4-06 | seam (`_briefing.md`) — AI-autonomous, CP-7 |
| EC-M4-07 | `02-flows F4` / `03-rules` (OS-follow vs explicit-choice) |
| EC-M4-08 | `08-design-system.md §8` (contrast discipline) |
