import Decimal from 'decimal.js';

// Configure Decimal.js ONCE — all engine code imports Decimal from THIS module,
// not directly from 'decimal.js', to guarantee this config is always applied.
//
// precision: 21   — 21 significant digits; sufficient for a consumer calculator
// rounding:  4    — ROUND_HALF_UP (standard "school math" rounding)
// toExpPos:  21   — DISPLAY NOTATION only: numbers ≥ 10^21 render in exp form.
//                   This is NOT the overflow guard. Real overflow fires only when
//                   !result.isFinite() (resolveOperation line ~44), which triggers
//                   at Decimal.maxE (~9e+9000000000000000) — effectively unreachable
//                   for consumer calculator values. See D-013.
// toExpNeg: -7    — numbers < 10^-7 display in exp notation (standard LCD convention)
Decimal.set({
  precision: 21,
  rounding: Decimal.ROUND_HALF_UP,
  toExpPos: 21,
  toExpNeg: -7,
});

export { Decimal };
