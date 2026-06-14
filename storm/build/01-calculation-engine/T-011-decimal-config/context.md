---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-011
storm-canonical: false
---

# T-011 — decimal-config.ts context

## Chosen overflow bound values

| Config key | Value | Rationale |
|---|---|---|
| `precision` | `21` | Sufficient for a consumer calculator; matches spec R-012 intent. 21 significant digits exceeds any realistic user input. |
| `rounding` | `Decimal.ROUND_HALF_UP` | Standard "school math" rounding; spec mandates ROUND_HALF_UP explicitly. |
| `toExpPos` | `21` | Numbers ≥ 10^21 are displayed in exponential notation. A consumer calculator will never legitimately reach this — treating it as the overflow boundary aligns with the `errorState: 'overflow'` trigger in R-012. |
| `toExpNeg` | `-7` | Numbers with absolute value < 10^-7 (i.e., more than 7 decimal places toward zero) switch to exp notation. Mirrors the display convention of physical calculators (e.g., 0.0000001 → 1e-7). |

## Decision rationale

- `toExpPos: 21` matches `precision: 21` — once a result requires more than 21 digits before the decimal point, it is in exp-notation territory and the engine will classify it as overflow via the overflow-check in T-017+.
- `toExpNeg: -7` is the standard consumer calculator threshold (7 decimal places is typical LCD display width).
- Both values are BUILD-owned per spec instruction: "BUILD owns the concrete values for toExpPos/toExpNeg — spec says the KNOB must be present, not the specific numbers."
- All future engine code imports `Decimal` from `'./decimal-config'` to guarantee config is always applied.
