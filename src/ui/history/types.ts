// M3 History Tape — HistoryEntry entity (T-201, D-M3-DM-02)
// Spec: storm/specify/03-history-tape/01-data-model.md §1
//
// Both strings are pre-formatted at capture time and stored display-ready.
// `id` is an internal monotonic render key — not user-visible, not persisted.

export interface HistoryEntry {
  /** Pre-formatted expression, e.g. "12 + 3". Built from prevState. Renders in --text-secondary. */
  expression: string;
  /** Pre-formatted result, e.g. "15". = getDisplayValue(nextState). Renders in --text-primary. */
  result: string;
  /** Stable identity for the render layer's keyed list + slide-in motion. NOT business data. */
  id: number;
}
