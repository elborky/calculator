// Calculation engine — M1
import { EngineState } from './types';

/**
 * Returns a fresh, zeroed EngineState — the canonical starting point for the engine.
 * Always returns a new object; callers can safely mutate the result.
 */
export function initialState(): EngineState {
  return {
    entryBuffer: '0',
    accumulator: null,
    pendingOperator: null,
    justEvaluated: false,
    errorState: null,
  };
}

/**
 * Handles a digit button press ('0'–'9').
 *
 * Rules applied (in order):
 *   R-014 / E-040  — error no-op: if errorState is set, return state unchanged.
 *   E-038          — justEvaluated reset: start fresh digit buffer, clear justEvaluated flag
 *                    (accumulator + pendingOperator preserved for operator-chaining).
 *   R-025 / E-037  — leading-zero suppression:
 *                      '0' + '0'  → no-op (double-zero stays '0')
 *                      '0' + <d>  → replace buffer with <d>
 *   Normal         — append digit to entryBuffer.
 *
 * Never mutates state; always returns a new EngineState object.
 */
export function inputDigit(state: EngineState, digit: string): EngineState {
  // R-014 / E-040 — error no-op
  if (state.errorState !== null) {
    return state;
  }

  // E-038 — fresh start after a completed evaluation
  if (state.justEvaluated) {
    return {
      ...state,
      entryBuffer: digit === '0' ? '0' : digit,
      justEvaluated: false,
    };
  }

  // R-025 / E-037 — leading-zero suppression
  if (state.entryBuffer === '0') {
    if (digit === '0') {
      // double-zero: no-op, stay at '0'
      return state;
    }
    // non-zero digit replaces the leading zero
    return { ...state, entryBuffer: digit };
  }

  // Normal append
  return { ...state, entryBuffer: state.entryBuffer + digit };
}

/**
 * Handles the decimal-point button press ('.').
 *
 * Rules applied (in order):
 *   R-014 / E-014  — error no-op: if errorState is set, return state unchanged.
 *   E-013          — justEvaluated reset: start fresh with "0.", clear justEvaluated flag.
 *   R-007 / E-009, E-010 — second decimal no-op: buffer already has '.', return unchanged.
 *   E-011          — leading decimal from fresh state: '0' → '0.' (handled by normal append).
 *   Normal         — append '.' to entryBuffer.
 *
 * Never mutates state; always returns a new EngineState object.
 */
export function inputDecimal(state: EngineState): EngineState {
  // R-014 / E-014 — error no-op
  if (state.errorState !== null) {
    return state;
  }

  // E-013 — fresh start after a completed evaluation
  if (state.justEvaluated) {
    return {
      ...state,
      entryBuffer: '0.',
      justEvaluated: false,
    };
  }

  // R-007 / E-009, E-010 — second decimal no-op
  if (state.entryBuffer.includes('.')) {
    return state;
  }

  // Normal append (covers E-011: '0' → '0.')
  return { ...state, entryBuffer: state.entryBuffer + '.' };
}
