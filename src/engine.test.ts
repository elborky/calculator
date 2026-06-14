import { describe, it, expect } from 'vitest';
import { initialState } from './engine';
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
