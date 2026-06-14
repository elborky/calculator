import Decimal from 'decimal.js';

// Configure Decimal.js ONCE — all engine code imports Decimal from THIS module,
// not directly from 'decimal.js', to guarantee this config is always applied.
//
// precision: 21   — 21 significant digits; sufficient for a consumer calculator
// rounding:  4    — ROUND_HALF_UP (standard "school math" rounding)
// toExpPos:  21   — numbers ≥ 10^21 display in exp notation (overflow boundary, R-012)
// toExpNeg: -7    — numbers < 10^-7 display in exp notation (standard LCD convention)
Decimal.set({
  precision: 21,
  rounding: Decimal.ROUND_HALF_UP,
  toExpPos: 21,
  toExpNeg: -7,
});

export { Decimal };
