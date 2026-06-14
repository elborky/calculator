# T-056 — test inputClearEntry CE then equals resolves with 0 (E-058)

Sequence: digit '5' → op 'add' → digit '3' → CE → equals
CE clears entryBuffer to '0'. Pressing = resolves: 5 + 0 = 5
Assert: entryBuffer === '5', justEvaluated === true, no error
