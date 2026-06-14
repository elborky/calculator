// M2 Calculator UI — Operator / key / glyph maps (Group 5, T-140..T-141)
//
// INT-5: M2 holds the bidirectional operator map as frozen module constants.
// Input direction:  keyboard key / button data-op  →  Operator union
// Glyph direction:  Operator                        →  true-Unicode glyph (F10 / UR-013)
//
// These are frozen objects — they never change at runtime, are not reactive state,
// and are consumed by the render function (pending-line glyphs) and the keyboard/click
// bindings (Groups 7–8).

import type { Operator } from '../types';

// ---------------------------------------------------------------------------
// T-140 — keyboard key → Operator
// Maps the four whitelist input keys (UR-011) to the typed Operator union values.
// The `as const` assertion + `Record` typing ensures the map is frozen and the
// value type is exactly Operator (no widening to string).
// ---------------------------------------------------------------------------
export const KEY_TO_OPERATOR: Readonly<Record<string, Operator>> = Object.freeze({
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
} as const);

// ---------------------------------------------------------------------------
// T-141 — Operator → true-Unicode display glyph (F10, UR-013, UR-014)
//
// Codepoints used (INT-5 / UR-013):
//   add      → U+002B  PLUS SIGN            (+)  — same as ASCII, included for completeness
//   subtract → U+2212  MINUS SIGN           (−)  — NOT the ASCII hyphen-minus U+002D
//   multiply → U+00D7  MULTIPLICATION SIGN  (×)
//   divide   → U+00F7  DIVISION SIGN        (÷)
//
// These glyphs are used in:
//   • pendingLine() — the "12 +" secondary display line (UR-007)
//   • (button faces are already rendered in index.html with the correct HTML entities)
// ---------------------------------------------------------------------------
export const OPERATOR_TO_GLYPH: Readonly<Record<Operator, string>> = Object.freeze({
  add:      '+', // + PLUS SIGN
  subtract: '−', // − MINUS SIGN (not hyphen)
  multiply: '×', // × MULTIPLICATION SIGN
  divide:   '÷', // ÷ DIVISION SIGN
} as const);
