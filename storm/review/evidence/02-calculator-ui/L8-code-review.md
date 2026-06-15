# L8 Code Audit — M2 Calculator UI (adversarial / critical-reviewer hat)

Scope: src/ui/{state,render,bindings,operator-map,main}.ts + styles/*.css + index.html + vite.config.ts.
M1 (engine/types/decimal-config) is frozen REVIEW-PASS — audited M2's CONSUMPTION only.
NOTE: run inline by orchestrator (forked opus dispatch blocked by #FF-008). Tier-purity caveat in review log; this is NOT a fresh-context independent audit.

## Checklist
1. **XSS / dangerous sinks** — PASS. All display writes use `textContent` (render.ts:196, 244) and `createElement`+`textContent` for the scroll span (render.ts:167-170). No `innerHTML`, no `eval`, no `document.write`. Values are engine-derived numeric strings regardless. Auth/injection/SSRF: N/A (static client calc).
2. **Secrets** — PASS. None present.
3. **Dead code** — FINDINGS (P3):
   - state.ts:22 re-exports `getDisplayValue`, but render.ts imports it directly from '../engine' (render.ts:14). The state.ts re-export appears unused. (P3 — harmless, trim for tidiness.)
   - bindings.ts:93 `console.warn` on missing .keypad — defensive, keep (not a debug leftover).
4. **Complexity** — PASS. fitDisplay() ~58 lines but linear, nesting ≤3; render() ~73 lines mostly comments + linear writes. No cyclomatic outliers.
5. **Fragmentation (CP-5)** — PASS. All files <260 lines; none >800; no over-splitting.
6. **Contract consistency (INT-1..INT-6, _decisions)** — PASS (high fidelity):
   - INT-1: ONE held `state` cell (state.ts:28); dispatch does `state = fn(state)` then render (45-46) — replace, never mutate. ✓
   - F2 (never computes): M2 calls only M1 reducers; pendingLine uses accumulator.toString() for display only. ✓
   - INT-4 whitelist: ctrl/meta/alt early-return (bindings.ts:146); non-whitelisted keys early-return with NO preventDefault (184-186). ✓
   - operator-map: Object.freeze maps; subtract = U+2212 (not hyphen), multiply U+00D7, divide U+00F7. ✓
   - render: exhaustive `never`-guarded ErrorTag switch (render.ts:56-61); error class via classList.toggle DERIVED from state.errorState (233), not stored. ✓
7. **Error handling** — PASS. Fail-fast throw if required DOM missing (render.ts:35-40); exhaustive error switch; no silent catches. Minor (P3): `displayValue as ErrorTag` cast (render.ts:193) couples render's isError to M1's return contract — safe given M1 frozen, documented.
8. **Test coverage** — PASS-with-note (P3): M2 view layer has no unit tests, per D-007 (browser e2e = REVIEW's job, executed L1). Pure helpers `pendingLine()` + operator-map are trivially unit-testable and would be cheap regression insurance — optional, D-007 waives.

## Cross-layer (asset, not TS code)
- **P1**: 3 self-hosted woff2 are byte-identical (Inter-Light copied to Medium/Regular names; md5 65850a37...). All weights render from Light → D-004 "genuine 300/400/500" not met. Fix lives in BUILD assets, not this TS code.

## Verdict
P0: 0 | P1: 0 (in TS code) | P2: 0 | P3: 4 (unused re-export, helper coverage suggestion, cast-coupling note, console.warn-keep).
**M2 code quality: HIGH.** No security issues, no dead branches of consequence, contract honored faithfully. The only P1-class issues are the font assets (L7) and a11y page-structure (L4) — neither is a TS-code defect.
