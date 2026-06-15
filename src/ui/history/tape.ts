// M3 History Tape — in-memory tape module (T-202..T-205)
// Spec: storm/specify/03-history-tape/01-data-model.md §2, §4, §5
// Tech: storm/specify/03-history-tape/06-tech-choices.md §3
//
// Module-private state: one ordered array (oldest-first, plain push — D-M3-DM-01) and
// a monotonic id counter (D-M3-DM-02). Neither is exported; consumers use the three
// exported functions below.
//
// nextId is intentionally NOT reset on clearTape() — an advancing counter avoids
// any stale-DOM-node id collision during the clear→append animation (data-model §4 note).

import type { HistoryEntry } from './types';

let tape: HistoryEntry[] = [];
let nextId = 0;

/**
 * Append a completed calculation to the tape (T-203, INT-M3-2).
 * Called by the dispatch listener in Group C with `{ expression, result }`.
 * Assigns the next monotonic id and pushes oldest-first (D-M3-DM-01).
 */
export function appendEntry(entry: Omit<HistoryEntry, 'id'>): void {
  tape.push({ ...entry, id: nextId++ });
}

/**
 * Empty the tape (T-204, HR-016).
 * Triggered by AC (all-clear) — see data-model §4.
 * nextId keeps advancing; see module header note.
 */
export function clearTape(): void {
  tape = [];
}

/**
 * Read-only accessor — returns the tape array as a readonly view (T-205).
 * Callers may iterate but must not mutate the array or its entries.
 * Ordering: oldest → newest (render layer decides which edge is "top").
 */
export function getTape(): readonly HistoryEntry[] {
  return tape;
}
