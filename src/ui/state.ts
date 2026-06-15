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
// T-206 — INT-M3-3 recording seam: post-dispatch subscriber list (zero new deps, observe-not-intercept)
// Listeners receive (prev, next) after render(); M3 registers recordOnEquals via subscribe() at startup.
// ---------------------------------------------------------------------------
export type DispatchListener = (prev: EngineState, next: EngineState) => void;
const listeners: DispatchListener[] = [];

// T-207 — register an observer; called once at startup from history.ts (e.g. subscribe(recordOnEquals))
export function subscribe(fn: DispatchListener): void {
  listeners.push(fn);
}

// ---------------------------------------------------------------------------
// T-139 / T-208 — dispatch(fn): replace-cell update + render hook (INT-1)
//
// Pattern:  prev = state  →  state = fn(state)  →  render(state)  →  notify listeners
//
// fn is any M1 reducer already curried to its args, e.g.:
//   dispatch(s => inputDigit(s, '7'))
//   dispatch(inputEquals)
//
// T-208: capture prev BEFORE reassignment; render() unchanged + runs FIRST (C3); listeners AFTER.
// ---------------------------------------------------------------------------
export function dispatch(fn: (s: EngineState) => EngineState): void {
  const prev = state;            // capture before reassignment (T-208, INT-M3-3)
  state = fn(state);             // existing line — unchanged
  render(state);                 // existing line — unchanged, runs FIRST (C3)
  for (const l of listeners) {                 // additive: notify observers after render
    try {
      l(prev, state);
    } catch (err) {
      // Seam contract: "observe, never break M2" (06-tech-choices.md).
      // A throw in any listener must not propagate out of dispatch() and break the calculator.
      // Log so the error remains visible during dev; M2 render path is unaffected.
      console.error('[dispatch] listener threw; M2 dispatch unaffected:', err);
    }
  }
}

// ---------------------------------------------------------------------------
// render() is the real implementation from render.ts (Group 6, T-142).
// Re-exported here so other modules can import render from state.ts if needed.
export { render };
