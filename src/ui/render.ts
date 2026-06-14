// M2 Calculator UI — render(state): DOM write function (Group 6, T-142..T-146)
//
// INT-2: Display value = getDisplayValue(state); M2 owns the error sentences.
// INT-3: Pending-expression line is M2-derived (accumulator + pendingOperator + glyph map).
// INT-6: Error styling is derived from state, not stored as a UI flag.
// D-006: fitDisplay() — shrink font toward floor; horizontal scroll as fallback (Group 10).
//
// render() is a PURE derivation pass followed by targeted DOM writes.
// It reads state once and writes the two display elements; it never stores
// display-related flags as module-level state (data-model §4 / UR-018).

import type { EngineState } from '../types';
import type { ErrorTag } from '../types';
import { getDisplayValue } from '../engine';
import { OPERATOR_TO_GLYPH } from './operator-map';

// ---------------------------------------------------------------------------
// Cached DOM element references — queried once at module initialisation.
// Avoids redundant getElementById calls on every render() invocation.
// ---------------------------------------------------------------------------
const readoutEl  = document.querySelector<HTMLElement>('.display .readout');
const pendingEl  = document.querySelector<HTMLElement>('.display .pending-line');

if (!readoutEl || !pendingEl) {
  throw new Error(
    '[render] Required DOM elements not found. ' +
    'Expected .display .readout and .display .pending-line in index.html.',
  );
}

// ---------------------------------------------------------------------------
// T-143 — tag→sentence exhaustive switch over ErrorTag
//
// The return type of getDisplayValue() is `string | ErrorTag`.
// When it returns an ErrorTag literal we map it to a user-facing sentence (UR-002).
// The `never`-typed default ensures a compile-time error if a new ErrorTag is
// added to the union without updating this switch (INT-2 exhaustive requirement).
// ---------------------------------------------------------------------------
function errorTagToSentence(tag: ErrorTag): string {
  switch (tag) {
    case 'divide-by-zero':
      return 'Cannot divide by zero';
    case 'overflow':
      return 'Number too large';
    default: {
      // TypeScript narrows `tag` to `never` here — a compile error if any
      // ErrorTag literal is unhandled above.
      const _exhaustive: never = tag;
      return _exhaustive; // unreachable at runtime
    }
  }
}

// ---------------------------------------------------------------------------
// T-144 — pendingLine(state) derivation (UR-006..UR-008)
//
// Shows `<accumulator> <glyph>` only when:
//   • accumulator !== null
//   • pendingOperator !== null
//   • errorState === null
//   • justEvaluated === false
//
// Returns an empty string in all other conditions (hidden case).
// ---------------------------------------------------------------------------
function pendingLine(state: EngineState): string {
  if (
    state.accumulator === null ||
    state.pendingOperator === null ||
    state.errorState !== null ||
    state.justEvaluated
  ) {
    return '';
  }
  const accStr  = state.accumulator.toString();
  const glyph   = OPERATOR_TO_GLYPH[state.pendingOperator];
  return `${accStr} ${glyph}`;
}

// ---------------------------------------------------------------------------
// T-142 — render(state): primary readout + pending line + error class toggle
//
// Called by dispatch() on every state change AND once at app start (T-146).
// Writes are minimal: only the two text nodes and the CSS class / hidden attr.
//
// T-145 — error CSS class toggle is DERIVED (not stored):
//   state.errorState !== null  →  add    'display--error'
//   otherwise                  →  remove 'display--error'
//   The class routes to var(--error) in CSS (via .display--error .readout rule in
//   layout.css); it never stores a UI-only boolean (INT-6 / UR-018).
// ---------------------------------------------------------------------------
export function render(state: EngineState): void {
  const displayValue = getDisplayValue(state);

  // Determine whether this is an error render (used for primary text + class)
  const isError = state.errorState !== null;

  // Primary readout text (UR-001, UR-002, UR-005)
  const readoutText = isError
    ? errorTagToSentence(displayValue as ErrorTag)
    : (displayValue as string);

  readoutEl!.textContent = readoutText;

  // T-145 — error CSS class toggle (UR-016, INT-6)
  // Derived from live state — never stored as a UI flag (UR-018).
  // layout.css .display--error .readout applies: color var(--error), smaller
  // font-size, white-space:normal so the sentence wraps (not colour alone — UR-026).
  const displayEl = readoutEl!.closest<HTMLElement>('.display');
  if (displayEl) {
    displayEl.classList.toggle('display--error', isError);
  }

  // Pending-expression line (UR-006..UR-008, T-144)
  const pendingText = pendingLine(state);
  const hasPending  = pendingText.length > 0;

  pendingEl!.textContent  = pendingText;
  // Toggle the HTML `hidden` attribute — the line reserves space when visible
  // (CSS uses `visibility`/`min-height`), and is fully collapsed when hidden.
  // T-162 ASSERTION HOOK: during error, pendingLine() returns "" (errorState !== null
  // check at line 69 above), so pendingEl always has [hidden] set in error state.
  // REVIEW e2e assertion: document.querySelector('.pending-line[hidden]') is truthy
  // whenever the calculator is in an error state.
  if (hasPending) {
    pendingEl!.removeAttribute('hidden');
  } else {
    pendingEl!.setAttribute('hidden', '');
  }
  // aria-hidden follows: hidden when empty (content is "" and element is hidden anyway)
  pendingEl!.setAttribute('aria-hidden', hasPending ? 'false' : 'true');
}
