---
storm-phase: specify
storm-module: 04-theming
storm-canonical: true
storm-depends-on:
  - storm/specify/04-theming/_briefing.md
  - src/ui/styles/tokens.css
  - index.html
---

# M4 Theming — Tech Choices

> **Headline: ZERO new dependencies.** Every mechanism M4 needs is a web-platform primitive
> already shipping in every target browser. `package.json` gains nothing — no theming lib, no
> state lib, no helper. This file records the four technical choices (swap mechanism, OS
> detection, persistence, no-FOUC) with their head-to-heads and CP-6 verification cites.

## 0. Dependency budget — explicit

- **No runtime dependency added.** Current `dependencies` = `{ decimal.js }` only (verified
  against `package.json` this session); `devDependencies` = jsdom / typescript / vite / vitest.
  M4 adds **none** to either list. The entire feature is: one CSS override block + one DOM
  attribute + `matchMedia` + `localStorage` + one tiny inline `<script>`.
- This satisfies the profile-fit override (#FF-004): the lowest-bespoke, no-dependency option is
  the correct one — a theming library would add a dependency *and* more bespoke wiring than the
  vanilla path, so it loses on both axes.

---

## 1. Theme-swap mechanism — CSS custom-property override via attribute selector

### Decision

Keep the shipped **dark v3 baseline as the `:root` default** (frozen, unchanged — CF-1), and add
a single **`[data-theme="light"] { … }`** override block in `tokens.css` that re-declares ONLY
the light-palette colour tokens. Runtime swaps theme by setting
`document.documentElement.dataset.theme = "light" | "dark"`.

```css
/* tokens.css — dark stays the :root default (ships today, untouched) */
:root { --accent: #7c5cff; --bg-base: #0a0820; /* …all v3 dark tokens… */ }

/* M4 adds: light override — re-declares the SAME token names, light values (TD-1 mirror-vibrant) */
[data-theme="light"] {
  --accent: /* light-palette value, derived in 04-ui */;
  --bg-base: /* … */;
  /* …only the themed colour tokens; structural literals (radius/blur/shadow) NOT repeated… */
}
```

Because every component rule already reads `var(--token)` from the single `:root` block
(CF-3 / UR-029), overriding the token *values* under the attribute selector re-skins the whole
app with **zero component-CSS edits**. The cascade does the work: a more specific
`[data-theme="light"]` selector wins over `:root` when the attribute is present; absent it, the
`:root` dark default applies. `data-theme="dark"` is therefore allowed to be either explicit or
simply *absent* — both resolve to the dark baseline (no separate dark override block needed).

### Head-to-head (profile-fit #FF-004 — prefer lowest-bespoke, no-dep)

| Candidate | New dep? | Bespoke surface | Verdict |
|---|---|---|---|
| **Attribute selector `[data-theme]` override (chosen)** | none | 1 CSS block + 1 DOM attr write | **WIN** — least code, no dep, additive over frozen dark default |
| Class toggle (`.theme-light` on `<html>`) | none | 1 CSS block + classList add/remove | functionally equivalent; `dataset.theme` is marginally cleaner as a single closed-domain slot (`"light"|"dark"`) vs a class that could co-exist with others. Tie on cost; attribute chosen for the explicit single-value semantics that match the data-model (`01-data-model §3`). |
| Two separate stylesheets + swap `<link media>`/`disabled` | none | 2 CSS files + JS link-swap + load-order/flash risk | LOSE — more bespoke, reintroduces a FOUC/flash window on swap, splits the single-source token file. |
| Theming library (e.g. a CSS-in-JS / theme-provider lib) | **+1 dep** | provider wiring + token re-auth | LOSE on both axes — adds a dependency *and* more wiring than vanilla, for a 2-state toggle. CP-6 / #FF-004 reject. |

> Attribute vs class is a near-tie; the data-model already fixes the value domain to the two
> string literals `"light"|"dark"`, and `dataset.theme` mirrors that domain 1:1 — chosen for that
> semantic fit, not a performance claim.

CSS custom properties + attribute-selector overrides are a Baseline-widely-available platform
feature (custom properties shipped cross-browser since 2016–17); no currency risk, no cite needed
beyond noting they are core CSS.

---

## 2. OS detection — `window.matchMedia('(prefers-color-scheme: dark)')`

### Decision

Detect the OS preference with the native `window.matchMedia('(prefers-color-scheme: dark)')`
media-query object. Read `.matches` for the current value; subscribe to live OS changes with
`mediaQuery.addEventListener('change', handler)` (the modern listener API — NOT the deprecated
`addListener`).

```js
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const osTheme = prefersDark.matches ? 'dark' : 'light';
// optional live-follow when the user has NOT made an explicit choice (03-rules owns the policy):
prefersDark.addEventListener('change', e => { /* re-resolve if no stored override */ });
```

No library. `prefers-color-scheme` is the OS-preference signal; `matchMedia` is the JS read path.

### CP-6 verification cite

> **per WebFetch MDN `Web/CSS/@media/prefers-color-scheme` as of 2026-06:** `prefers-color-scheme`
> is **Baseline "Widely available"**, established cross-browser since Jan 2020, **not deprecated**.
> `window.matchMedia('(prefers-color-scheme: dark)')` + the `.addEventListener('change', …)`
> listener is confirmed the **current recommended API** (the older `MediaQueryList.addListener`
> is the deprecated form — M4 uses `addEventListener`).

---

## 3. Persistence — `localStorage` getItem/setItem, try/catch-wrapped

### Decision

Persist the chosen theme in a **single `localStorage` key** (`calc-theme`, value `"light" | "dark"`
— see `01-data-model`). Native Web Storage API: `localStorage.getItem('calc-theme')` /
`localStorage.setItem('calc-theme', theme)`. **All access wrapped in `try/catch`** — Safari
private mode, disabled storage, or quota errors throw on access, and a throw must never break load
or toggle. A thrown read = "no stored preference" → fall through to OS-default (handling owned by
`05-edge-cases`). No library, no JSON serialization (the value is a bare 2-literal string).

```js
function readStoredTheme() {
  try { return localStorage.getItem('calc-theme'); } catch { return null; }
}
function writeStoredTheme(t) {
  try { localStorage.setItem('calc-theme', t); } catch { /* storage blocked — run session-only */ }
}
```

### CP-6 verification cite

> **per WebFetch joshwcomeau.com/react/dark-mode (current article) cross-checked as of 2026-06:**
> `localStorage` theme persistence combined with a `matchMedia` fallback is the standard,
> still-current pattern: check `localStorage` first for a saved preference, fall back to
> `window.matchMedia('(prefers-color-scheme: dark)')`. Web Storage `getItem`/`setItem` is a
> long-stable Baseline API; the only correctness requirement is the try/catch guard for
> throwing/blocked-storage environments.

---

## 4. No-FOUC — small synchronous inline `<script>` in `index.html` `<head>`

### Decision

Add a **tiny synchronous (NON-module) inline `<script>` in `index.html` `<head>`**, placed BEFORE
the stylesheet-driven render, that resolves the theme (stored → OS → default dark) and sets
`document.documentElement.dataset.theme` **before first paint**. This eliminates the flash of the
wrong theme on load.

```html
<head>
  …
  <!-- M4 no-FOUC: resolve + apply theme BEFORE paint. Plain inline script (NOT type=module)
       so it runs synchronously, blocking paint, ahead of the deferred module bundle. -->
  <script>
    (function () {
      try {
        var t = localStorage.getItem('calc-theme');
        if (t !== 'light' && t !== 'dark') {
          t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.dataset.theme = t;
      } catch (e) {
        document.documentElement.dataset.theme = 'dark'; /* default v3 baseline */
      }
    })();
  </script>
</head>
```

**Why synchronous + non-module (the load-order crux):** a plain `<script>` (no `type="module"`,
no `defer`) is **render-blocking and runs in document order**, so the `data-theme` attribute is on
`<html>` before the browser paints — the CSS `[data-theme]` override is already resolvable on the
first paint, no flash. A `type="module"` script is **implicitly deferred** (runs after the
document is parsed, *after* first paint) — using one here would REINTRODUCE the flash. So this
script MUST stay a plain inline script.

### Vite implication (verified — inline non-module script is preserved as-is)

> **per Context7 `/vitejs/vite` guide + MDN script-loading semantics, as of 2026-06:** Vite treats
> `index.html` as source and *resolves / transforms* `<script type="module" src>` and inline
> `<script type="module">` (and `<link href>`). A **plain inline `<script>` without `type="module"`
> is NOT a module entry** — Vite does not bundle, transform, or defer it; it is **preserved verbatim**
> in the built HTML, in document order, ahead of the deferred module bundle (`main.ts` is loaded via
> `<script type="module" src="/src/ui/main.ts">`, which is deferred by spec).

Practical consequences for this project's current Vite setup (`vite.config.ts` = defaults, repo
root = Vite root, `index.html` at root):

- **Keep the no-FOUC script as a plain `<script>`** — do NOT add `type="module"` (would defer it →
  flash) and do NOT move it to an external file imported by `main.ts` (that path is the deferred
  module graph → flash). Inline-in-head is the correct, verified placement.
- The script is tiny, dependency-free, and references only `localStorage`, `matchMedia`, and
  `document.documentElement` — all available at parse time, before the module bundle loads.
- No `vite.config.ts` change is required. The existing default build emits the inline head script
  unchanged into `dist/index.html`.

`05-edge-cases` + `03-rules` own the exact resolution-precedence and throw-safety contract; this
file fixes the **mechanism + placement + Vite-compat** facts.

---

## 5. Summary — the four choices, one line each

| Concern | Choice | New dep? | Verification |
|---|---|---|---|
| Swap mechanism | `[data-theme="light"]` CSS override over frozen `:root` dark default; `dataset.theme` write | none | core CSS custom-properties (Baseline) |
| OS detection | `window.matchMedia('(prefers-color-scheme: dark)')` + `addEventListener('change')` | none | WebFetch MDN, 2026-06 (Baseline, not deprecated) |
| Persistence | `localStorage` `calc-theme` single key, try/catch-wrapped | none | WebFetch joshwcomeau dark-mode, 2026-06 |
| No-FOUC | synchronous **non-module** inline `<script>` in `<head>`, set `data-theme` before paint | none | Context7 /vitejs/vite + MDN script semantics, 2026-06 |

**Net dependency delta: 0.** M4 ships entirely on web-platform primitives already present in every
target browser.
