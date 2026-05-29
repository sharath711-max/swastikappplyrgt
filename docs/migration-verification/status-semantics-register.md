# Status Semantics Register

This artifact is the semantic trust foundation for migration verification.
Workflow states must be validated by the next operator action, not by enum name.

## Canonical Mapping

| Python State | SERN State | SERN Column | Operator Meaning | Next Expected Operator Action |
| --- | --- | --- | --- | --- |
| `ongoing` | `TODO` | Ongoing | Intake exists. Results have not been submitted yet. | Add test/certificate results and submit to Tested. |
| `pending` | `IN_PROGRESS` | Tested | Results exist. The record is waiting for payment, delivery, certificate print, or final completion. | Collect payment/delivery details and finalize to Completed. |
| `completed` | `DONE` | Completed | Business workflow is finished and participates in bills, reports, receipts, and reconciliation. | Review, print, reprint, or audited correction only. |

## Governing Rule

Status mapping is operational, not lexical.

For each migrated Python record, the accepted SERN state is the state whose next operator action matches what the shop would have done next in Python.

## Go-Live Invariant

All migration, parity comparison, Kanban display, aging, bills, reports, and reconciliation code must use the same mapping:

```txt
ongoing   -> TODO
pending   -> IN_PROGRESS
completed -> DONE
```

The reverse reporting/parity mapping is:

```txt
TODO        -> ongoing
IN_PROGRESS -> pending
DONE        -> completed
```

## Unknown Status Policy

Unknown Python statuses must fail migration verification. They must not silently map to `TODO`, because that can hide pending or completed work in the wrong queue.

## Current Enforcement

- Canonical mapping lives in `backend/config/statusSemantics.js`.
- `backend/config/parityAdapter.js` imports the canonical mapping.
- `backend/scripts/migrate_from_python.js` imports the canonical mapping and rejects unknown statuses in strict mode.
- `backend/tests/unit/statusSemantics.test.js` protects the mapping and operator-action semantics.

## Business Sign-Off Questions

Before production migration, a business reviewer should sample records from each Python state and answer:

| Python State | Verification Question |
| --- | --- |
| `ongoing` | Would the operator expect to enter results next? |
| `pending` | Would the operator expect to collect payment, deliver, print certificate, or complete next? |
| `completed` | Would the operator expect this record to appear in completed bills/reports and only be corrected through audit? |

If the answer is no for any sampled record, migration must stop and the state semantics must be corrected before continuing.
