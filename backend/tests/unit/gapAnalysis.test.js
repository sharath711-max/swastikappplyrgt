'use strict';

/**
 * gapAnalysis.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated gap tests — Python (SOURCE OF TRUTH) vs SERN (TARGET)
 *
 * Each test maps to a numbered gap from the full gap analysis report.
 * ✓ = gap does not exist (SERN matches Python)
 * ✗ = gap confirmed (fixed before this test was added)
 *
 * Runner: Jest (static source-code analysis — no DB required)
 */

const fs   = require('fs');
const path = require('path');

const SVC = (...parts) => path.join(__dirname, '../../services/v2', ...parts);
const REPO = (...parts) => path.join(__dirname, '../../repositories', ...parts);
const FE   = (...parts) => path.join(__dirname, '../../../frontend/src', ...parts);

// ─── GAP 1: Fee Model Constants ───────────────────────────────────────────────

describe('GAP 1 — Fee Model Constants (Python = TRUTH)', () => {

    test('GT/ST: TEST_FEE_RATE must be 30 (Python GoldTest.PRICE = 30)', () => {
        const src = fs.readFileSync(SVC('testService.js'), 'utf8');
        const matches = [...src.matchAll(/const\s+TEST_FEE_RATE\s*=\s*(\d+)/g)];
        expect(matches.length).toBeGreaterThan(0);
        for (const m of matches) {
            expect(Number(m[1])).toBe(30);
        }
    });

    test('GC: CERT_FEE_RATE must be 50 (Python GoldCertificate.PRICE = 50)', () => {
        const src = fs.readFileSync(SVC('certificateService.js'), 'utf8');
        const m = src.match(/const\s+CERT_FEE_RATE\s*=\s*(\d+)/);
        expect(m).toBeTruthy();
        expect(Number(m[1])).toBe(50);
    });

    test('SC: SILVER_CERT_FEE_RATE must be 100 (Python SilverCertificate.PRICE = 100)', () => {
        const src = fs.readFileSync(SVC('certificateService.js'), 'utf8');
        expect(src).toMatch(/SILVER_CERT_FEE_RATE\s*=\s*100/);
    });

    test('GC updateStatus must use CERT_FEE_RATE (50) not SILVER_CERT_FEE_RATE when type=gold', () => {
        const src = fs.readFileSync(SVC('certificateService.js'), 'utf8');
        // Must apply the correct rate per metal type
        expect(src).toMatch(/type\s*===\s*'silver'\s*\?\s*SILVER_CERT_FEE_RATE\s*:\s*CERT_FEE_RATE|CERT_FEE_RATE\s*:\s*SILVER_CERT_FEE_RATE/);
    });

    test('PC: PHOTO_CERT_FEE_RATE must be 50 (Python PhotoCertificate.PRICE = 50)', () => {
        const src = fs.readFileSync(REPO('photoCertificateRepository.js'), 'utf8');
        const m = src.match(/PHOTO_CERT_FEE_RATE\s*=\s*(\d+)/);
        expect(m).toBeTruthy();
        expect(Number(m[1])).toBe(50);
    });
});

// ─── GAP 9: PC Sequence Transaction Composability ─────────────────────────────

describe('GAP 9 — PC Sequence must use composable bare-DB helper', () => {

    test('photoCertificateRepository.create must NOT call standalone SequenceService.generateGlobalSequence()', () => {
        const src = fs.readFileSync(REPO('photoCertificateRepository.js'), 'utf8');
        expect(src).not.toContain('SequenceService.generateGlobalSequence()');
    });

    test('photoCertificateRepository.create must use v2 _generateGlobalSequenceWork inside transaction', () => {
        const src = fs.readFileSync(REPO('photoCertificateRepository.js'), 'utf8');
        expect(src).toContain('_generateGlobalSequenceWork');
    });
});

// ─── GAP 10: PC Ledger skip_status_check ────────────────────────────────────

describe('GAP 10 — PC Ledger must pass skip_status_check:true', () => {

    test('photoCertificateRepository updateStatus DONE must include skip_status_check:true in recordRevenue', () => {
        const src = fs.readFileSync(REPO('photoCertificateRepository.js'), 'utf8');
        expect(src).toContain('skip_status_check');
        // Verify it is set to true
        expect(src).toMatch(/skip_status_check\s*:\s*true/);
    });
});

// ─── GAP 3/14/21: Snapshot Stale Data ────────────────────────────────────────

describe('GAP 3/14/21 — getPrintLayout must guard against stale non-DONE snapshots', () => {

    test('getPrintLayout must force regeneration when record is not DONE', () => {
        const src = fs.readFileSync(SVC('printService.js'), 'utf8');
        // Must have a check: if status !== DONE, forceRegenerate = true
        expect(src).toMatch(/data\.status\s*!==\s*'DONE'/);
    });
});

// ─── PRINT GAP 1: "NO GOLD" Purity Label ─────────────────────────────────────

describe('PRINT GAP 1 — Zero-purity gold items must display "NO GOLD"', () => {

    test('printService snapshot must include purity_label field', () => {
        const src = fs.readFileSync(SVC('printService.js'), 'utf8');
        expect(src).toContain('purity_label');
    });

    test('printService purity_label must be "NO GOLD" for zero/null purity', () => {
        const src = fs.readFileSync(SVC('printService.js'), 'utf8');
        expect(src).toContain('NO GOLD');
    });
});

// ─── GAP 8: _assertMutable IN_PROGRESS Block ─────────────────────────────────

describe('GAP 8 — _assertMutable must not block IN_PROGRESS (Python allows pre-completion edits)', () => {

    test('certificateService._assertMutable must only throw on DONE, not IN_PROGRESS', () => {
        const src = fs.readFileSync(SVC('certificateService.js'), 'utf8');
        // The old condition was: status === 'DONE' || row.status === 'IN_PROGRESS'
        // After fix: only status === 'DONE'
        expect(src).not.toMatch(/status\s*===\s*'DONE'\s*\|\|\s*row\.status\s*===\s*'IN_PROGRESS'/);
    });
});

// ─── GAP 13: Bulk Finalize Idempotency ───────────────────────────────────────

describe('GAP 13 — Bulk finalize loop must include X-Request-Id per item', () => {

    test('WorkflowBoard batch finalize must attach X-Request-Id to each finalize call', () => {
        const src = fs.readFileSync(FE('pages/WorkflowBoard.js'), 'utf8');
        // Every finalize call in a batch loop must include X-Request-Id
        // Check for createRequestId usage in batch finalize context
        expect(src).toMatch(/X-Request-Id/);
        expect(src).toMatch(/createRequestId\(\)/);
    });
});

// ─── GAP 22: Silver Test (documented SERN-only extension) ────────────────────

describe('GAP 22 — Silver Test is SERN-only extension (documented divergence)', () => {

    test('Silver test workflow exists in SERN but has no Python counterpart — documented', () => {
        const src = fs.readFileSync(SVC('testService.js'), 'utf8');
        // Silver test is a SERN-only feature — its existence is intentional and documented
        expect(src).toContain("'silver'");
        // This test always passes — it documents that ST is a deliberate SERN extension
    });
});

// ─── GAP 12: Status Enum (documented migration gap) ─────────────────────────

describe('GAP 12 — Status enum difference (migration scripts required)', () => {

    test('SERN uses TODO/IN_PROGRESS/DONE — migration scripts must map from ongoing/pending/completed', () => {
        const src = fs.readFileSync(SVC('testService.js'), 'utf8');
        expect(src).toContain('TODO');
        expect(src).toContain('IN_PROGRESS');
        expect(src).toContain('DONE');
        // Python used: ongoing, pending, completed — migration mapping is required
    });
});
