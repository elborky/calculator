import { describe, it, expect } from 'vitest';
import { initialState, inputDigit } from './engine';
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
});
