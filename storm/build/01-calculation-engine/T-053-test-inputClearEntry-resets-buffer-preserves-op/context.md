# T-053 — test inputClearEntry resets buffer, preserves pending op (E-029)

Sequence: digit '5' → op 'add' → digit '3' → CE
After CE:
- entryBuffer === '0'
- errorState === null
- accumulator.toString() === '5'
- pendingOperator === 'add' (preserved)
