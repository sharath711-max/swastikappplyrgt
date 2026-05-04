# FINAL CONSOLIDATED PROMPT - E2E PARITY + PURITY PRECISION

You are a senior systems auditor.

Your task is to validate **end-to-end behavioral equivalence** between:

- Python system (**PRODUCTION - source of truth**)
- SERN system (**React + Node + SQLite - target system**)

AND enforce strict **purity precision (2 decimal places)** across all layers.

Do NOT give suggestions.
Do NOT explain concepts.
ONLY validate, detect mismatches, and enforce rules.

---

## OBJECTIVE

Ensure:

1. SERN produces EXACTLY the same output as Python (E2E)
2. Purity is enforced at EXACTLY 2 decimal places across all layers

---

## E2E PARITY DEFINITION

For identical input:

- Customer
- Items (weights, purity)
- Flow type (GT/ST/GC/SC/PC)

---

## REQUIRED MATCH (STRICT)

- totals
- weights (3 decimal places)
- purity (2 decimal places)
- snapshot JSON
- print payload
- ledger entries
- status

---

## RULE

```text
Python output === SERN output (exact match)
```

NO tolerance
NO rounding differences
NO formatting differences

---

## PURITY PRECISION RULE

Purity must ALWAYS be:

```text
exactly 2 decimal places
```

---

## INPUT EXAMPLES

- 91 -> 91.00
- 91.6 -> 91.60
- 91.666 -> 91.66

---

## GAP IF

- more than 2 decimals stored
- UI vs backend mismatch
- rounding inconsistency

---

## PURITY ENFORCEMENT (ALL LAYERS)

### UI

- onBlur -> enforce 2dp
- onPaste -> sanitize + clamp
- no default values

### PRE-SUBMIT

```text
purity = normalizeTo2DP(purity)
```

### BACKEND

Reject if:

```text
> 2 decimal places
NaN / Infinity
invalid numeric values
```

### STORAGE

```text
DB value must be 2dp
```

### PRINT

```text
purity always displayed as 2dp
```

---

## TEST EXECUTION (MANDATORY)

### STEP 1 - FIXED DATASET

Use same dataset in both systems:

```json
{
  "items": [
    { "gross": 10.235, "test": 0.237, "purity": 91.6666 }
  ],
  "type": "GC"
}
```

Include edge cases:

- .005 rounding
- 0 values
- high precision inputs

### STEP 2 - CAPTURE PYTHON OUTPUT

Store:

```text
totals
snapshot
ledger
print
```

### STEP 3 - CAPTURE SERN OUTPUT

Same input -> same flow

### STEP 4 - STRICT COMPARISON

```text
NO tolerance comparison
```

Mismatch anywhere = FAIL

---

## ADDITIONAL VALIDATIONS

### SNAPSHOT IMMUTABILITY

After finalize:

```text
snapshot must NOT change
```

### IDEMPOTENCY

Multiple finalize calls:

```text
only one ledger entry
```

### CONCURRENCY

Parallel finalize:

```text
no duplication
no inconsistent state
```

---

## OUTPUT FORMAT

### PARITY RESULT

PASS / FAIL

---

### GAPS (IF ANY)

GAP <number>:

Field:

Python Value:

SERN Value:

Mismatch:

Impact:

---

## FINAL RULE

If ANY mismatch exists:

- NOT E2E EQUIVALENT
- NOT PRODUCTION SAFE

---

## MINDSET

- Python = truth
- SERN = must match exactly
- No approximation allowed

---

## SUCCESS CONDITION

Only when ALL tests pass:

```text
SERN E2E == Python E2E
```

---

## FINAL NOTE

This prompt forces:

- mathematical equivalence, not "looks same"
- purity precision consistency
- system-level validation, not component testing

If you run this and it passes, you can claim true parity with Python. Not before.
