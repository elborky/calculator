// M2 Calculator UI — held state + dispatch (Group 4, T-137..T-139)
//
// INT-1: M2 is the stateful host; M1 is the stateless reducer.
// ONE EngineState cell, replaced atomically on every input event — never mutated in place.
// render() is a placeholder stub (Group 6 fleshes it out, T-142..T-146).

import type { EngineState } from '../types';
import {
  initialState,
  inputDigit,
  inputDecimal,
  inputOperator,
  inputEquals,
  inputClearEntry,
  inputAllClear,
  getDisplayValue,
} from '../engine';

// Re-export the types and functions Group 5+ needs so they import from one place.
export type { EngineState };
export { inputDigit, inputDecimal, inputOperator, inputEquals, inputClearEntry, inputAllClear, getDisplayValue };

// ---------------------------------------------------------------------------
// T-138 — single held module-level state cell (D-M2-DM-01)
// Seeded with initialState() on load; every dispatch() replaces this reference.
// ---------------------------------------------------------------------------
let state: EngineState = initialState();

/** Read-only accessor — exposes held state to render / test without leaking a mutable ref. */
export function getState(): EngineState {
  return state;
}

// ---------------------------------------------------------------------------
// T-139 — dispatch(fn): replace-cell update + render hook (INT-1)
//
// Pattern:  state = fn(state)  →  render(state)
//
// fn is any M1 reducer already curried to its args, e.g.:
//   dispatch(s => inputDigit(s, '7'))
//   dispatch(inputEquals)
// ---------------------------------------------------------------------------
export function dispatch(fn: (s: EngineState) => EngineState): void {
  state = fn(state);
  render(state);
}

// ---------------------------------------------------------------------------
// render() — placeholder stub for Group 6 (T-142..T-146).
// Declared here so dispatch() has a valid target; Group 6 replaces this body.
// Exported so Group 6 can re-assign it OR import and use it as the real implementation.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function render(_state: EngineState): void {
  // Group 6 (T-142) writes the real implementation.
  // Stub intentionally empty — Group 4 is wiring-only (YAGNI).
}
