---
storm-phase: build
storm-module: 04-theming
storm-depends-on:
  - storm/specify/04-theming/_index.md
storm-canonical: false
---

# BUILD Plan — M4 Theming

> Status legend: `[PENDING]` · `[IN PROGRESS]` · `[DONE]`
> 30 SPECIFY tasks (T-401..430) grouped by-file into 7 build groups to avoid parallel
> file-conflicts. Dark v3 frozen default; M1 untouched; M2/M3 markup untouched except `.toggle-slot`.

## Group → wave map

| Group | Tasks | File(s) | Wave | Depends on |
|---|---|---|---|---|
| **A** | T-401..409, T-421, T-422 | `src/ui/styles/tokens.css` | 1 | — |
| **B** | T-410, T-417 | `index.html` | 1 | — |
| **C** | T-411..416 | `src/ui/theme.ts` (new) | 1 | — |
| **D** | T-418..420 | `src/ui/styles/toggle.css` (new) | 1 | — |
| **E** | T-423, T-424 | `src/ui/main.ts` | 2 | B, C |
| **F** | T-425..429 | `src/ui/theme.test.ts` (new) | 2 | C |
| **G** | T-430 | (orchestrator: browser AA verify) | 3 | A,B,C,D,E |

## Tasks

### Group A — tokens.css: light palette + glass-edge + cross-fade  `[DONE]` (0fb2cc8)
- T-401 header/structure annotate dark-default + reserve light section
- T-402 `[data-theme=light]` bg tokens (warm dawn aurora)
- T-403 light accent tokens (indigo, AA-darkened)
- T-404 light operator-accent tokens (coral-rose, AA-darkened)
- T-405 light text tokens (dark-indigo for AA)
- T-406 light glass tokens (white, higher alpha)
- T-407 light scrim + RGB triplet tokens
- T-408 light `--error` (AA-darkened red)
- T-409 Iridescent Dawn `::before` chromatic ring (light-only, additive)
- T-421 `:root` 300ms token cross-fade transition
- T-422 `prefers-reduced-motion` → transition none + disable light aurora pulse

### Group B — index.html: no-FOUC script + toggle markup  `[DONE]` (50710d7)
- T-410 synchronous non-module inline head script (resolve stored→OS→dark, set data-theme pre-paint)
- T-417 fill `.toggle-slot` with `<button#theme-toggle>` + moon icon, remove slot aria-hidden

### Group C — theme.ts: resolution + persistence module  `[DONE]` (a5a4079)
- T-411 `readStoredTheme()` (try/catch, exact-match validate)
- T-412 `writeStoredTheme()` (try/catch, silent fallback)
- T-413 `resolveTheme()` (stored → matchMedia → dark)
- T-414 `applyTheme()` (set documentElement.dataset.theme)
- T-415 `toggleTheme()` (flip + apply + persist)
- T-416 `attachOsChangeListener()` (modern addEventListener, stored-wins guard)

### Group D — toggle.css: toggle control styles  `[DONE]` (cb71b75)
- T-418 `.theme-toggle` base (32px btn, 44px tap target, 20px icon)
- T-419 `:active` press feedback (scale 0.92, --motion-press)
- T-420 focus ring (3px solid var(--accent), 3px offset)

### Group E — main.ts: wiring  `[DONE]` (e5ac9e6)
- T-423 init: resolveTheme → applyTheme → attachOsChangeListener
- T-424 wire #theme-toggle click → toggleTheme + update aria-label/aria-pressed/icon

### Group F — theme.test.ts: unit tests  `[DONE]` (73b87d5)
- T-425 precedence: valid stored wins over OS
- T-426 corrupt/absent stored → OS fallback
- T-427 blocked/throwing localStorage read → OS fallback no-throw
- T-428 blocked write → swallow, session-only toggle still flips attribute
- T-429 terminal fallback: no stored + no matchMedia → dark

### Group G — AA contrast verification  `[PENDING]`
- T-430 orchestrator: build + load light theme in real browser, screenshot worst gradient patch,
  verify 5 surface pairs clear WCAG AA; raise --glass-fill alpha before darkening text if any fail
