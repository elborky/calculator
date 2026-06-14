# T-055 — test inputClearEntry accumulator stays null (E-028)

Sequence: initialState() → digit '7' → CE
After CE: entryBuffer === '0', accumulator === null (still null, no operator was pressed)
