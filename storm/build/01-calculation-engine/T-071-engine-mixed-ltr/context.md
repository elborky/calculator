---
storm-phase: build
storm-canonical: false
---

# T-071 context — engine 10÷2+3=8 mixed LTR (E-027)

Task: Add test verifying mixed operators left-to-right: 10÷2=5, then 5+3=8.
Assert: entryBuffer === '8', no error.
