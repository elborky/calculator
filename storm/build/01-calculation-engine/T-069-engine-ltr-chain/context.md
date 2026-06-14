---
storm-phase: build
storm-canonical: false
---

# T-069 context — engine 2+3×4=20 LTR no-precedence (E-025, R-004)

Task: Add test verifying left-to-right evaluation (no operator precedence).
Enter 2, add, enter 3, multiply → auto-resolves 2+3=5 (acc=5, op=multiply)
Enter 4, equals → 5×4=20
Assert: entryBuffer === '20', no error.
