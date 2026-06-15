// @vitest-environment jsdom
//
// M3 History Tape — Group H tests (T-232..T-238) + runtime smoke (T-242)
// Spec: storm/specify/03-history-tape/, storm/build/03-history-tape/T-FIX-216c-tests/context.md
//
// jsdom env is per-file — existing engine tests (src/engine.test.ts) keep node env.
// DOM must be set up BEFORE dynamic-importing render-history.ts (module-init queries).
//
// Module cache note: render-history.ts caches DOM element refs at module-init.
// vi.resetModules() is called before each describe that needs fresh refs so that
// a re-import after innerHTML reset gets a clean module, not the stale cached one.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initialState, inputDigit, inputOperator, inputEquals } from './engine';

// ---------------------------------------------------------------------------
// T-238 — tape.ts pure unit tests
// (tape.ts has no DOM dependency — can be imported statically)
// ---------------------------------------------------------------------------
import { appendEntry, clearTape, getTape } from './ui/history/tape';

describe('T-238 tape.ts — pure unit', () => {
  beforeEach(() => {
    // Reset tape state between tests by clearing
    clearTape();
  });

  it('appendEntry assigns monotonic ids (oldest-first)', () => {
    appendEntry({ expression: '1 + 1', result: '2' });
    appendEntry({ expression: '2 + 2', result: '4' });
    const tape = getTape();
    expect(tape.length).toBe(2);
    // Monotonic: second id > first id
    expect(tape[1].id).toBeGreaterThan(tape[0].id);
  });

  it('getTape returns entries in insertion (oldest-first) order', () => {
    appendEntry({ expression: '1 + 1', result: '2' });
    appendEntry({ expression: '3 + 4', result: '7' });
    const tape = getTape();
    expect(tape[0].expression).toBe('1 + 1');
    expect(tape[1].expression).toBe('3 + 4');
  });

  it('clearTape empties the tape', () => {
    appendEntry({ expression: '5 + 5', result: '10' });
    clearTape();
    expect(getTape().length).toBe(0);
  });

  it('nextId keeps advancing after clearTape (no id reuse)', () => {
    appendEntry({ expression: 'a', result: '1' });
    const idBefore = getTape()[0].id;
    clearTape();
    appendEntry({ expression: 'b', result: '2' });
    const idAfter = getTape()[0].id;
    expect(idAfter).toBeGreaterThan(idBefore);
  });
});

// ---------------------------------------------------------------------------
// Group H tests + T-242 runtime smoke
// These require the DOM skeleton (render-history.ts module-init queries it).
// We use dynamic import (after DOM setup) to control module-init ordering.
// ---------------------------------------------------------------------------

// The tape skeleton that render-history.ts needs at module-init
const TAPE_SKELETON = `
  <div class="history-slot" aria-hidden="true">
    <section class="history-tape" aria-label="Calculation history" data-empty="true">
      <div class="history-tape__header" aria-hidden="true">History</div>
      <div class="history-tape__scroll">
        <ul class="history-list" role="list"></ul>
      </div>
      <div class="history-empty">No calculations yet</div>
    </section>
  </div>
`;

describe('T-242 runtime smoke — module init does not throw', () => {
  it('render-history.ts initialises cleanly with skeleton present (proves T-216c fix)', async () => {
    vi.resetModules();
    document.body.innerHTML = TAPE_SKELETON;
    // Dynamic import AFTER DOM setup + module reset — module-init runs with fresh DOM.
    await expect(import('./ui/history/render-history')).resolves.toBeDefined();
  });
});

describe('Group H tests — T-232..T-237', () => {
  // Shared module refs loaded once after DOM setup
  let recordOnEquals: (prev: ReturnType<typeof initialState>, next: ReturnType<typeof initialState>) => void;
  let renderHistoryFn: () => void;

  beforeEach(async () => {
    // Reset module cache so render-history.ts re-runs its module-init with the new DOM
    vi.resetModules();
    // Fresh DOM skeleton for each test
    document.body.innerHTML = TAPE_SKELETON;

    // Reset tape state — re-import after resetModules to get fresh module instance
    const { clearTape: clear } = await import('./ui/history/tape');
    clear();

    // Dynamic import to ensure module-init sees the DOM
    const histMod = await import('./ui/history/history');
    recordOnEquals = histMod.recordOnEquals;

    const renderMod = await import('./ui/history/render-history');
    renderHistoryFn = renderMod.renderHistory;
  });

  // -------------------------------------------------------------------------
  // T-232 — genuine equals-resolve records ONE entry with correct expr+result
  // Drives real reducers: 12 + 3 =  → "12 + 3" = "15"
  // -------------------------------------------------------------------------
  it('T-232 — genuine equals-resolve records one entry', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    // Build prev state: 12 + 3 (operator just pressed, waiting for =)
    let prev = initialState();
    prev = inputDigit(prev, '1');
    prev = inputDigit(prev, '2');
    prev = inputOperator(prev, 'add');
    prev = inputDigit(prev, '3');
    // At this point: accumulator=12, pendingOperator='add', entryBuffer='3'

    // Build next state: result of pressing =
    const next = inputEquals(prev);
    // next.justEvaluated = true, next.errorState = null, next.accumulator=15 (resolved)

    // Verify the predicate will fire
    expect(prev.pendingOperator).toBe('add');
    expect(next.errorState).toBeNull();
    expect(next.justEvaluated).toBe(true);

    recordOnEquals(prev, next);

    const tape = getTape();
    expect(tape.length).toBe(1);
    expect(tape[0].expression).toBe('12 + 3');
    expect(tape[0].result).toBe('15');
  });

  // -------------------------------------------------------------------------
  // T-233 — repeated = (prev.pendingOperator null) → nothing recorded
  // -------------------------------------------------------------------------
  it('T-233 — repeated equals records nothing', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    // First press: 5 + 3 =  (legitimate)
    let state = initialState();
    state = inputDigit(state, '5');
    state = inputOperator(state, 'add');
    state = inputDigit(state, '3');
    const afterFirstEquals = inputEquals(state);

    // Second press: = again (pendingOperator is now null)
    const afterSecondEquals = inputEquals(afterFirstEquals);

    // The second call has prev=afterFirstEquals (pendingOperator=null) → predicate fails
    recordOnEquals(afterFirstEquals, afterSecondEquals);

    // Should not have added an entry (the first = was not called via recordOnEquals here)
    expect(getTape().length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // T-234 — error result (division by zero) → nothing recorded
  // -------------------------------------------------------------------------
  it('T-234 — error result records nothing', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    // 5 ÷ 0 = → errorState set
    let prev = initialState();
    prev = inputDigit(prev, '5');
    prev = inputOperator(prev, 'divide');
    prev = inputDigit(prev, '0');
    // prev: pendingOperator='divide', entryBuffer='0'

    const next = inputEquals(prev);
    // next.errorState should be 'divide-by-zero'
    expect(next.errorState).toBe('divide-by-zero');
    expect(prev.pendingOperator).toBe('divide');

    recordOnEquals(prev, next);

    expect(getTape().length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // T-235 — bare = (nothing pending, fresh state) → nothing recorded
  // -------------------------------------------------------------------------
  it('T-235 — bare equals (nothing pending) records nothing', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    const prev = initialState(); // pendingOperator = null
    const next = inputEquals(prev);

    recordOnEquals(prev, next);

    expect(getTape().length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // T-236 — chained calc: 12+3+4= records the final binary step "15 + 4 = 19"
  // INT-M3-4: the intermediate = is the one fired when user presses the second +
  // -------------------------------------------------------------------------
  it('T-236 — chained calc records the final binary step', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    // Simulate: 1 2 + 3 + 4 =
    // Step 1: user types 12 + 3 then presses + again
    // When second + is pressed, the engine resolves 12+3=15 first (prev→intermediate)
    let state = initialState();
    state = inputDigit(state, '1');
    state = inputDigit(state, '2');
    state = inputOperator(state, 'add');
    state = inputDigit(state, '3');

    const prevBeforeChain = state; // accumulator=12, pendingOp='add', entry='3'
    const afterChainOp = inputOperator(state, 'add'); // resolves 12+3→15, sets new pendingOp
    // afterChainOp: accumulator=15, pendingOp='add', justEvaluated=false

    // The INT-M3-1 predicate check: prevBeforeChain has pendingOperator, afterChainOp has no error
    // But afterChainOp.justEvaluated is false (pressing + doesn't set justEvaluated)
    // So the chain intermediate is NOT recorded by recordOnEquals when the second + is pressed.
    // The recording happens on the FINAL =.

    // Continue: type 4, press =
    let state2 = afterChainOp;
    state2 = inputDigit(state2, '4');
    const prevFinal = state2; // accumulator=15, pendingOp='add', entry='4'
    const nextFinal = inputEquals(prevFinal);

    expect(prevFinal.pendingOperator).toBe('add');
    expect(nextFinal.errorState).toBeNull();
    expect(nextFinal.justEvaluated).toBe(true);

    recordOnEquals(prevFinal, nextFinal);

    const tape = getTape();
    expect(tape.length).toBe(1);
    expect(tape[0].expression).toBe('15 + 4');
    expect(tape[0].result).toBe('19');
  });

  // -------------------------------------------------------------------------
  // T-237 — Unicode glyphs: −, ×, ÷ in expression (not ASCII hyphen)
  // -------------------------------------------------------------------------
  it('T-237 — subtract produces Unicode minus sign U+2212 in expression', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    let prev = initialState();
    prev = inputDigit(prev, '9');
    prev = inputOperator(prev, 'subtract');
    prev = inputDigit(prev, '3');
    const next = inputEquals(prev);

    recordOnEquals(prev, next);

    const tape = getTape();
    expect(tape.length).toBe(1);
    expect(tape[0].expression).toContain('−'); // U+2212 MINUS SIGN, not U+002D hyphen-minus
    expect(tape[0].expression).toBe('9 − 3');
    expect(tape[0].result).toBe('6');
  });

  it('T-237 — multiply produces Unicode multiplication sign U+00D7', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    let prev = initialState();
    prev = inputDigit(prev, '4');
    prev = inputOperator(prev, 'multiply');
    prev = inputDigit(prev, '5');
    const next = inputEquals(prev);

    recordOnEquals(prev, next);

    const tape = getTape();
    expect(tape[0].expression).toBe('4 × 5'); // U+00D7
    expect(tape[0].result).toBe('20');
  });

  it('T-237 — divide produces Unicode division sign U+00F7', async () => {
    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    let prev = initialState();
    prev = inputDigit(prev, '8');
    prev = inputOperator(prev, 'divide');
    prev = inputDigit(prev, '4');
    const next = inputEquals(prev);

    recordOnEquals(prev, next);

    const tape = getTape();
    expect(tape[0].expression).toBe('8 ÷ 4'); // U+00F7
    expect(tape[0].result).toBe('2');
  });

});

// ---------------------------------------------------------------------------
// T-242 extended — record + AC + re-render cycle
//
// Uses vi.resetModules() + innerHTML set ONCE before all imports, so
// render-history.ts module-init caches refs into the DOM that persists
// throughout all assertions in this test.
// ---------------------------------------------------------------------------
describe('T-242 extended — full record + clear cycle', () => {
  it('record shows <li>, then AC clears tape and sets data-empty="true"', async () => {
    // Reset module cache and set DOM once — render-history caches into this DOM
    vi.resetModules();
    document.body.innerHTML = TAPE_SKELETON;

    const { clearTape, getTape } = await import('./ui/history/tape');
    clearTape();

    const { recordOnEquals: rec } = await import('./ui/history/history');
    const { renderHistory } = await import('./ui/history/render-history');

    // Record one entry: 3 + 4 = 7
    let prev = initialState();
    prev = inputDigit(prev, '3');
    prev = inputOperator(prev, 'add');
    prev = inputDigit(prev, '4');
    const next = inputEquals(prev);

    rec(prev, next);

    // After record, an <li class="history-entry"> should appear in .history-list
    const listEl = document.querySelector('.history-list');
    expect(listEl).not.toBeNull();
    const entries = listEl!.querySelectorAll('.history-entry');
    expect(entries.length).toBe(1);

    // Tape populated — data-empty should be absent
    const tapeEl = document.querySelector('.history-tape');
    expect(tapeEl!.hasAttribute('data-empty')).toBe(false);

    // Simulate AC: clear tape + re-render
    clearTape();
    renderHistory();

    // After clear: data-empty="true" restored, list empty
    expect(tapeEl!.getAttribute('data-empty')).toBe('true');
    const entriesAfter = listEl!.querySelectorAll('.history-entry');
    expect(entriesAfter.length).toBe(0);

    // Tape array also empty
    expect(getTape().length).toBe(0);
  });
});
