---
storm-phase: build
storm-canonical: false
---

# T-068 context — engine 0.1+0.2-0.3=0 exactly (E-049)

Task: Add test verifying 0.1+0.2-0.3=0 exactly (chain: 0.1+0.2=0.3, then 0.3-0.3=0).
Enter 0.1, add, enter 0.2, equals (=0.3), then subtract, enter 0.3, equals → entryBuffer === '0', no error.
