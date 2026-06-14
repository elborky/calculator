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

// ---------------------------------------------------------------------------
// T-170/T-171 — result rise animation deduplication guard.
//
// Tracks the LAST display value that fired the animation. On equals press,
// render() fires the fade+rise class only when the display value actually
// changes (T-171: repeated = re-evaluates with same operands → same result →
// no re-animation). Stored as a module-level string (not in EngineState —
// this is pure render-layer bookkeeping, not data-model state, UR-018).
// ---------------------------------------------------------------------------
let _lastAnimatedValue: string = '';

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
// T-164..T-166 — fitDisplay(isError): shrink font → scroll fallback (D-006)
//
// Adjusts .readout presentation after textContent is set so the value is
// always fully visible — no truncation, no ellipsis (correctness / trust).
//
// Algorithm:
//   1. If isError: clear fit state and return — error sentences wrap, never scroll.
//   2. Read the computed font-floor from the --readout-font-floor CSS custom property.
//   3. Clear any previous inline font-size override and scroll data-attr.
//   4. If scrollWidth <= clientWidth: fits at natural clamp() size → done.
//   5. Otherwise: step down font-size in 0.1rem decrements toward the floor.
//      Stop as soon as it fits OR floor is reached.
//   6. If still overflowing at the floor: activate horizontal scroll mode.
//      Wrap the text in a span.readout-inner (direction:ltr inside rtl container)
//      so digit order is correct and exponent strings (T-166) render fully.
//
// Right-anchor technique (T-165): CSS sets direction:rtl on the scroll container
// so the scroll origin is the right edge — least-significant digits stay visible.
// The inner ltr span restores natural reading order for the content.
//
// Called from render() on every state change, after textContent is set.
// Never called during error render (isError guard at top).
// ---------------------------------------------------------------------------
function fitDisplay(isError: boolean): void {
  const el = readoutEl!;

  if (isError) {
    // Error sentences wrap via word-break (CSS). Reset fit state and exit.
    el.style.fontSize    = '';
    el.removeAttribute('data-overflow');
    // Unwrap inner span if present from a previous scroll state
    const inner = el.querySelector('.readout-inner');
    if (inner) {
      el.textContent = inner.textContent;
    }
    return;
  }

  // --- read the floor from the CSS token (avoids hardcoded literals in JS) ---
  const floorStr = getComputedStyle(document.documentElement)
    .getPropertyValue('--readout-font-floor')
    .trim(); // e.g. "1.25rem"
  // Convert rem to px for comparison (document root font-size is the multiplier)
  const rootFontPx   = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const floorPx      = parseFloat(floorStr) * rootFontPx; // NaN-safe: parseInt("1.25") * 16

  // --- reset previous fit overrides so we measure from the natural clamp() size ---
  el.style.fontSize = '';
  el.removeAttribute('data-overflow');
  // Unwrap inner span if present (from prior scroll state)
  const prevInner = el.querySelector('.readout-inner');
  if (prevInner) {
    el.textContent = prevInner.textContent;
  }

  // Short-circuit: fits at natural size → done (UE-006 reset case)
  if (el.scrollWidth <= el.clientWidth) return;

  // --- Step 1: shrink font-size in 0.1rem steps toward the floor ---
  // Start from the currently computed size (whatever clamp() resolved to).
  let currentPx = parseFloat(getComputedStyle(el).fontSize);

  while (currentPx > floorPx && el.scrollWidth > el.clientWidth) {
    currentPx = Math.max(currentPx - 1.6, floorPx); // ~0.1rem step at 16px root
    el.style.fontSize = `${currentPx}px`;
  }

  // --- Step 2: still overflowing at floor → activate horizontal scroll ---
  if (el.scrollWidth > el.clientWidth) {
    el.setAttribute('data-overflow', 'scroll');
    // Wrap the raw text in a ltr span inside the rtl scroll container.
    // This preserves digit/exponent order while right-anchoring the scroll.
    // T-166: exponent strings (e.g. "1.23e+45") are inside the ltr span
    //        so they render fully and are not reversed by the rtl container.
    const text = el.textContent ?? '';
    el.textContent = ''; // clear
    const span = document.createElement('span');
    span.className  = 'readout-inner';
    span.textContent = text;
    el.appendChild(span);
  }
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
//   The class routes to var(--error) in CSS; it never stores a UI-only boolean.
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

  // T-170 — result fade+rise animation on equals (F11, §7 motion).
  // T-171 — guard: only re-trigger when the displayed value is NEW.
  //
  // Fires when justEvaluated is true AND the readout text differs from the
  // last value that triggered the animation. This means:
  //   - First equals press:  new result → animates.
  //   - Repeated = (same operands, same result): value unchanged → no re-fire.
  //   - New operand then =: result differs → animates again.
  //   - Error state: isError is true → skip (no result animation on errors).
  //
  // The class is force-removed then re-added in the same microtask so the
  // browser resets the animation even if the same value appears later.
  if (state.justEvaluated && !isError) {
    if (readoutText !== _lastAnimatedValue) {
      _lastAnimatedValue = readoutText;
      // Force CSS animation restart: remove class, flush layout, re-add.
      readoutEl!.classList.remove('readout--result');
      // requestAnimationFrame ensures the class removal is painted before re-add,
      // so the browser resets the animation origin correctly.
      requestAnimationFrame(() => {
        readoutEl!.classList.add('readout--result');
      });
    }
  } else if (!state.justEvaluated) {
    // Clear the animation class when the user starts typing a new operand
    // (so the next equals fires a fresh animation from a clean state).
    readoutEl!.classList.remove('readout--result');
    // Reset the guard so the same result value can animate again next time.
    _lastAnimatedValue = '';
  }

  // T-145 — error CSS class toggle (UR-016, INT-6)
  // Derived from live state — never stored as a UI flag (UR-018).
  const displayEl = readoutEl!.closest<HTMLElement>('.display');
  if (displayEl) {
    displayEl.classList.toggle('display--error', isError);
  }

  // T-164..T-166 — fitDisplay after readout text is set (D-006).
  // Error sentences skip fit (they wrap via CSS word-break).
  fitDisplay(isError);

  // Pending-expression line (UR-006..UR-008, T-144)
  const pendingText = pendingLine(state);
  const hasPending  = pendingText.length > 0;

  pendingEl!.textContent  = pendingText;
  // Toggle the HTML `hidden` attribute — the line reserves space when visible
  // (CSS uses `visibility`/`min-height`), and is fully collapsed when hidden.
  // T-162 ASSERTION HOOK: during error, pendingLine() returns "" (errorState !== null
  // check at render.ts:68), so pendingEl always has [hidden] set in error state.
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
