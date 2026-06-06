# Print-service catalog — closure & key architectural rules

**Source:** operator review of the print-service catalog — *"Print artifacts are not one thing. Python actually had 5 distinct print artifact classes, each with its own paper geometry and job."*
**Recorded:** 2026-05-24 14:47
**Branch:** N/A — analysis closure, no code changes
**Status:** Catalog accepted. ST receipt direction confirmed (mirror GT). One verification flag raised.

## Confirmed Python→SERN mapping

| Python Artifact | SERN Equivalent | Status |
|---|---|---|
| Receipt | `ThermalReceipt` | ✅ |
| Small Certificate | `SmallCert` | ✅ |
| Gold Cert Full | `GoldCert` | ✅ |
| Silver Cert Full | `SilverCert` | ✅ |
| Photo Certificate | `PhotoCert` | ✅ |
| Multi-page A4 Bundle | `ReceiptBundle` | 🆕 SERN-only |

## Architectural rule confirmed

> **Template logic can be shared. Paper geometry cannot.**

- ✅ Okay to share: rendering logic, field mapping, print pipeline, helper functions
- ❌ Never blindly share: CSS coordinates, top padding, print dimensions, signature alignment, paper offsets

Real printers + pre-printed paper are unforgiving — drift of millimeters destroys overlay alignment and forces reprints. The CSS-isolation rule is the architectural enforcement of physical-form-driven cert engineering ([[feedback_python_cert_architecture]]).

## ST receipt directional decision

Operator confirmed: ST has no Python equivalent. For SERN, **mirror GT receipt behavior**:

- Same field structure
- Same paper geometry (100mm thermal)
- Same auto-print + auto-close mechanics

Rationale: operators get *Gold Test receipt = Silver Test receipt* — same print experience, same training, same workflow expectation. This matches the principle that consistency at the operator surface beats novelty per workflow.

## Flag — one PC-specific assumption worth verifying

Python's `photo_certificate/certificate.html` hardcodes **"Bhimram"** as the signatory (literal string in the template). My catalog noted this; the user's mapping marks `PhotoCert` as ✅ but I have NOT verified whether SERN's `PhotoCert.js` preserves this hardcoded signatory or has parameterized it.

If parameterized: institutional drift from Python. If hardcoded: faithful port. Either is defensible, but the choice matters because the signatory name on a PC certificate is the issuing assayer's legal accountability.

Recommended one-line verification before the next PC print review:

```
grep -n "Bhimram" frontend/src/components/print/PhotoCert.js
```

If absent, check whether a `signatory` prop / config exists. If both are absent, the SERN port silently dropped the signatory — would be a P-G governance regression worth a small ticket.

Not patching now; just surfacing for the next operator pass.

## Out-of-scope but worth tracking later

- **`num2words` JS equivalent** for the GC/SC purity-in-words legal copy ("EIGHTEEN POINT FIVE FIVE"). If SERN's GoldCert/SilverCert components don't render this words-form, the legal force of the cert is weaker than Python's.
- **`|in_carat` JS helper** for the cert carat label (e.g. `22K`). Trivial port if not yet present.
- **Receipt-on-create auto-trigger** in NewGoldTestModal / NewSilverTestModal — per the user's deferred-toggle decision.

## Print catalog status

Reference document complete. Ready to anchor future cert-print parity reviews, ST receipt implementation, and any new artifact additions.
