import { Decimal } from 'decimal.js';

export type Operator = 'add' | 'subtract' | 'multiply' | 'divide';

export type ErrorTag = 'divide-by-zero' | 'overflow';

export interface EngineState {
  /** The number the user is currently typing, held as a string for entry validation. */
  entryBuffer: string;
  /** Stored left-hand operand after first operator is pressed; null when nothing stored. */
  accumulator: Decimal | null;
  /** Operator waiting to be applied; null when no operation is pending. */
  pendingOperator: Operator | null;
  /** True immediately after equals resolves; next digit starts a fresh number. */
  justEvaluated: boolean;
  /** null when healthy; set to an ErrorTag on divide-by-zero or overflow. */
  errorState: ErrorTag | null;
}
