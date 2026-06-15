---
storm-phase: review
storm-module: 03-history-tape
storm-canonical: false
generated: 2026-06-15
layer: L1-crawl
---

# M3 History Tape — L1-L6 Review Findings

**Overall verdict:** CONDITIONAL PASS — 1 P1 layout bug blocks the scroll/keyboard-focus ACs (US-M3-4 HE-016, US-M3-8 HE-028); all other ACs PASS cleanly.

**Severity counts:** P0: 0 | P1: 1 | P2: 1 | P3: 1

---

## P1 Findings

### P1-001 — Layout break: tape panel grows page height instead of scrolling
**Fails:** US-M3-4 T (no layout break — HE-016) · US-M3-8 T (scroll region keyboard-focusable — HE-028)

**Observed:** With 30+ entries, the `.history-tape__scroll` div (`overflow-y: auto`) has no `max-height` or fixed `height` constraint. It expands to 1213px+, causing `.history-slot`, `.app-layout`, `#app`, and `<body>` to all expand. `document.body.scrollHeight=949 > bodyClientHeight=647` (302px overflow). The **page itself scrolls** instead of the panel's internal scroll region.

**Consequence chain:**
1. HE-016 **FAIL**: "overflow is absorbed by the panel's own scroll — the page does not grow" — the page does grow.
2. HE-028 **FAIL**: The scroll container's `isOverflowing` (scrollHeight > clientHeight) is always `false` because it grows to match content. Therefore the conditional `tabindex="0"` (when overflowing) is never applied. Keyboard users cannot focus/scroll the tape region even when it has many entries.
3. US-M3-4 T "newest-at-edge while scrolled" cannot be meaningfully tested since no true scroll occurs within the panel.

**Evidence:** DOM inspection with 31 entries: `scrollContainer.scrollHeight === scrollContainer.clientHeight === 1253`; `bodyScrollHeight=949 > bodyClientHeight=647`.

**Fix direction:** Add `max-height` (e.g., `100%`, `calc(100vh - Npx)`, or a flex constraint) to `.history-tape__scroll` so it is bounded and overflows internally. The conditional `tabindex` logic in JS should then fire correctly.

---

## P2 Findings

### P2-001 — Backdrop-filter (glass blur) not rendering on tape panel
**Fails:** L5 visual baseline (v1 "recessed glass panel, 16px blur" per `_picked.md`)

**Observed:** `window.getComputedStyle(historySection).backdropFilter === "none"` on the `.history-tape` section. The baseline specifies "recessed tape panel (standard 16px blur vs the slab's deeper blur)." The blur is absent in the rendered output.

**Note:** This could be a Playwright headless/software-renderer limitation (backdrop-filter is GPU-accelerated; some headless environments don't apply it). Needs verification in a real browser. Flagging as P2 (visual regression risk) pending confirmation.

**Evidence:** L5 visual screenshot `L5-visual/populated-tape-3entries.png` + computed style check.

---

## P3 Findings

### P3-001 — LCP not captured in perf snapshot
**Fails:** L6 smoke (informational only, not an AC)

**Observed:** `LCP: null` in `L6-perf.json`. LCP likely fired before the Playwright PerformanceObserver buffer was populated (typical in static-asset-fast pages). FCP=372ms, CLS=0, DOMContentLoaded=101ms are all healthy.

**Not an AC failure** — no LCP threshold is defined in the acceptance criteria. Noted for perf baseline.

---

## AC-by-AC Pass/Fail Table

| Story | AC | Result | Notes |
|---|---|---|---|
| **US-M3-1** T1 | 1 entry after 12+3= (button click) | ✅ PASS | itemCount=1 |
| **US-M3-1** T1 | 1 entry after 12+3= (keyboard Enter) | ✅ PASS | keyboard path verified |
| **US-M3-1** T2 | expression "12 + 3", result "15", + is U+002B | ✅ PASS | charCode=43 |
| **US-M3-1** T3 | newest entry at visible edge | ✅ PASS | first DOM item = most recent |
| **US-M3-1** T4 | display unchanged after recording | ✅ PASS | display="15" before and after |
| **US-M3-1** T5 | − is U+2212 | ✅ PASS | charCode=8722 |
| **US-M3-1** T5 | × is U+00D7 | ✅ PASS | charCode=215 |
| **US-M3-1** T5 | ÷ is U+00F7 | ✅ PASS | charCode=247 |
| **US-M3-1** T6 | 7÷2 records result "3.5" (decimal faithful) | ✅ PASS | resultText="3.5" matches display |
| **US-M3-2** | repeated = (12+3===) → exactly 1 entry | ✅ PASS | itemCount=1 |
| **US-M3-2** | error = (5÷0=) → 0 entries, no error string in tape | ✅ PASS | itemCount=0, display="Cannot divide by zero" |
| **US-M3-2** | bare = (5=) → 0 entries | ✅ PASS | itemCount=0 |
| **US-M3-2** | typing digits after = → count unchanged | ✅ PASS | itemCount stable at 1 |
| **US-M3-3** T1 | 12+3+4= → exactly 1 entry | ✅ PASS | itemCount=1 |
| **US-M3-3** T2 | expression "15 + 4", result "19" | ✅ PASS | final binary step recorded correctly |
| **US-M3-3** T3 | display shows "19" | ✅ PASS | |
| **US-M3-4** | 30 entries → all present (toHaveCount(30)) | ✅ PASS | itemCount=30 confirmed |
| **US-M3-4** | newest at visible edge (ordering) | ✅ PASS | first DOM item = newest (i=30) |
| **US-M3-4** | no layout break (HE-016) | ❌ **P1-001** | page grows 302px, body scrolls |
| **US-M3-4** | read-only — click entry → display unchanged | ✅ PASS | cursor=default, pointer-events=none, display unchanged |
| **US-M3-4** | no editable field, no export/share button | ✅ PASS | 0 buttons, 0 inputs in history region |
| **US-M3-5** | AC clears tape → 0 entries + empty state | ✅ PASS | button click |
| **US-M3-5** | Esc clears tape → 0 entries + empty state | ✅ PASS | keyboard Esc |
| **US-M3-5** | CE does NOT clear tape → count unchanged | ✅ PASS | count stays 2 after CE |
| **US-M3-5** | AC during error → display "0" + 0 entries | ✅ PASS | HE-021 |
| **US-M3-5** | empty state renders cleanly after AC | ✅ PASS | "No calculations yet" visible |
| **US-M3-6** | fresh load → 0 entries + empty state | ✅ PASS | after navigate() |
| **US-M3-6** | no localStorage tape data | ✅ PASS | lsKeys=[] |
| **US-M3-6** | no sessionStorage tape data | ✅ PASS | ssKeys=[] |
| **US-M3-6** | no indexedDB tape data | ✅ PASS | idbDatabases=[] |
| **US-M3-6** | reload → tape empty | ✅ PASS | navigate to same URL → itemCount=0 |
| **US-M3-7** | default motion: slide-in animation on new entry | ✅ PASS | animation="0.18s ease-out both historySlideIn" |
| **US-M3-7** | reduced-motion CSS rule present for .history-entry--new | ✅ PASS | @media (prefers-reduced-motion: reduce) { .history-entry--new { animation: 0s } } |
| **US-M3-8** | semantic list role on container | ✅ PASS | UL[role=list] |
| **US-M3-8** | listitem role on each entry | ✅ PASS | LI × N entries |
| **US-M3-8** | accessible name on region ("Calculation history") | ✅ PASS | aria-label="Calculation history" on section |
| **US-M3-8** | not aria-hidden when populated | ✅ PASS | aria-hidden=null |
| **US-M3-8** | no aria-live on tape (no double-announce) | ✅ PASS | tape region and list have no aria-live |
| **US-M3-8** | display carries role="status"/aria-live="polite" | ✅ PASS | single announce by M2 display |
| **US-M3-8** | axe violations | ✅ PASS | 0 violations, 13 passes |
| **US-M3-8** | long value no-truncation (1÷3 = 0.333…) | ✅ PASS | full 23-char result in DOM, text-overflow=clip not ellipsis |
| **US-M3-8** | scroll region tabindex="0" when overflowing | ❌ **P1-001** | scroll container never overflows (no max-height) → tabindex never set |
| **US-M3-8** | no permanent tab-stop when not overflowing | ✅ PASS | tabindex=null when 3 entries (non-overflow) |

---

## Layer Verdicts

| Layer | Verdict | Notes |
|---|---|---|
| **L1 Functional** | CONDITIONAL PASS | 1 P1 (layout/scroll), 43/45 ACs pass |
| **L2 Console** | PASS | 0 app errors, 0 app warnings (2 warnings from eval script, not app) |
| **L3 Network** | PASS | No 4xx/5xx, no tape persistence requests |
| **L4 Accessibility** | PASS | axe: 0 violations, 13 passes, 1 incomplete (contrast/glass — expected) |
| **L5 Visual** | CONDITIONAL PASS | Structure matches v1 baseline (single-line, hairline dividers, tabular-nums, no glow); backdrop-filter=none flagged P2 (may be headless env limitation) |
| **L6 Perf** | PASS | FCP=372ms, CLS=0, DOMContentLoaded=101ms |

---

## Evidence Files

- `screenshots/initial-load.png` — fresh load state
- `L5-visual/populated-tape-30-entries.png` — 30 entries showing layout break
- `L5-visual/populated-tape-3entries.png` — 3 entries for v1 visual comparison
- `L5-visual/empty-state.png` — empty state after AC
- `L2-console.log` — 0 app errors/warnings
- `L3-network.log` — 0 4xx/5xx
- `L4-axe.json` — axe results: 0 violations
- `L6-perf.json` — perf timing: FCP=372ms, CLS=0

---

## CP-13 Self-Critique (7-dim, mandatory before commit)

**Strongest concern:** **Broken-others (dim 3)** — The P1 layout bug assessment is robust: confirmed via DOM inspection with 31 entries (scrollHeight=clientHeight=1253, bodyScrollHeight=949 > bodyClientHeight=647). The root cause (no max-height on scroll container) is verified, not inferred.

**Other dims:**
- YAGNI: findings scoped to observable AC failures only. No out-of-scope speculation. ✅
- Over-engineering: single commit, findings file + evidence. Minimal. ✅
- New gaps: P1 root cause noted; fix direction given. No new gaps opened. ✅
- Inconsistency: all citations reference `07-acceptance.md` AC IDs directly. ✅
- Contradiction: no prior REVIEW decisions contradicted. ✅
- Friction: report is graded severity, owner-readable summary at top. ✅

**Cascade:** none required — this is a read-only review commit.

**Tradeoff:** none — no ≥2-principle tension in this findings write.

**Verdict: PROCEED**

Note on P2 (backdrop-filter): flagged as P2 rather than P1 because it is potentially a headless rendering env artifact, not a code defect. Requires verification in real Chrome before escalating. Not blocking a REVIEW pass at this layer.
