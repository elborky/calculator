---
storm-phase: build
storm-module: 03-history-tape
storm-task-group: F
storm-tasks: T-223..T-230
storm-canonical: false
---

# Task Group F — Tape CSS (T-223..T-230)

## What

Creates `src/ui/history/history.css` — the complete CSS for the M3 History Tape panel,
implementing the **v1 Conservative single-line** visual baseline picked by the owner
(`storm/specify/03-history-tape/04-ui/_picked.md`). Also adds a single import line
in `src/ui/main.ts` (T-230).

## Why

Group E (render layer) needs stable CSS class targets before it writes the DOM.
Group F ships the CSS contract first; Group E will target these exact class names.

## Spec refs

- `storm/specify/03-history-tape/04-ui/_picked.md` — v1 single-line pick (canonical)
- `storm/specify/03-history-tape/04-ui/mockup-v1.html` — exact look reference
- `storm/specify/03-history-tape/04-ui.md` — §2 entry anatomy, §3 states, §6 a11y, §7 responsive
- `src/ui/styles/tokens.css` — design tokens (the UR-029 rule: use var(--…), never hardcode)
- `src/ui/styles/layout.css` — glassmorphism idiom and existing `.history-slot` rule
- `src/ui/main.ts` — stylesheet import mechanism (matches T-230)

## Class-name contract (GROUP E MUST USE THESE EXACT NAMES)

| Class | Element | Notes |
|---|---|---|
| `.history-slot` | `<aside>` | Already in `index.html`/`layout.css` — M3 adds no wrapper |
| `.history-tape` | `<section>` | The glass panel container (`aria-label="Calculation history"`) |
| `.history-tape__header` | `<div aria-hidden="true">` | Visible "History" label (quiet, uppercase) |
| `.history-tape__scroll` | `<div>` | Scroll region; `tabindex="0"` conditionally when overflowing |
| `.history-list` | `<ul role="list">` | Semantic entry list, newest at top |
| `.history-entry` | `<li>` | One completed calculation per row (single-line) |
| `.history-entry--new` | `<li>` + modifier | Applied to newest entry for slide-in animation |
| `.history-expr` | `<span>` | Expression text (`--text-secondary`) |
| `.history-eq` | `<span>` | The `=` glyph between expr and result |
| `.history-result` | `<span>` | Result text (`--text-primary`, font-weight 500) |
| `.history-empty` | `<div>` | Empty-state placeholder; `display:flex` when shown, hidden when list populated |

### Visual structure (Group E expected DOM)

```html
<aside class="history-slot">
  <section class="history-tape" aria-label="Calculation history">
    <h2 class="sr-only">Calculation history</h2>
    <div class="history-tape__header" aria-hidden="true">History</div>
    <div class="history-tape__scroll" role="group" aria-label="History entries, scrollable">
      <ul class="history-list" role="list">
        <li class="history-entry history-entry--new">
          <span class="history-expr">9 − 4</span>
          <span class="history-eq">=</span>
          <span class="history-result">5</span>
        </li>
        <!-- more entries -->
      </ul>
    </div>
    <div class="history-empty">Your history appears here</div>
  </section>
</aside>
```

### Visibility toggle contract

- Empty state: Group E adds `data-empty="true"` on `.history-tape` (or simply toggles
  `.history-empty` display via JS). CSS shows `.history-empty` when `[data-empty="true"]`
  is set and hides the scroll region. When populated, `.history-empty` is `display:none`.
- `.history-entry--new`: added by Group E render on the most-recently-inserted `<li>`;
  removed after animation completes (or left as-is — animation runs once via `animation-fill-mode: both`).

## Tokens used

All from `src/ui/styles/tokens.css` (UR-029 — zero hardcoded color literals):

- `--text-primary` — result color
- `--text-secondary` — expression color, header color
- `--glass-fill-display` — tape panel background (recessed, more translucent than slab)
- `--glass-border` — panel border + hairline entry dividers
- `--glass-border-bright` — NOT used (slab-level only)
- `--accent` — `=` glyph tint
- `--radius-display` — reused for tape panel radius (24px equivalent)
- `--blur-display` — 16px blur (explicit from token value)

New token added in this CSS:
- `--tape-scrim: rgba(14, 10, 36, 0.74)` — defined locally in `:root` addition
  in history.css (same near-opaque approach as `--display-scrim` for AA contrast)

## Tasks resolved

- T-223: recessed glass panel (`.history-tape`) — backdrop-filter blur 16px, border, radius, overflow-y:auto
- T-224: entry typography — Inter 0.875rem / 400 / 1.5 / tabular-nums
- T-225: expression = `--text-secondary`, result = `--text-primary`
- T-226: right-align entries, hairline `--glass-border` dividers (low alpha via `rgba(255,255,255,0.07)` from mockup)
- T-227: long-result `overflow-wrap: anywhere` — wrap not truncate (D-M3-EC-01)
- T-228: read-only — `cursor: default; pointer-events: none` on `.history-entry`
- T-229: `@keyframes historySlideIn` 180ms ease-out + `@media (prefers-reduced-motion: reduce)` cancel block
- T-230: import line added to `src/ui/main.ts` after `keypad.css`
