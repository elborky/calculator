---
generated: 2026-06-15
layer: L1-refix
fix-commit: pending (see commit hash in finding resolution)
---

# FIX 1 Refix Verification — Scroll-Bound P1 (HE-016 / US-M3-4 / US-M3-8)

## Fix applied
`src/ui/history/history.css` — added `max-height: calc(100vh - 100px)` to `.history-slot`
(desktop, base rule — not inside the mobile `@media (max-width:640px)` block).

## Verification results (Playwright, real Chromium, localhost:4174)

### 30-entry case (overflow must occur in panel, not body)
| Metric | Before fix (L1 finding) | After fix |
|---|---|---|
| itemCount | 30 | 30 |
| scrollEl.scrollHeight | 1213 | 1213 |
| scrollEl.clientHeight | 1213 (= scrollHeight, no overflow) | 509 |
| scrollEl overflows internally | ❌ false | ✅ true |
| body.scrollHeight > body.clientHeight | ❌ true (302px overflow) | ✅ false (647=647) |
| tabindex on scroll container | ❌ null (never fired) | ✅ "0" |
| aria-label on scroll container | ❌ null | ✅ "Calculation history, scroll to see all entries" |

### 3-entry case (non-overflow — must NOT have permanent tab-stop)
| Metric | Result |
|---|---|
| itemCount | 3 |
| scrollEl.scrollHeight === scrollEl.clientHeight | true (509=509, no overflow) |
| tabindex | ✅ null (not focusable) |
| aria-label | ✅ null |
| data-empty on tape | null (populated state correct) |

### Empty state (after AC)
| Metric | Result |
|---|---|
| data-empty="true" on .history-tape | ✅ true |
| empty text | ✅ "No calculations yet" |
| itemCount | ✅ 0 |

## Evidence files
- `30-entries-panel-scrolls.png` — viewport screenshot with 30 entries, panel scrolling internally

## Verdict
**REPRODUCES-NO-LONGER.** HE-016 and HE-028 both satisfied post-fix:
- The panel's internal scroll region now overflows (scrollHeight > clientHeight) with 30 entries.
- The page body does NOT overflow (bodyScrollHeight === bodyClientHeight).
- The conditional `tabindex="0"` + aria-label now fire correctly on the scroll container.
- With 3 entries (non-overflow) the container is NOT focusable — no permanent dead tab stop.
- Empty state renders cleanly after AC.
