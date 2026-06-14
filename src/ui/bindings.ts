// M2 Calculator UI — click + keyboard bindings (Groups 7–8, T-147..T-160)
//
// INT-4 CONVERGENCE INVARIANT:
// Click and keyboard funnels through ONE shared dispatcher: handleKeyIntent().
// A digit-7 click and a '7' keypress both resolve to intent "digit:7" and both
// call the same dispatch(). No divergent logic anywhere.
//
// Architecture:
//   click delegated listener (keypad)  ─┐
//                                        ├──► handleKeyIntent(intent) ──► dispatch()
//   document keydown listener          ─┘
//
// The shared funnel is handleKeyIntent(intent: string):
//   "digit:0".."digit:9"  → dispatch(s => inputDigit(s, d))
//   "decimal"             → dispatch(s => inputDecimal(s))
//   "op:add" etc.         → dispatch(s => inputOperator(s, op))
//   "equals"              → dispatch(s => inputEquals(s))
//   "clear-entry"         → dispatch(s => inputClearEntry(s))
//   "all-clear"           → dispatch(s => inputAllClear(s))

import type { Operator } from '../types';
import {
  dispatch,
  inputDigit,
  inputDecimal,
  inputOperator,
  inputEquals,
  inputClearEntry,
  inputAllClear,
} from './state';
import { KEY_TO_OPERATOR } from './operator-map';

// ---------------------------------------------------------------------------
// Shared intent dispatcher — the convergence point (INT-4)
//
// Intent format:
//   "digit:<d>"   where d ∈ '0'..'9'
//   "decimal"
//   "op:<op>"     where op is an Operator string (add/subtract/multiply/divide)
//   "equals"
//   "clear-entry"
//   "all-clear"
//
// Unknown or empty intent strings are a no-op (early return).
// ---------------------------------------------------------------------------
function handleKeyIntent(intent: string): void {
  if (!intent) return;

  if (intent.startsWith('digit:')) {
    const d = intent.slice(6); // one character: '0'..'9'
    dispatch(s => inputDigit(s, d));
    return;
  }

  if (intent.startsWith('op:')) {
    const op = intent.slice(3) as Operator;
    dispatch(s => inputOperator(s, op));
    return;
  }

  switch (intent) {
    case 'decimal':
      dispatch(s => inputDecimal(s));
      break;
    case 'equals':
      dispatch(s => inputEquals(s));
      break;
    case 'clear-entry':
      dispatch(s => inputClearEntry(s));
      break;
    case 'all-clear':
      dispatch(s => inputAllClear(s));
      break;
    // Unknown intents are no-ops (T-160 principle applied to click side too)
  }
}

// ---------------------------------------------------------------------------
// Group 7 — Click binding (T-147..T-152)
//
// ONE delegated listener on .keypad container.
// Reads data-attrs from the event target (or its closest button ancestor):
//   data-digit   → intent "digit:<d>"
//   data-op      → intent "op:<op>"
//   data-action  → intent passed directly (decimal/equals/clear-entry/all-clear)
//
// If none of the above attrs are present the click is on a non-interactive
// element inside the keypad (e.g. the container itself) — early return.
// ---------------------------------------------------------------------------
export function setupClickBinding(): void {
  const keypad = document.querySelector<HTMLElement>('.keypad');
  if (!keypad) {
    console.warn('[bindings] .keypad element not found — click binding skipped.');
    return;
  }

  keypad.addEventListener('click', (e: MouseEvent) => {
    // Walk up to the nearest button (handles clicks on button child nodes)
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-digit], button[data-op], button[data-action]');
    if (!btn) return;

    const digit  = btn.dataset['digit'];
    const op     = btn.dataset['op'];
    const action = btn.dataset['action'];

    let intent = '';

    if (digit !== undefined) {
      // T-147 digit clicks (0–9)
      // T-148 special case: data-digit is used for all digits; decimal has data-action="decimal"
      intent = `digit:${digit}`;
    } else if (op !== undefined) {
      // T-149 operator clicks — data-op already holds the Operator string (add/subtract/…)
      intent = `op:${op}`;
    } else if (action !== undefined) {
      // T-148 decimal click (data-action="decimal")
      // T-150 equals click (data-action="equals")
      // T-151 CE click (data-action="clear-entry")
      // T-152 AC click (data-action="all-clear")
      intent = action;
    }

    handleKeyIntent(intent);
  });
}

// ---------------------------------------------------------------------------
// Group 8 — Keyboard binding + whitelist (T-153..T-160)
//
// ONE document-level keydown listener (T-153).
// Whitelist:
//   digits 0–9    → "digit:<d>"           (T-155)
//   .             → "decimal"              (T-156)
//   + - * /       → "op:<op>" via map     (T-157); preventDefault on '/'
//   Enter =       → "equals"              (T-158)
//   Escape        → "all-clear"           (T-159)
//   all others    → early return (no-op)  (T-160, Backspace = no-op)
//
// Modifier guard (T-154): ctrl/meta/alt combos early-return before whitelist.
// ---------------------------------------------------------------------------
export function setupKeyboardBinding(): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // T-154 — early-return on ctrl/meta/alt modifier combos
    // These are browser or OS shortcuts (Ctrl+R reload, Cmd+C copy, etc.)
    // and MUST NOT be swallowed.
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key;

    // T-155 — digits 0–9
    if (/^[0-9]$/.test(key)) {
      handleKeyIntent(`digit:${key}`);
      return;
    }

    // T-156 — decimal point
    if (key === '.') {
      handleKeyIntent('decimal');
      return;
    }

    // T-157 — operators + - * /
    // '/' gets preventDefault so Firefox quick-find (/) doesn't fire.
    if (key in KEY_TO_OPERATOR) {
      if (key === '/') e.preventDefault();
      handleKeyIntent(`op:${KEY_TO_OPERATOR[key]}`);
      return;
    }

    // T-158 — Enter or '=' → equals
    if (key === 'Enter' || key === '=') {
      // preventDefault on Enter in case the page has a form somewhere
      e.preventDefault();
      handleKeyIntent('equals');
      return;
    }

    // T-159 — Escape → all-clear
    if (key === 'Escape') {
      handleKeyIntent('all-clear');
      return;
    }

    // T-160 — non-whitelisted keys: early return (Backspace, Tab, F-keys, etc. = no-op)
    // DO NOT call preventDefault here — only swallow keys we handle.
  });
}
