import { describe, it, expect } from 'vitest';
import { initialState, inputDigit, inputDecimal, inputOperator, inputEquals, inputClearEntry, inputAllClear, resolveOperation, getDisplayValue } from './engine';
import { Decimal } from './decimal-config';

describe('initialState', () => {
  it('initialState returns correct defaults', () => {
    const state = initialState();

    expect(state.entryBuffer).toBe('0');
    expect(state.accumulator).toBeNull();
    expect(state.pendingOperator).toBeNull();
    expect(state.justEvaluated).toBe(false);
    expect(state.errorState).toBeNull();
  });
});

describe('decimal-config correctness', () => {
  it('0.1 + 0.2 equals 0.3 (E-045 — IEEE-754 artifact eliminated)', () => {
    expect(new Decimal('0.1').plus('0.2').toString()).toBe('0.3');
  });
});

describe('inputDigit', () => {
  it('appends digit normally — leading-zero replacement then sequential append (T-014)', () => {
    const state0 = initialState(); // entryBuffer = '0'

    // First digit: '0' replaced by '5' (leading-zero replacement, R-025/E-037)
    const state1 = inputDigit(state0, '5');
    expect(state1.entryBuffer).toBe('5');

    // Second digit: appended normally → '53'
    const state2 = inputDigit(state1, '3');
    expect(state2.entryBuffer).toBe('53');
  });

  it('leading-zero replacement — non-zero digit replaces "0", not appends (R-025, E-037) (T-015)', () => {
    // Buffer starts at '0' (initial state)
    const state = inputDigit(initialState(), '7');
    // Must be '7', not '07'
    expect(state.entryBuffer).toBe('7');
  });

  it('double-zero stays "0" — pressing 0 when buffer is "0" keeps "0" (E-037) (T-016)', () => {
    // Buffer starts at '0' (initial state); pressing '0' must not produce '00'
    const state = inputDigit(initialState(), '0');
    expect(state.entryBuffer).toBe('0');
  });

  it('fresh start after justEvaluated — digit replaces prior result, flag cleared (E-038) (T-017)', () => {
    // Simulate post-equals state: result '42' displayed, justEvaluated flagged
    const postEquals = { ...initialState(), entryBuffer: '42', justEvaluated: true };

    const state = inputDigit(postEquals, '9');

    // Must start fresh — '9', not '429'
    expect(state.entryBuffer).toBe('9');
    // Flag must be cleared
    expect(state.justEvaluated).toBe(false);
  });

  it('no-op in error state — inputDigit returns state unchanged (E-040, R-014) (T-018)', () => {
    // Simulate error state (e.g., divide-by-zero)
    const errorState = { ...initialState(), entryBuffer: 'Error', errorState: 'divide-by-zero' as const };

    const state = inputDigit(errorState, '5');

    // State must be completely unchanged
    expect(state.entryBuffer).toBe('Error');
    expect(state.errorState).toBe('divide-by-zero');
  });
});

describe('inputDecimal', () => {
  it('appends decimal to buffer (E-011 happy path) (T-020)', () => {
    // Fresh state has entryBuffer: '0'; pressing decimal produces '0.'
    const state = inputDecimal(initialState());
    expect(state.entryBuffer).toBe('0.');
  });

  it('second decimal press is no-op (E-009, E-010) (T-021)', () => {
    // Buffer already contains a decimal; pressing decimal again must not append
    const withDecimal = { ...initialState(), entryBuffer: '3.' };
    const state = inputDecimal(withDecimal);
    expect(state.entryBuffer).toBe('3.');
  });

  it('fresh "0." after justEvaluated, flag cleared (E-013) (T-022)', () => {
    // Post-equals state: result '42' displayed, justEvaluated flagged
    const postEquals = { ...initialState(), entryBuffer: '42', justEvaluated: true };
    const state = inputDecimal(postEquals);
    // Must start fresh with '0.', not append to '42'
    expect(state.entryBuffer).toBe('0.');
    // Flag must be cleared
    expect(state.justEvaluated).toBe(false);
  });

  it('no-op in error state (E-014) (T-023)', () => {
    // Error state: divide-by-zero; decimal press must not change anything
    const errorState = { ...initialState(), entryBuffer: 'Error', errorState: 'divide-by-zero' as const };
    const state = inputDecimal(errorState);
    // State must be completely unchanged
    expect(state.entryBuffer).toBe('Error');
    expect(state.errorState).toBe('divide-by-zero');
  });

  it('leading decimal entry-point from initialState produces "0." (E-011) (T-024)', () => {
    // E-011: pressing decimal as the very first input (leading decimal)
    // initialState() guarantees entryBuffer: '0' — the canonical entry-point scenario
    const fresh = initialState();
    expect(fresh.entryBuffer).toBe('0'); // pre-condition: entry-point confirmed
    const state = inputDecimal(fresh);
    // Leading decimal must produce '0.' — never bare '.'
    expect(state.entryBuffer).toBe('0.');
  });
});

describe('inputOperator', () => {
  it('first op commits entryBuffer to accumulator, sets pendingOperator, resets buffer (T-033)', () => {
    // Sequence: initialState → digit '5' → operator 'add'
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'add');

    // Buffer committed to accumulator
    expect(s2.accumulator!.toString()).toBe('5');
    // Pending operator set
    expect(s2.pendingOperator).toBe('add');
    // Entry buffer reset
    expect(s2.entryBuffer).toBe('0');
  });

  it('no-op in error state — state unchanged, pendingOperator stays null — E-019 (T-039)', () => {
    // Construct state with errorState set
    const errorState = { ...initialState(), errorState: 'divide-by-zero' as const };

    const result = inputOperator(errorState, 'add');

    // Must be completely unchanged (same reference or identical fields)
    expect(result.errorState).toBe('divide-by-zero');
    expect(result.pendingOperator).toBeNull();
    // Confirm it returned the same object (no-op returns state unchanged)
    expect(result).toBe(errorState);
  });

  it('chaining div-by-zero sets error, new op NOT registered — D-011, E-002 (T-038)', () => {
    // Sequence: digit '5' → op 'divide' → decimal → digit '0' → op 'add'
    // The right operand is '0.' (numerically 0) — uses inputDecimal to bypass
    // the operator-swap guard (which checks entryBuffer === '0' exactly).
    // Pressing 'add' auto-resolves 5÷0. → error; 'add' must NOT be registered.
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'divide');
    const s3 = inputDecimal(s2); // buffer: '0.'  — bypasses swap guard
    const s4 = inputDigit(s3, '0'); // buffer: '0.0' — still zero
    const s5 = inputOperator(s4, 'add'); // triggers 5÷0.0 resolve → error

    expect(s5.errorState).toBe('divide-by-zero');
    expect(s5.pendingOperator).toBeNull(); // D-011: new op NOT set
  });

  it('chaining auto-resolves LTR: 3 + 5 × → accumulator=8, pendingOp=multiply — E-018, R-004 (T-037)', () => {
    // Sequence: digit '3' → op 'add' → digit '5' → op 'multiply'
    // Pressing 'multiply' auto-resolves 3+5=8 first
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'add');
    const s3 = inputDigit(s2, '5');
    const s4 = inputOperator(s3, 'multiply'); // triggers LTR resolve

    expect(s4.accumulator!.toString()).toBe('8');
    expect(s4.pendingOperator).toBe('multiply');
    expect(s4.entryBuffer).toBe('0');
    expect(s4.errorState).toBeNull();
  });

  it('operator-swap different op — pendingOperator changes, no resolve, no error — E-017 (T-036)', () => {
    // Sequence: digit '3' → op 'add' → op 'multiply' (no right operand)
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'add');      // commits '3', sets 'add'
    const s3 = inputOperator(s2, 'multiply'); // swap to 'multiply', no resolve

    expect(s3.pendingOperator).toBe('multiply');
    expect(s3.accumulator!.toString()).toBe('3');
    expect(s3.errorState).toBeNull();
  });

  it('operator-swap same op — no resolve, pendingOperator stays same, no error — E-016 (T-035)', () => {
    // Sequence: digit '3' → op 'add' → op 'add' (same, no right operand)
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'add');   // first 'add': commits '3' to accumulator
    const s3 = inputOperator(s2, 'add');   // second 'add': swap same op, no resolve

    expect(s3.pendingOperator).toBe('add');
    expect(s3.accumulator!.toString()).toBe('3');
    expect(s3.errorState).toBeNull();
  });

  it('operator-first uses implicit 0 as left operand — E-015, D-010 (T-034)', () => {
    // Sequence: initialState() (entryBuffer='0') → operator 'add'
    const s0 = initialState();
    const s1 = inputOperator(s0, 'add');

    // Implicit 0 committed to accumulator
    expect(s1.accumulator!.toString()).toBe('0');
    // Pending operator set
    expect(s1.pendingOperator).toBe('add');
    // Entry buffer reset
    expect(s1.entryBuffer).toBe('0');
  });
});

describe('resolveOperation', () => {
  it('addition is exact — 1.1 + 2.2 = 3.3 (no IEEE-754 artifact) (T-026)', () => {
    const result = resolveOperation(new Decimal('1.1'), 'add', new Decimal('2.2'));
    expect(result).toBeInstanceOf(Decimal);
    expect((result as Decimal).toString()).toBe('3.3');
  });

  it('subtraction correct — 10 - 4 = 6 (T-027)', () => {
    const result = resolveOperation(new Decimal('10'), 'subtract', new Decimal('4'));
    expect(result).toBeInstanceOf(Decimal);
    expect((result as Decimal).toString()).toBe('6');
  });

  it('multiplication correct — 3 × 7 = 21 (T-028)', () => {
    const result = resolveOperation(new Decimal('3'), 'multiply', new Decimal('7'));
    expect(result).toBeInstanceOf(Decimal);
    expect((result as Decimal).toString()).toBe('21');
  });

  it('division correct — 10 ÷ 4 = 2.5 exact (T-029)', () => {
    const result = resolveOperation(new Decimal('10'), 'divide', new Decimal('4'));
    expect(result).toBeInstanceOf(Decimal);
    expect((result as Decimal).toString()).toBe('2.5');
  });

  it('divide by zero returns string "divide-by-zero" — not Infinity, not NaN (E-001, R-010) (T-030)', () => {
    const result = resolveOperation(new Decimal('5'), 'divide', new Decimal('0'));
    expect(result).toBe('divide-by-zero');
  });

  it('"0.0" decimal form as divisor is treated as zero — div-by-zero guard fires (E-003) (T-031)', () => {
    // Confirm pre-condition: decimal.js isZero() returns true for '0.0'
    expect(new Decimal('0.0').isZero()).toBe(true);
    // Guard must fire exactly as for integer '0'
    const result = resolveOperation(new Decimal('9'), 'divide', new Decimal('0.0'));
    expect(result).toBe('divide-by-zero');
  });
});

describe('inputEquals', () => {
  it('normal resolve — 5 × 4 = 20 (T-041)', () => {
    // Sequence: digit '5' → op 'multiply' → digit '4' → equals
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'multiply');
    const s3 = inputDigit(s2, '4');
    const s4 = inputEquals(s3);

    expect(s4.entryBuffer).toBe('20');
    expect(s4.pendingOperator).toBeNull();
    expect(s4.justEvaluated).toBe(true);
    expect(s4.errorState).toBeNull();
  });

  it('no pending operator — equals latches justEvaluated, buffer unchanged (E-020, R-006) (T-042)', () => {
    // initialState() has no pendingOperator — pressing equals is a no-op except latching flag
    const s0 = initialState();
    const s1 = inputEquals(s0);

    expect(s1.justEvaluated).toBe(true);
    expect(s1.entryBuffer).toBe('0');
    expect(s1.pendingOperator).toBeNull();
    expect(s1.errorState).toBeNull();
  });

  it('fresh state equals gives 0 — not an error, not a blank (E-021) (T-043)', () => {
    // initialState() → equals: result displayed is '0', not error, justEvaluated set
    const s0 = initialState();
    const s1 = inputEquals(s0);

    expect(s1.entryBuffer).toBe('0');
    expect(s1.justEvaluated).toBe(true);
    expect(s1.errorState).toBeNull();
  });

  it('negative result — 3 - 5 = -2, no error (E-041, R-021) (T-044)', () => {
    // Sequence: digit '3' → op 'subtract' → digit '5' → equals
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'subtract');
    const s3 = inputDigit(s2, '5');
    const s4 = inputEquals(s3);

    expect(s4.entryBuffer).toBe('-2');
    expect(s4.justEvaluated).toBe(true);
    expect(s4.errorState).toBeNull();
  });

  it('divide by zero sets errorState (E-001, R-010) (T-045)', () => {
    // Sequence: digit '5' → op 'divide' → equals
    // After pressing 'divide', entryBuffer resets to '0'.
    // Pressing equals resolves 5 ÷ 0 → divide-by-zero error.
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'divide');
    // s2.entryBuffer === '0' (right operand is zero — no further input needed)
    const s3 = inputEquals(s2);

    expect(s3.errorState).toBe('divide-by-zero');
  });

  it('no-op in error state — inputEquals returns state unchanged (E-023) (T-046)', () => {
    // Construct state with errorState set
    const errorState = { ...initialState(), errorState: 'divide-by-zero' as const };

    const result = inputEquals(errorState);

    // Must return the same object reference (guard returns state unchanged)
    expect(result).toBe(errorState);
    expect(result.errorState).toBe('divide-by-zero');
  });

  it('zero result is not an error — 5 - 5 = 0, errorState null (E-024, E-039) (T-047)', () => {
    // Sequence: digit '5' → op 'subtract' → digit '5' → equals → result 0
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'subtract');
    const s3 = inputDigit(s2, '5');
    const s4 = inputEquals(s3);

    // Zero is a valid result — NOT an error
    expect(s4.errorState).toBeNull();
    expect(s4.entryBuffer).toBe('0');
    expect(s4.justEvaluated).toBe(true);
  });

  it('equals after equals is no-op — 3+4==→7 (E-022/E-053, D-017) (T-050)', () => {
    // Sequence: digit '3' → op 'add' → digit '4' → equals (result 7) → equals AGAIN
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'add');
    const s3 = inputDigit(s2, '4');
    const s4 = inputEquals(s3); // first equals: result 7, justEvaluated=true

    expect(s4.entryBuffer).toBe('7');
    expect(s4.justEvaluated).toBe(true);

    const s5 = inputEquals(s4); // second equals: must be a no-op

    // D-017: 5-field model has no lastOperator/lastRhs — repeated equals returns state unchanged
    expect(s5).toBe(s4); // same reference — guard returns state directly
    expect(s5.entryBuffer).toBe('7');
    expect(s5.justEvaluated).toBe(true);
    expect(s5.errorState).toBeNull();
  });

  it('multiple repeated equals remain no-op — 3+4===→7 (D-017) (T-051)', () => {
    // Sequence: digit '3' → op 'add' → digit '4' → equals (result 7) → equals × 3
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'add');
    const s3 = inputDigit(s2, '4');
    const s4 = inputEquals(s3); // first equals: result 7, justEvaluated=true

    const s5 = inputEquals(s4); // 2nd equals — no-op
    const s6 = inputEquals(s5); // 3rd equals — no-op
    const s7 = inputEquals(s6); // 4th equals — no-op

    // D-017: no-op is durable — every extra equals press returns state unchanged
    expect(s7.entryBuffer).toBe('7');
    expect(s7.justEvaluated).toBe(true);
    expect(s7.errorState).toBeNull();
    // Each repeated press must return same reference (guard fires each time)
    expect(s5).toBe(s4);
    expect(s6).toBe(s5);
    expect(s7).toBe(s6);
  });
});

describe('inputClearEntry', () => {
  it('resets buffer, preserves pending operator (E-029) (T-053)', () => {
    // Sequence: digit '5' → op 'add' → digit '3' → CE
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'add');
    const s3 = inputDigit(s2, '3');
    const s4 = inputClearEntry(s3);

    // CE resets the entry buffer only
    expect(s4.entryBuffer).toBe('0');
    expect(s4.errorState).toBeNull();
    // accumulator and pendingOperator must be preserved
    expect(s4.accumulator!.toString()).toBe('5');
    expect(s4.pendingOperator).toBe('add');
  });

  it('escapes error latch — errorState cleared after CE (E-032, R-015) (T-054)', () => {
    // Construct a state with errorState set (e.g. via divide-by-zero)
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'divide');
    const s3 = inputDigit(s2, '0');
    const s4 = inputEquals(s3); // errorState = 'divide-by-zero'

    expect(s4.errorState).toBe('divide-by-zero'); // confirm error is latched

    const s5 = inputClearEntry(s4);
    expect(s5.errorState).toBeNull(); // CE clears the error latch
    expect(s5.entryBuffer).toBe('0');
  });

  it('from mid-first-operand, accumulator stays null (E-028) (T-055)', () => {
    // Sequence: initialState() → digit '7' → CE (no operator pressed)
    const s0 = initialState();
    const s1 = inputDigit(s0, '7');
    const s2 = inputClearEntry(s1);

    expect(s2.entryBuffer).toBe('0');
    expect(s2.accumulator).toBeNull(); // accumulator was never set, CE must not change it
    expect(s2.pendingOperator).toBeNull();
  });

  it('CE then equals uses 0 as right operand — 5 + 0 = 5 (E-058) (T-056)', () => {
    // Sequence: digit '5' → op 'add' → digit '3' → CE → equals
    // CE resets entryBuffer to '0', so equals resolves: 5 + 0 = 5
    const s0 = initialState();
    const s1 = inputDigit(s0, '5');
    const s2 = inputOperator(s1, 'add');
    const s3 = inputDigit(s2, '3');
    const s4 = inputClearEntry(s3); // CE — buffer back to '0'
    const s5 = inputEquals(s4);     // equals — resolves 5 + 0 = 5

    expect(s5.entryBuffer).toBe('5');
    expect(s5.justEvaluated).toBe(true);
    expect(s5.errorState).toBeNull();
  });
});

describe('inputAllClear', () => {
  it('full reset from mid-expression — all 5 fields at initial values (E-033) (T-058)', () => {
    // Sequence: digit '9' → op 'multiply' → digit '3' → AC
    const s1 = inputDigit(initialState(), '9');
    const s2 = inputOperator(s1, 'multiply');
    const s3 = inputDigit(s2, '3');
    const s4 = inputAllClear(s3);

    expect(s4.entryBuffer).toBe('0');
    expect(s4.accumulator).toBeNull();
    expect(s4.pendingOperator).toBeNull();
    expect(s4.justEvaluated).toBe(false);
    expect(s4.errorState).toBeNull();
  });

  it('no residual after AC — fresh calculation 2+3=5 succeeds cleanly (E-059) (T-060)', () => {
    // Build some dirty mid-expression state, then AC
    const s0 = inputDigit(initialState(), '9');
    const s1 = inputOperator(s0, 'multiply');
    const s2 = inputDigit(s1, '7');
    const s3 = inputAllClear(s2);

    // Now perform a fresh calculation from AC-clean state
    const s4 = inputDigit(s3, '2');
    const s5 = inputOperator(s4, 'add');
    const s6 = inputDigit(s5, '3');
    const s7 = inputEquals(s6);

    expect(s7.entryBuffer).toBe('5');
    expect(s7.justEvaluated).toBe(true);
    expect(s7.errorState).toBeNull();
  });

  it('escapes error latch — AC clears overflow errorState, all fields reset (E-034, R-015) (T-059)', () => {
    // Construct a dirty state with errorState: 'overflow'
    const dirtyState = {
      entryBuffer: '9999',
      accumulator: new Decimal('1e100'),
      pendingOperator: 'multiply' as const,
      justEvaluated: true,
      errorState: 'overflow' as const,
    };
    const s = inputAllClear(dirtyState);

    expect(s.entryBuffer).toBe('0');
    expect(s.accumulator).toBeNull();
    expect(s.pendingOperator).toBeNull();
    expect(s.justEvaluated).toBe(false);
    expect(s.errorState).toBeNull();
  });
});

describe('getDisplayValue — normal states', () => {
  it('returns entryBuffer in normal states (T-062)', () => {
    // Scenario 1: initialState → '0'
    const s0 = initialState();
    expect(getDisplayValue(s0)).toBe('0');

    // Scenario 2: after digit '7' pressed → '7'
    const s1 = inputDigit(initialState(), '7');
    expect(getDisplayValue(s1)).toBe('7');

    // Scenario 3: after 3 + 4 = → '7' (result now in entryBuffer)
    const s2a = inputDigit(initialState(), '3');
    const s2b = inputOperator(s2a, 'add');
    const s2c = inputDigit(s2b, '4');
    const s2d = inputEquals(s2c);
    expect(getDisplayValue(s2d)).toBe('7');
  });
});

describe('decimal.js correctness via engine — Group 12 (E-045–E-049)', () => {
  it('0.1 + 0.2 - 0.3 = 0 exactly — no floating point residual (E-049) (T-068)', () => {
    // Step 1: 0.1 + 0.2 = 0.3
    const s0 = initialState();
    const s1 = inputDigit(s0, '0');
    const s2 = inputDecimal(s1);
    const s3 = inputDigit(s2, '1');
    const s4 = inputOperator(s3, 'add');
    const s5 = inputDigit(s4, '0');
    const s6 = inputDecimal(s5);
    const s7 = inputDigit(s6, '2');
    const s8 = inputEquals(s7); // s8.entryBuffer === '0.3'
    // Step 2: subtract 0.3
    const s9 = inputOperator(s8, 'subtract');
    const s10 = inputDigit(s9, '0');
    const s11 = inputDecimal(s10);
    const s12 = inputDigit(s11, '3');
    const s13 = inputEquals(s12);
    expect(s13.entryBuffer).toBe('0');
    expect(s13.errorState).toBeNull();
  });

  it('1 ÷ 3 is finite, no error — repeating decimal truncated to precision (E-048) (T-067)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '1');
    const s2 = inputOperator(s1, 'divide');
    const s3 = inputDigit(s2, '3');
    const s4 = inputEquals(s3);
    expect(s4.errorState).toBeNull();
    expect(typeof s4.entryBuffer).toBe('string');
    expect(s4.entryBuffer.length).toBeGreaterThan(0);
  });

  it('0.1 × 0.2 = 0.02 via engine (E-047) (T-066)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '0');
    const s2 = inputDecimal(s1);
    const s3 = inputDigit(s2, '1');
    const s4 = inputOperator(s3, 'multiply');
    const s5 = inputDigit(s4, '0');
    const s6 = inputDecimal(s5);
    const s7 = inputDigit(s6, '2');
    const s8 = inputEquals(s7);
    expect(s8.entryBuffer).toBe('0.02');
    expect(s8.errorState).toBeNull();
  });

  it('0.3 - 0.2 = 0.1 via engine (E-046) (T-065)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '0');
    const s2 = inputDecimal(s1);
    const s3 = inputDigit(s2, '3');
    const s4 = inputOperator(s3, 'subtract');
    const s5 = inputDigit(s4, '0');
    const s6 = inputDecimal(s5);
    const s7 = inputDigit(s6, '2');
    const s8 = inputEquals(s7);
    expect(s8.entryBuffer).toBe('0.1');
    expect(s8.errorState).toBeNull();
  });

  it('0.1 + 0.2 = 0.3 via full engine sequence (E-045) (T-064)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '0');
    const s2 = inputDecimal(s1);
    const s3 = inputDigit(s2, '1');
    const s4 = inputOperator(s3, 'add');
    const s5 = inputDigit(s4, '0');
    const s6 = inputDecimal(s5);
    const s7 = inputDigit(s6, '2');
    const s8 = inputEquals(s7);
    expect(s8.entryBuffer).toBe('0.3');
    expect(s8.errorState).toBeNull();
  });
});

describe('chaining and multi-operator — Group 13 (E-025–E-027)', () => {
  it('10 ÷ 2 + 3 = 8 — mixed operators left-to-right (E-027) (T-071)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '1');
    const s2 = inputDigit(s1, '0');
    const s3 = inputOperator(s2, 'divide');
    const s4 = inputDigit(s3, '2');
    const s5 = inputOperator(s4, 'add'); // auto-resolves 10÷2=5
    const s6 = inputDigit(s5, '3');
    const s7 = inputEquals(s6); // 5+3=8
    expect(s7.entryBuffer).toBe('8');
    expect(s7.errorState).toBeNull();
  });

  it('1 + 1 + 1 + 1 = 4 — long same-op chain (E-026) (T-070)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '1');
    const s2 = inputOperator(s1, 'add');
    const s3 = inputDigit(s2, '1');
    const s4 = inputOperator(s3, 'add'); // auto-resolves 1+1=2
    const s5 = inputDigit(s4, '1');
    const s6 = inputOperator(s5, 'add'); // auto-resolves 2+1=3
    const s7 = inputDigit(s6, '1');
    const s8 = inputEquals(s7); // 3+1=4
    expect(s8.entryBuffer).toBe('4');
    expect(s8.errorState).toBeNull();
  });

  it('2 + 3 × 4 = 20 left-to-right, no operator precedence (E-025, R-004) (T-069)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '2');
    const s2 = inputOperator(s1, 'add');
    const s3 = inputDigit(s2, '3');
    // pressing multiply auto-resolves 2+3=5, then sets pending op to multiply
    const s4 = inputOperator(s3, 'multiply');
    const s5 = inputDigit(s4, '4');
    const s6 = inputEquals(s5);
    expect(s6.entryBuffer).toBe('20');
    expect(s6.errorState).toBeNull();
  });
});

describe('negatives — Group 14 (E-041–E-044)', () => {
  it('1 - 1 - 1 = -1 — subtraction through zero (E-043) (T-074)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '1');
    const s2 = inputOperator(s1, 'subtract');
    const s3 = inputDigit(s2, '1');
    const s4 = inputOperator(s3, 'subtract'); // auto-resolves 1-1=0
    const s5 = inputDigit(s4, '1');
    const s6 = inputEquals(s5); // 0-1=-1
    expect(s6.entryBuffer).toBe('-1');
    expect(s6.errorState).toBeNull();
  });

  it('negative as left operand in next chain: 3-5=-2, then -2+10=8 (E-042) (T-073)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'subtract');
    const s3 = inputDigit(s2, '5');
    const s4 = inputEquals(s3); // s4.entryBuffer === '-2', justEvaluated true
    const s5 = inputOperator(s4, 'add');
    const s6 = inputDigit(s5, '1');
    const s7 = inputDigit(s6, '0');
    const s8 = inputEquals(s7); // -2 + 10 = 8
    expect(s8.entryBuffer).toBe('8');
    expect(s8.errorState).toBeNull();
  });

  it('3 - 5 = -2 — negative result (E-041) (T-072)', () => {
    const s0 = initialState();
    const s1 = inputDigit(s0, '3');
    const s2 = inputOperator(s1, 'subtract');
    const s3 = inputDigit(s2, '5');
    const s4 = inputEquals(s3);
    expect(s4.entryBuffer).toBe('-2');
    expect(s4.errorState).toBeNull();
  });
});

describe('getDisplayValue — error states', () => {
  it('returns errorState tag when error is set (T-063)', () => {
    // Scenario 1: divide-by-zero error state
    const divByZeroState = {
      ...initialState(),
      errorState: 'divide-by-zero' as const,
    };
    expect(getDisplayValue(divByZeroState)).toBe('divide-by-zero');

    // Scenario 2: overflow error state
    const overflowState = {
      ...initialState(),
      errorState: 'overflow' as const,
    };
    expect(getDisplayValue(overflowState)).toBe('overflow');
  });
});

describe('overflow — Group 15 (E-006–E-008)', () => {
  it('overflow on result exceeding configured bound sets errorState (E-006) (T-075)', () => {
    // Construct state with accumulator near Decimal.maxE (9e+9000000000000000)
    // 9e+9000000000000000 × 10 exceeds maxE → decimal.js returns Infinity → 'overflow'
    const state = {
      ...initialState(),
      accumulator: new Decimal('9e+9000000000000000'),
      pendingOperator: 'multiply' as const,
      entryBuffer: '10',
    };
    const result = inputEquals(state);
    expect(result.errorState).toBe('overflow');
  });
});
