// M3 History Tape — dispatch listener (Group C, T-209..T-212)
//
// Spec: storm/specify/03-history-tape/06-tech-choices.md §2 (listener verbatim)
//       storm/specify/03-history-tape/01-data-model.md §3 (derivation contract)
//       storm/specify/03-history-tape/03-rules.md HR-001..HR-006
//
// This file ONLY exports recordOnEquals().
// Registration (subscribe(recordOnEquals)) happens once at startup in main.ts (Group D).

import type { EngineState } from '../../types';
import { getDisplayValue } from '../../engine';
import { OPERATOR_TO_GLYPH } from '../operator-map';
import { appendEntry } from './tape';
import { renderHistory } from './render-history';

/**
 * INT-M3-3 dispatch listener — records a HistoryEntry iff the equals genuinely resolved.
 * Registered once at startup via subscribe(recordOnEquals) in main.ts (Group D).
 */
export function recordOnEquals(prev: EngineState, next: EngineState): void {
  // INT-M3-1 predicate — the equals filter; no equals-detection needed (HR-001..005).
  // Excludes for free: repeated = (pendingOperator already null), error result, bare = (nothing pending).
  if (prev.pendingOperator !== null && next.errorState === null && next.justEvaluated === true) {
    // INT-M3-2 derivation (data-model §3): expression from prevState, result from nextState.
    // prev.accumulator! — non-null is GUARDED by the predicate: prev.pendingOperator !== null
    // implies accumulator was latched when the operator was pressed (briefing:78-80).
    const expression = `${prev.accumulator!.toString()} ${OPERATOR_TO_GLYPH[prev.pendingOperator]} ${prev.entryBuffer}`;
    const result = getDisplayValue(next) as string; // next is non-error by predicate → always a value string
    appendEntry({ expression, result });
    renderHistory();
  }
}
