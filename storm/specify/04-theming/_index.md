---
storm-phase: specify
storm-module: 04-theming
storm-canonical: true
storm-depends-on:
  - storm/specify/04-theming/01-data-model.md
  - storm/specify/04-theming/02-flows.md
  - storm/specify/04-theming/03-rules.md
  - storm/specify/04-theming/04-ui.md
  - storm/specify/04-theming/04-ui/_picked.md
  - storm/specify/04-theming/05-edge-cases.md
  - storm/specify/04-theming/06-tech-choices.md
  - storm/specify/04-theming/_decisions.md
---

# M4 Theming — SPECIFY Index

## Summary

M4 adds a light/dark theme toggle to the shipped calculator — a `<button>` icon control
(sun ☀ / moon ☾) in the reserved `.toggle-slot` corner, wired to flip between the dark v3
Wildcard baseline (frozen, unchanged as the `:root` default) and a new light-mode override
(`[data-theme="light"]` block) whose palette is the "Iridescent Dawn" v3 pick: a vibrant
warm-aurora gradient (violet / rose-pink / peach / periwinkle over lavender), white
translucent glass with iridescent holographic edge ring, dark indigo text, and indigo/coral
accents — the bright sibling of the shipped v3 dark aurora. First-load theme resolves via
ordered precedence: valid `localStorage` `calc-theme` key → OS `prefers-color-scheme` →
default dark. The choice persists via a single `localStorage` key (the one documented
persistence exception for the product). A synchronous non-module inline `<head>` script
applies the resolved `data-theme` attribute before first paint (no-FOUC). Toggle triggers a
300ms CSS token cross-fade (dropped to instant under `prefers-reduced-motion: reduce`).
Live OS changes are followed while no explicit user choice is stored; after a toggle, the
stored value wins. Zero new runtime dependencies — vanilla `matchMedia` + `localStorage` +
CSS attribute selector + one tiny inline script.

---

## §0 Shared-Thread Inheritance

M4 **inherits** — and does NOT restate — the following from upstream STORM modules:

- **Glass recipe** (`08-design-system.md §5`): backdrop-filter blur, `::before`
  pseudo-element shimmer/chrome ring, layered box-shadow stack. The glass recipe is
  structurally frozen; M4 only tunes `--glass-fill` and `--glass-border` alpha values
  (higher alpha in light for legibility). The Iridescent Dawn `::before` chromatic gradient
  ring (periwinkle → rose → lilac) is light-only and additive — it does not alter the dark
  glass recipe.
- **Motion tokens** (`08-design-system.md §7` + `tokens.css §11 --motion-*`): `--motion-press`,
  `--motion-hover-bg`, `--motion-hover-shadow`, etc. are not theme-semantic and stay in `:root`
  unchanged. The 300ms cross-fade and the reduced-motion `transition: none` override are M4's
  only motion additions.
- **A11y tokens and discipline** (`08-design-system.md §8`): 44×44px tap-target floor, 2px
  focus-ring floor (M4 delivers `3px solid var(--accent)` / 3px offset, meeting the floor),
  WCAG AA contrast discipline (`≥4.5:1` display / `≥3:1` large labels), colour-independence
  requirement.
- **Token swap seam (UR-029)**: established in M2 (`tokens.css`), all themed colour values are
  already `var(--token)` references from a single `:root` block. M4 owns ONLY the light-palette
  `[data-theme="light"]` override values, the toggle control markup (filling `.toggle-slot`),
  and the resolution/persistence logic. It does NOT restate the dark token values and does NOT
  edit component CSS (layout.css / keypad.css / display.css).

**M1 is untouched. M2/M3 markup is untouched except filling `.toggle-slot`.**

---

## Concern files

| File | One-line |
|---|---|
| `01-data-model.md` | Single `localStorage` key `calc-theme` (`"light"\|"dark"`); DOM `data-theme` attribute is live source of truth |
| `02-flows.md` | F1 first-load/no-choice, F2 returning-user, F3 toggle-and-persist, F4 live-OS-follow |
| `03-rules.md` | Resolution precedence (R-M4-01..08): stored → OS → dark-default; no-FOUC; token-swap contract |
| `04-ui.md` | Toggle control anatomy (button, sun/moon icon, aria-label/aria-pressed, size, press feedback, 300ms cross-fade); light palette candidate tokens |
| `04-ui/_picked.md` | Owner-picked visual baseline: v3 "Iridescent Dawn" (warm aurora + iridescent glass-edge ring + AA dark text) |
| `05-edge-cases.md` | EC-M4-01..08: blocked storage, corrupt value, no-matchMedia, FOUC, reduced-motion, rapid spam, OS-change mid-session, AA contrast fallback |
| `06-tech-choices.md` | Zero-new-dep verdict; CSS attribute override, matchMedia, localStorage try/catch, synchronous non-module head script (Vite-compat verified) |
| `_decisions.md` | D-M4-TC-01..05: swap mechanism, OS detection, persistence, no-FOUC, zero-dep — all CP-7 autonomous, all verified |

---

## Task List — BUILD breakdown

> Granularity rule: each task ≤ ~1.5 min, ≤ 1 file or 1 logical unit, no "and"-joins,
> no "implement the whole X". Foundation-first order.

### Foundation: token layer

**T-401** — `tokens.css`: restructure the file header comment to annotate the `:root` block
as the dark-default baseline and reserve a clearly-labelled section for the M4 light
override block below it. No token value changes — comment/structure edit only.

**T-402** — `tokens.css` `[data-theme="light"]`: add the opening `[data-theme="light"] {`
selector block with the background tokens: `--bg-base`, `--bg-aurora` (warm dawn radial
blobs + linear-gradient), `--bg-blob`. Values from `04-ui.md §3.1` / `_picked.md`.

**T-403** — `tokens.css` light block: add accent tokens: `--accent`, `--accent-glow`,
`--accent-dark`, `--accent-hover-from`, `--accent-hover-to`. (Indigo family, darkened for
AA on light background — `04-ui.md §3.1`.)

**T-404** — `tokens.css` light block: add operator accent tokens: `--operator-accent`,
`--operator-accent-dark`, `--operator-accent-hover-from`, `--operator-accent-hover-to`,
`--operator-glow`. (Coral-rose family, darkened for AA — `04-ui.md §3.1`.)

**T-405** — `tokens.css` light block: add text tokens: `--text-on-scrim`,
`--text-on-scrim-soft`, `--text-primary`, `--text-secondary`, `--text-on-accent`.
(Dark-indigo `#1a1040`-family for AA on light glass — `04-ui.md §3.1`.)

**T-406** — `tokens.css` light block: add glass tokens: `--glass-fill`, `--glass-fill-hover`,
`--glass-fill-display`, `--glass-border`, `--glass-border-bright`. (White translucent, higher
alpha than dark for legibility on light gradient — `04-ui.md §3.1`.)

**T-407** — `tokens.css` light block: add scrim + RGB triplet tokens: `--display-scrim`,
`--scrim-rgb`, `--calc-fallback-rgb`, `--op-shadow-rgb`, `--eq-shadow-rgb`, `--accent-rgb`,
`--operator-accent-rgb`. Close the `[data-theme="light"]` block. (`04-ui.md §3.1`.)

**T-408** — `tokens.css` light block: add `--error` value for light theme (darker red
`#c0122a` for AA on light glass — `04-ui.md §3.1`).

### Foundation: Iridescent Dawn glass-edge (light-only)

**T-409** — `tokens.css` OR a new `light-glass.css` import: add the `[data-theme="light"]`
`::before` chromatic gradient ring rule — the 2px periwinkle→rose→lilac→periwinkle border
ring with 1px blur shimmer, scoped entirely to the light theme. Does NOT alter the dark
`::before` rule. (`_picked.md` BUILD note.)

### Foundation: no-FOUC head script

**T-410** — `index.html`: insert the synchronous non-module inline `<script>` in `<head>`
(before the `<link>` tags that drive CSS-heavy render). The script resolves theme via
stored-→OS→dark precedence (try/catch-wrapped `localStorage.getItem` + `matchMedia` guard)
and sets `document.documentElement.dataset.theme` before first paint. (`06-tech-choices §4`,
`03-rules` R-M4-04, `05-edge-cases` EC-M4-04.)

### Foundation: resolution + persistence module

**T-411** — create `src/ui/theme.ts`: implement `readStoredTheme()` — try/catch-wrapped
`localStorage.getItem('calc-theme')`, returns `"light" | "dark" | null`, validates exact
match only. (`01-data-model §4`, `06-tech-choices §3`, `05-edge-cases` EC-M4-01/02.)

**T-412** — `src/ui/theme.ts`: implement `writeStoredTheme(t: Theme)` — try/catch-wrapped
`localStorage.setItem`, swallows throws silently (session-only fallback). (`06-tech-choices §3`,
`05-edge-cases` EC-M4-01.)

**T-413** — `src/ui/theme.ts`: implement `resolveTheme()` — reads stored value; if invalid/null
reads `matchMedia('(prefers-color-scheme: dark)')` with `matchMedia` existence guard; else
falls back to `"dark"`. Returns `Theme`. (`03-rules` R-M4-01/03, `05-edge-cases` EC-M4-03.)

**T-414** — `src/ui/theme.ts`: implement `applyTheme(t: Theme)` — sets
`document.documentElement.dataset.theme`. Single write path, synchronous. (`03-rules` R-M4-05.)

**T-415** — `src/ui/theme.ts`: implement `toggleTheme()` — reads current `dataset.theme`, flips
it, calls `applyTheme` + `writeStoredTheme`. The full toggle action in one unit.
(`02-flows` F3, `03-rules` R-M4-02/05.)

**T-416** — `src/ui/theme.ts`: implement `attachOsChangeListener()` — subscribes to
`matchMedia.addEventListener('change', …)` using the modern (non-deprecated) API; re-applies
only when no valid stored value exists (explicit choice wins). (`03-rules` R-M4-07,
`02-flows` F4, `06-tech-choices §2`.)

### Toggle control: markup

**T-417** — `index.html`: fill `.toggle-slot` — replace the `aria-hidden="true"` div with the
`<button id="theme-toggle" class="theme-toggle" aria-label="Switch to light theme" aria-pressed="false">` markup containing the moon icon (inline SVG or Unicode, `aria-hidden="true"` on the icon element). Remove `aria-hidden` from `.toggle-slot`. (`04-ui.md §1.1/1.2/1.3`.)

### Toggle control: CSS

**T-418** — create `src/ui/styles/toggle.css` (or append to `keypad.css`): `.theme-toggle`
base styles — `32×32px` button, `44×44px` padding tap target, icon size `20×20px`, centered.
(`04-ui.md §1.4`.)

**T-419** — `toggle.css`: `.theme-toggle:active` press feedback — `transform: scale(0.92)`,
`transition: transform var(--motion-press)`. (`04-ui.md §1.5`.)

**T-420** — `toggle.css`: `.theme-toggle` focus ring — `3px solid var(--accent)`, `3px offset`,
consistent across both themes. (`04-ui.md` a11y table, `08-design-system §8`.)

### Theme cross-fade transition

**T-421** — `tokens.css` (or `layout.css`): add `:root { transition: background 300ms ease,
color 300ms ease, border-color 300ms ease; }` for the token cross-fade on toggle. (`04-ui.md §1.6`,
`03-rules` R-M4-08.)

**T-422** — same file as T-421: add `@media (prefers-reduced-motion: reduce)` block that sets
`transition: none` on `:root` (drops cross-fade to instant). Also disable any aurora pulse
animation in the light block here. (`03-rules` R-M4-08, `_picked.md` BUILD note, `05-edge-cases`
EC-M4-05.)

### Wiring

**T-423** — `src/ui/main.ts`: import `theme.ts`; on module init, call `resolveTheme()` →
`applyTheme()` → `attachOsChangeListener()` (the runtime init, after the no-FOUC head script
has already set the attribute for first-paint). (`02-flows` F1/F2.)

**T-424** — `src/ui/main.ts` (or `theme.ts` init): wire `#theme-toggle` click handler →
`toggleTheme()`; update `aria-label` and `aria-pressed` + icon after each toggle. (`04-ui.md §1.1/1.2`,
`02-flows` F3.)

### Tests

**T-425** — `src/ui/theme.test.ts`: test `resolveTheme()` precedence — stored `"light"` wins
over OS dark; stored `"dark"` wins over OS light; valid stored value wins. (`03-rules` R-M4-01.)

**T-426** — `src/ui/theme.test.ts`: test `resolveTheme()` — corrupt/invalid stored value
falls through to OS; absent stored value falls through to OS. (`05-edge-cases` EC-M4-02.)

**T-427** — `src/ui/theme.test.ts`: test `resolveTheme()` — blocked/throwing localStorage
(mock throw) falls through to OS-default without throwing. (`05-edge-cases` EC-M4-01.)

**T-428** — `src/ui/theme.test.ts`: test `writeStoredTheme()` — blocked/throwing storage
(mock throw) swallows error; toggle still changes `data-theme` attribute (session-only).
(`05-edge-cases` EC-M4-01.)

**T-429** — `src/ui/theme.test.ts`: test `resolveTheme()` terminal fallback — no stored value
AND no `matchMedia` support (mock `undefined`) → returns `"dark"`. (`05-edge-cases` EC-M4-03.)

### AA contrast verification

**T-430** — manual + tooling: load the built app in browser with `[data-theme="light"]`, take
screenshots at the worst gradient patch, run contrast checks against the five target surface
pairs in `04-ui.md §3.2` (display numeral, digit button labels, operator labels, equals button,
focus ring). Record pass/fail; raise `--glass-fill` alpha if any fail before touching text colour.
(`04-ui.md §3.2`, `05-edge-cases` EC-M4-08, `08-design-system §8`.)

---

> Task count: **30** (T-401 … T-430)
> M1 untouched. M2/M3 markup untouched except T-417 (filling `.toggle-slot`).
