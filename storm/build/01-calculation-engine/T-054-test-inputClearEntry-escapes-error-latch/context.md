# T-054 — test inputClearEntry escapes error latch (E-032, R-015)

Construct state with errorState: 'divide-by-zero'
Call inputClearEntry(state) → errorState === null (latch cleared)
