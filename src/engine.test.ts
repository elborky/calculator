import { describe, it, expect } from 'vitest';
import { initialState, inputDigit, inputDecimal, inputOperator, resolveOperation } from './engine';
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
