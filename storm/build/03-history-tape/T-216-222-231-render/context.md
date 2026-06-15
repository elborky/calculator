---
storm-phase: build
storm-module: 03-history-tape
storm-canonical: false
---

# Context: T-216..T-222 + T-231 — renderHistory() (Group E + G slot)

## What

Creates `src/ui/history/render-history.ts` — the sole render function for the history tape panel.
Exports `renderHistory(): void`. Called after every `appendEntry()` (Group C) and `clearTape()` (Group D).

## Why

The recording seam (Group C, state.ts subscriber) appends to the in-memory tape but does not
touch the DOM. The render function bridges the data layer to the `.history-slot` DOM slot that
ships `aria-hidden="true"` in index.html (F-M3-8). Removing `aria-hidden` and building the
entry list are both owned here.

## Spec refs

- `storm/specify/03-history-tape/04-ui.md` §2 (entry anatomy), §3 (four states), §6 (a11y callouts)
- `storm/specify/03-history-tape/04-ui/_picked.md` — v1 single-line canonical layout
- `storm/specify/03-history-tape/01-data-model.md` §2 (oldest-first ordering)

## Class-name contract (read from src/ui/history/history.css — Group F)

Exact class names used, confirmed against history.css:

| Element        | Class                    | Tag     |
|----------------|--------------------------|---------|
| Panel section  | `.history-tape`          | section |
| Header         | `.history-tape__header`  | div     |
| Scroll region  | `.history-tape__scroll`  | div     |
| Entry list     | `.history-list`          | ul      |
| Entry row      | `.history-entry`         | li      |
| New entry mod  | `.history-entry--new`    | (on li) |
| Expression     | `.history-expr`          | span    |
| Equals glyph   | `.history-eq`            | span    |
| Result         | `.history-result`        | span    |
| Empty state    | `.history-empty`         | div     |

Empty state toggle: `data-empty="true"` attribute on `.history-tape`.
CSS selectors `.history-tape[data-empty="true"] .history-tape__scroll { display:none }` and
`.history-tape[data-empty="true"] .history-empty { display:flex }` handle visibility.

## Ordering decision: REVERSE-READ in JS

`getTape()` returns oldest-first (D-M3-DM-01). `history.css` `.history-list` uses
`flex-direction: column` (NOT column-reverse). CSS comment states "Group E inserts at the start".

Decision: **reverse the getTape() array in JS** so newest index 0 renders at the top of the
`<ul>`. This means the most recently added entry (`[...tape].reverse()[0]`) is the first `<li>`
and receives `.history-entry--new`.

Alternative (column-reverse CSS) was NOT chosen: history.css already ships `flex-direction: column`
(Group F owns CSS, Group E owns render — no touching CSS).

## T-231 (Group G) — checkScrollFocus()

Conditional tabindex on `.history-tape__scroll`: applied IFF `scrollHeight > clientHeight`.
Mirrors render.ts `clearScrollA11y()` precedent exactly. When not overflowing: tabindex and
aria-label are removed (never a permanent dead tab stop, spec §6 "not a focus trap").
