import { describe, it, expect } from 'vitest';
import { initialState } from './engine';

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
