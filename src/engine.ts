// Calculation engine — M1
import { Decimal } from './decimal-config';
import { EngineState, Operator, ErrorTag } from './types';

/**
 * Performs the arithmetic operation `left op right` using decimal.js.
 *
 * Rules applied:
 *   R-010 / R-011 — div-by-zero guard: if op is 'divide' and right is zero,
 *                   return 'divide-by-zero' WITHOUT computing.
 *   R-012         — overflow: after computation, if the result is not finite
 *                   (decimal.js returns Infinity for extreme magnitudes at the
 *                   configured precision), return 'overflow'.
 *
 * Pure function — no state touched.
 */
export function resolveOperation(
  left: Decimal,
  op: Operator,
  right: Decimal,
): Decimal | ErrorTag {
  // R-010 / R-011 — guard BEFORE computing
  if (op === 'divide' && right.isZero()) {
    return 'divide-by-zero';
  }

  let result: Decimal;
  switch (op) {
    case 'add':
      result = left.plus(right);
      break;
    case 'subtract':
      result = left.minus(right);
      break;
    case 'multiply':
      result = left.times(right);
      break;
    case 'divide':
      result = left.dividedBy(right);
      break;
  }

  // R-012 — overflow: decimal.js may produce a non-finite Decimal on extreme magnitudes
  if (!result.isFinite()) {
    return 'overflow';
  }

  return result;
}

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

/**
 * Handles an operator button press ('+', '−', '×', '÷').
 *
 * Rules applied (in order):
 *   R-014 / E-019  — error no-op: if errorState is set, return state unchanged.
 *   E-015 / D-010  — operator-first implicit 0: if accumulator is null, commit entryBuffer
 *                    to accumulator (covers both "0 +" and "5 +" first-press cases).
 *   E-016 / E-017  — operator-swap: if accumulator is set, pendingOperator is set, and no
 *                    right operand has been entered yet (entryBuffer === '0' && !justEvaluated),
 *                    just replace the pendingOperator without resolving.
 *   R-004 / E-018  — left-to-right chaining: if accumulator and pendingOperator are both set
 *                    and a right operand exists, resolve the pending operation first, then set
 *                    the new operator.
 *   D-011          — on chaining error, do NOT set the new operator.
 *
 * Never mutates state; always returns a new EngineState object.
 */
export function inputOperator(state: EngineState, op: Operator): EngineState {
  // R-014 / E-019 — error no-op
  if (state.errorState !== null) {
    return state;
  }

  if (state.accumulator === null) {
    // First operator press (or operator-first D-010/E-015):
    // commit the current entryBuffer as the left operand.
    return {
      ...state,
      accumulator: new Decimal(state.entryBuffer),
      pendingOperator: op,
      entryBuffer: '0',
      justEvaluated: false,
    };
  }

  if (state.pendingOperator === null) {
    // accumulator exists but no pending op — just set it (guard case)
    return {
      ...state,
      pendingOperator: op,
      entryBuffer: '0',
      justEvaluated: false,
    };
  }

  // accumulator and pendingOperator both set
  if (state.entryBuffer === '0' && !state.justEvaluated) {
    // E-016 / E-017 — operator-swap: no right operand entered yet
    return {
      ...state,
      pendingOperator: op,
    };
  }

  // R-004 / E-018 — resolve left-to-right, then set new operator
  const result = resolveOperation(
    state.accumulator,
    state.pendingOperator,
    new Decimal(state.entryBuffer),
  );

  if (typeof result === 'string') {
    // Error result (ErrorTag) — D-011: do NOT set new operator
    return {
      ...state,
      errorState: result,
      pendingOperator: null,
      entryBuffer: '0',
    };
  }

  // Successful resolve — chain with new operator
  return {
    ...state,
    accumulator: result,
    pendingOperator: op,
    entryBuffer: '0',
    justEvaluated: false,
  };
}

/**
 * Handles the Clear Entry (CE) button press.
 *
 * Rules applied:
 *   R-017 — CE resets only the current entry buffer, NOT the accumulator or pending operator.
 *   R-015 — CE escapes the error latch (clears errorState).
 *
 * Specifically:
 *   - Sets entryBuffer = '0'
 *   - Sets errorState = null (clears any error latch)
 *   - Sets justEvaluated = false
 *   - Leaves accumulator and pendingOperator INTACT
 *
 * This is NOT a full reset (C/AC) — it only clears the current entry and error.
 *
 * Never mutates state; always returns a new EngineState object.
 */
export function inputClearEntry(state: EngineState): EngineState {
  return {
    ...state,
    entryBuffer: '0',
    errorState: null,
    justEvaluated: false,
  };
}

/**
 * Handles the equals button press ('=').
 *
 * Rules applied (in order):
 *   R-014 / E-023  — error no-op: if errorState is set, return state unchanged.
 *   D-017 / E-022 / E-053 — equals-after-equals: if justEvaluated is true and
 *                    no pendingOperator is set, repeated '=' is a no-op (5-field
 *                    model: no lastOperator/lastRhs → no re-apply; just return unchanged).
 *   E-020 / R-006  — no pending operator, not evaluated: set justEvaluated = true
 *                    (display stays same — pressing '=' on a bare number is a no-op
 *                    apart from latching justEvaluated).
 *   Main path      — pendingOperator is set: resolve accumulator op entryBuffer.
 *                    On success: update entryBuffer + accumulator, clear pendingOperator,
 *                    set justEvaluated = true, clear errorState.
 *                    On error: set errorState, clear pendingOperator, justEvaluated = false.
 *
 * Never mutates state; always returns a new EngineState object.
 */
export function inputEquals(state: EngineState): EngineState {
  // R-014 / E-023 — error no-op
  if (state.errorState !== null) {
    return state;
  }

  if (state.pendingOperator === null) {
    // D-017 / E-022 / E-053 — equals-after-equals no-op (already evaluated)
    if (state.justEvaluated) {
      return state;
    }
    // E-020 / R-006 — no pending op, not yet evaluated: latch justEvaluated
    return { ...state, justEvaluated: true };
  }

  // Main path — resolve the pending operation
  // accumulator is guaranteed non-null when pendingOperator is set (inputOperator always
  // sets accumulator before setting pendingOperator).
  const right = new Decimal(state.entryBuffer);
  const result = resolveOperation(state.accumulator!, state.pendingOperator, right);

  if (typeof result === 'string') {
    // Error result — latch error, clear pending op, clear justEvaluated
    return {
      ...state,
      errorState: result,
      pendingOperator: null,
      justEvaluated: false,
    };
  }

  // Successful resolve
  const resultStr = result.toString();
  return {
    ...state,
    entryBuffer: resultStr,
    accumulator: result,
    pendingOperator: null,
    justEvaluated: true,
    errorState: null,
  };
}
