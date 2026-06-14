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
