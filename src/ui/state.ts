// M2 Calculator UI — held state + dispatch (Group 4, T-137..T-139)
//
// INT-1: M2 is the stateful host; M1 is the stateless reducer.
// ONE EngineState cell, replaced atomically on every input event — never mutated in place.
// render() is imported from render.ts (Group 6, T-142..T-146) and called by dispatch().

import type { EngineState } from '../types';
import { render } from './render';
import {
  initialState,
  inputDigit,
  inputDecimal,
  inputOperator,
  inputEquals,
  inputClearEntry,
  inputAllClear,
} from '../engine';

// Re-export the types and reducers Group 5+ (bindings.ts) needs so they import from one place.
// (getDisplayValue is NOT re-exported — render.ts imports it directly from '../engine'.)
export type { EngineState };
export { inputDigit, inputDecimal, inputOperator, inputEquals, inputClearEntry, inputAllClear };

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
// render() is the real implementation from render.ts (Group 6, T-142).
// Re-exported here so other modules can import render from state.ts if needed.
export { render };
