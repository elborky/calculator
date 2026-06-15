# L1 Functional Smoke — M2 Calculator UI (User-Reality exercise)

Driver: Playwright MCP. App: http://localhost:4173/ (prod dist preview). Inline-orchestrator run (forked dispatch blocked by #FF-008; tier-purity caveat noted in review log).

## Flows exercised — ALL PASS
| Flow | Action | Result | Verdict |
|---|---|---|---|
| Load | fresh | readout "0", pending empty, role=status/aria-live=polite | PASS |
| Click happy-path | 1 2 + 3 = | pending "12 +" then result "15", pending clears | PASS |
| Keyboard happy-path | 1 2 + 3 Enter | "15" — identical to click (click≡keyboard convergence, INT-4) | PASS |
| Decimal-from-fresh | . | "0." | PASS |
| Operators | each ÷ × − + | pending line "<acc> <glyph>" with true-Unicode glyph | PASS |
| Error | 5 / 0 = | "Cannot divide by zero" (full sentence), display--error class, coral color | PASS |
| Error: text-not-color | — | conveyed by sentence text + color (UR-026) | PASS |
| Error: digit no-op | press 7 during error | stays "Cannot divide by zero" (M1 latch) | PASS |
| Error: escape | Esc | "0", error class cleared | PASS |
| Long number | 1 / 3 = | "0.333333333333333333333" (21 digits, full in DOM), font shrunk to 20px floor, overflow-x:scroll, not clipped (D-006) | PASS |
| Repeated equals | 3 + 4 = = | "7" stable, no crash/flicker (T-171 guard) | PASS |
| `/` key | divide via keyboard | preventDefault works (no Firefox quick-find); divide applied | PASS |
| Phone 360px | resize | no horizontal scroll, all 18 keys visible, min target 44px | PASS |

## Findings
- P3: /favicon.ico 404 (cosmetic, see L2-console.log).
- (Font + a11y findings are in L4/L7/L8 — not functional.)

Functional verdict: **PASS** — every flow behaves to spec; click≡keyboard convergence verified.
