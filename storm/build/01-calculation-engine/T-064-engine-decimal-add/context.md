---
storm-phase: build
storm-canonical: false
---

# T-064 context — engine 0.1+0.2=0.3 (E-045)

Task: Add test verifying 0.1 + 0.2 = 0.3 via full engine sequence.
Full engine sequence: initialState → inputDigit('0') → inputDecimal → inputDigit('1') → inputOperator('add') → inputDigit('0') → inputDecimal → inputDigit('2') → inputEquals
Assert: entryBuffer === '0.3', no error
