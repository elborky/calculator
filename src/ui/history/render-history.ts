// M3 History Tape — render function (Group E T-216..T-222, Group G T-231)
//
// Spec: storm/specify/03-history-tape/04-ui.md §2/§3/§6, 04-ui/_picked.md (v1 single-line)
//
// Idiom: matches render.ts — cached element refs queried once at module init,
// targeted DOM writes, derive-at-render (no stored "which state" flag),
// throw clear error if required DOM missing.
//
// Called by:
//   - Group C (state.ts subscriber) after appendEntry() on equals-resolve
//   - Group D (AC handler) after clearTape()
// This file only EXPORTS renderHistory(); it does NOT call dispatch/subscribe.

import { getTape } from './tape';

// ---------------------------------------------------------------------------
// T-216 — Cached DOM element references — queried once at module initialisation.
// Avoids redundant querySelector calls on every renderHistory() invocation.
// Matches render.ts cache-once + throw-if-missing pattern.
// ---------------------------------------------------------------------------
const slotEl   = document.querySelector<HTMLElement>('.history-slot');
const tapeEl   = document.querySelector<HTMLElement>('.history-tape');
const scrollEl = document.querySelector<HTMLElement>('.history-tape__scroll');
const listEl   = document.querySelector<HTMLUListElement>('.history-list');
const emptyEl  = document.querySelector<HTMLElement>('.history-empty');

if (!slotEl || !tapeEl || !scrollEl || !listEl || !emptyEl) {
  throw new Error(
    '[render-history] Required DOM elements not found. ' +
    'Expected .history-slot, .history-tape, .history-tape__scroll, ' +
    '.history-list, and .history-empty in index.html.',
  );
}

// ---------------------------------------------------------------------------
// T-217 — Remove aria-hidden from .history-slot on first render.
//
// The slot ships aria-hidden="true" in index.html (F-M3-8, §6 callout).
// We remove it once here so the tape is exposed to assistive technology from
// the moment it renders. We do NOT re-add it when empty — the empty placeholder
// is informative ("No calculations yet") and the region should remain accessible
// in all states (HR-020, F-M3-8).
// ---------------------------------------------------------------------------
slotEl.removeAttribute('aria-hidden');

// ---------------------------------------------------------------------------
// T-231 (Group G) — checkScrollFocus(): conditional tabindex on the scroll region.
//
// Applies tabindex="0" + aria-label ONLY when the scroll region overflows
// (scrollHeight > clientHeight). Mirrors render.ts clearScrollA11y() precedent.
// A non-overflowing tape has no tab stop here — never a permanent dead tab stop
// (spec §6 "not a focus trap", HE-028).
// ---------------------------------------------------------------------------
function checkScrollFocus(): void {
  if (scrollEl!.scrollHeight > scrollEl!.clientHeight) {
    scrollEl!.setAttribute('tabindex', '0');
    scrollEl!.setAttribute('aria-label', 'Calculation history, scroll to see all entries');
  } else {
    scrollEl!.removeAttribute('tabindex');
    scrollEl!.removeAttribute('aria-label');
  }
}

// ---------------------------------------------------------------------------
// T-222 — renderHistory(): rebuild the tape DOM from getTape() on each call.
//
// Full rebuild is correct and simple — the tape list is short (in-session only,
// D-M3-DM-03) and matches the simple derive-at-render idiom from render.ts.
// No stored "previous entry count" flag (derive-at-render, spec §3 / UR-018).
//
// Ordering: getTape() returns oldest-first (D-M3-DM-01). history.css uses
// flex-direction: column (NOT column-reverse). We reverse the read here so the
// newest entry appears first in the DOM (topmost <li>) and the slide-in
// animation (.history-entry--new) fires on the newest entry. (HR-019)
// ---------------------------------------------------------------------------
export function renderHistory(): void {
  const tape = getTape();
  const isEmpty = tape.length === 0;

  // --- T-218: empty state toggle ---
  // data-empty="true" on .history-tape drives CSS:
  //   .history-tape[data-empty="true"] .history-tape__scroll { display: none }
  //   .history-tape[data-empty="true"] .history-empty { display: flex }
  // The .history-empty div is NOT an <li> and NOT inside the <ul> (HE-012) —
  // it sits as a sibling of .history-tape__scroll, outside the list,
  // so it is never announced as a list item.
  if (isEmpty) {
    tapeEl!.setAttribute('data-empty', 'true');
    // Clear the list so stale entries don't linger
    listEl!.textContent = '';
    // Run scroll-focus check (will remove tabindex on empty list)
    checkScrollFocus();
    return;
  }

  // Populated — remove empty marker
  tapeEl!.removeAttribute('data-empty');

  // --- T-219: newest-first render ---
  // Reverse a copy of the oldest-first tape array.
  // Do NOT mutate the array returned by getTape() (it is a readonly view, tape.ts T-205).
  const newestFirst = [...tape].reverse();

  // Build the new list DOM
  const fragment = document.createDocumentFragment();

  newestFirst.forEach((entry, index) => {
    // --- T-220: single-line entry (v1 picked) ---
    // <li class="history-entry [history-entry--new]">
    //   <span class="history-expr">{expression}</span>
    //   <span class="history-eq"> = </span>
    //   <span class="history-result">{result}</span>
    // </li>
    //
    // textContent (NOT innerHTML) for all entry content — XSS-safe; expression
    // and result are pre-formatted display-ready strings from the engine (types.ts).
    // The expression already carries true-Unicode glyphs (−, ×, ÷) built by Group C
    // via OPERATOR_TO_GLYPH — render as-is (F-M3-9).
    //
    // F-M3-7 / _picked.md: the newest <li> (index === 0 in newestFirst) gets
    // .history-entry--new so history.css historySlideIn keyframe fires.
    const li = document.createElement('li');
    li.className = index === 0
      ? 'history-entry history-entry--new'
      : 'history-entry';

    const exprSpan = document.createElement('span');
    exprSpan.className = 'history-expr';
    exprSpan.textContent = entry.expression;

    const eqSpan = document.createElement('span');
    eqSpan.className = 'history-eq';
    eqSpan.textContent = ' = ';

    const resultSpan = document.createElement('span');
    resultSpan.className = 'history-result';
    resultSpan.textContent = entry.result;

    li.appendChild(exprSpan);
    li.appendChild(eqSpan);
    li.appendChild(resultSpan);
    fragment.appendChild(li);
  });

  // Swap the list content atomically
  listEl!.textContent = '';
  listEl!.appendChild(fragment);

  // --- T-221: NO aria-live on the tape container or children ---
  // The .display already carries role="status"/aria-live="polite" (M2, index.html)
  // and announces the result when equals resolves. Adding aria-live here would
  // double-announce every result (display says "15", tape would say "12 + 3 = 15"
  // again) — the double-announce a11y anti-pattern (04-ui §6 last row, US-M3-8).
  // The tape is a static, navigable record; SR users read it on demand.
  // DELIBERATE OMISSION: no aria-live, no aria-atomic, no role="log" on any tape node.

  // --- T-231 (Group G): conditional scroll focus ---
  checkScrollFocus();
}
