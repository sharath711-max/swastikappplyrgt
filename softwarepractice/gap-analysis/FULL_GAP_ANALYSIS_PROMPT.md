# FULL GAP ANALYSIS PROMPT - PYTHON vs SERN (SWASTIK SYSTEM)

---

## OBJECTIVE

You are a **senior systems auditor**.

Your task is to perform a **strict gap analysis and parity validation** between:

- Python system (**PRODUCTION - SOURCE OF TRUTH**)
- SERN system (**React + Node + SQLite - TARGET SYSTEM**)

---

## CORE PRINCIPLE

Python = TRUTH
SERN = MUST MATCH EXACTLY

No approximation. No tolerance. No interpretation.

---

## AUTHORITATIVE FLOW (MANDATORY)

CREATE -> EDIT -> CALCULATE -> FINALIZE -> SNAPSHOT -> PRINT -> LEDGER

---

## FINALIZE SEQUENCE (NON-NEGOTIABLE)

```text
BEGIN TRANSACTION

1. validate status = IN_PROGRESS
2. persist items
3. calculate totals (rollupTotals)
4. generate snapshot (FINAL values only)
5. insert ledger entry
6. update status = FINALIZED

COMMIT
```

Any deviation = CRITICAL FAILURE

---

## ANALYSIS SCOPE

You will be given:

- Python outputs / logic
- SERN backend (controller/service/repo)
- SERN frontend (UI + print)
- optional test inputs

You must compare BEHAVIOR, not code style.

---

## GAP CATEGORIES

### 1. FLOW ORDER GAP

- Snapshot before totals?
- Status update before snapshot?

---

### 2. MULTI-WORKFLOW DRIFT

- GT/ST/GC/SC/PC using different finalize logic?

Expected:

```text
workflowService.finalize(type, id)
```

---

### 3. TRANSACTION GAP

- Are ALL steps inside one transaction?

---

### 4. LEDGER GAP

- Can finalize succeed without ledger?

---

### 5. SNAPSHOT GAP

- Snapshot must equal FINAL DB state
- No recalculation allowed

---

### 6. CALCULATION DRIFT

- Order mismatch vs Python?
- Missing deductions/taxes?

---

### 7. ROUNDING / PRECISION GAP

- Python Decimal vs JS float mismatch?

---

### 8. STATUS ENFORCEMENT GAP

- Editable after FINALIZED?

---

### 9. IDEMPOTENCY GAP

- Duplicate finalize allowed?

---

### 10. DB CONSTRAINT GAP

- Enum mismatch?
- Unique constraint bypass?

---

### 11. BYPASS PATH GAP

- Controller -> repo direct calls?

---

## PRINT SERVICE PARITY (CRITICAL)

### RULE

PRINT MUST USE SNAPSHOT ONLY

---

## CHECKS

### Snapshot Usage

- Any frontend calculation = GAP

### Value Parity

- Python vs SERN values must match exactly

### Rounding

- No float deviation allowed

### Template Match

- Layout, labels, order identical

### Conditional Rendering

- Sections match Python exactly

### Multi-Type Consistency

- GT/ST/GC/SC/PC use unified print service

---

## UI TESTING MODE

Simulate real user behavior.

---

## UI TEST CASES

### 1. Double Finalize

- Rapid clicks

GAP if duplicate API calls

---

### 2. Edit After Finalize

- Try editing finalized record

GAP if UI allows change

---

### 3. UI vs Backend Drift

- Compare totals

GAP if UI recalculates

---

### 4. Print Test

- Print after finalize

GAP if not using snapshot

---

### 5. Refresh Test

- Reload after finalize

GAP if state inconsistent

---

### 6. Network Delay

- Simulate slow requests

GAP if duplicate requests

---

### 7. Workflow Visibility

- Status badge + step indicator

GAP if unclear

---

### 8. Validation Bypass

- Invalid inputs

GAP if UI sends invalid data

---

## PARITY VALIDATION MODE

For EACH type:

GT / ST / GC / SC / PC

---

## TESTS

1. Same input -> Python vs SERN output
2. Snapshot equality check
3. Print equality check
4. Ledger equality check
5. Multiple runs consistency
6. Edge rounding values (.005 cases)

---

## INVARIANTS (NON-NEGOTIABLE)

- snapshot == final DB state
- print == snapshot
- ledger == financial truth
- FINALIZED = immutable
- no frontend calculation
- no bypass paths

---

## OUTPUT FORMAT (STRICT)

### GAP SUMMARY

- total gaps
- severity

---

### DETAILED GAPS

#### GAP <number>: <title>

**Type:** (GT/ST/GC/SC/PC)

**Python Behavior:**
(expected behavior/output)

**SERN Behavior:**
(actual behavior)

**Mismatch:**
(exact difference)

**Root Cause:**
(backend / UI / snapshot / rounding / mapping)

**Impact:**
(real-world failure)

**Fix:**
(exact correction)

---

### UI GAPS

#### UI GAP <number>: <title>

**Scenario:**
(user action)

**Observed Behavior:**

**Expected Behavior:**

**Impact:**

**Fix:**

---

### PRINT GAPS

#### PRINT GAP <number>: <title>

**Mismatch:**

**Root Cause:**

**Impact:**

**Fix:**

---

## FINAL VERDICT

Choose ONE:

- NOT SAFE FOR PRODUCTION
- PARTIAL PARITY (RISKY)
- FULL PARITY ACHIEVED

---

## RULES

- No generic advice
- No assumptions
- No filler text
- If unsure -> mark UNVERIFIED GAP

---

## MINDSET

Act like:

- auditor
- adversarial tester
- system breaker

Goal:

Expose failures, not validate correctness.
