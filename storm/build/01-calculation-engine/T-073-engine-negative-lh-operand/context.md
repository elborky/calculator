---
storm-phase: build
storm-canonical: false
---

# T-073 context — engine negative as LH operand -2+10=8 (E-042)

Task: Add test verifying negative result used as left operand in next chain.
After 3-5=-2 (justEvaluated=true), press add, enter 10, equals → -2+10=8.
Assert: entryBuffer === '8', no error.
