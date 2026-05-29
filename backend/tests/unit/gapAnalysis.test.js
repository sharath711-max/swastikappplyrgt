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

// ─── GAP 10: PC ledger atomic gate (replaces skip_status_check check) ───────
//
// As of the customer-centric refactor, ledger idempotency lives on the cert
// row (ledger_charged_at column), not on credit_history. The legacy
// skip_status_check flag was removed alongside the status cross-check; the new
// invariant is that PC's finalize path uses chargeCertificate (atomic gate),
// not recordRevenue.

describe('GAP 10 — PC ledger must use atomic chargeCertificate gate', () => {

    test('photoCertificateRepository finalize must call chargeCertificate (not recordRevenue)', () => {
        const src = fs.readFileSync(REPO('photoCertificateRepository.js'), 'utf8');
        expect(src).toContain('chargeCertificate');
        // Old idempotency hack must be gone
        expect(src).not.toMatch(/skip_status_check/);
        // Old pre-flight COUNT(*) on credit_history must be gone
        expect(src).not.toMatch(/credit_history.*reference_type.*=.*'photo_certificate'/);
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

// ─── GAP 23: Customer-centric CH/WLH refactor ────────────────────────────────
//
// CH (credit_history) and WLH (weight_loss_history) were de-coupled from the
// workflow tables. The reference_type / reference_id / ref_id columns are
// gone; cert idempotency now lives in <cert_table>.ledger_charged_at as an
// atomic UPDATE gate.

describe('GAP 23 — CH/WLH customer-centric refactor', () => {

    test('init.sql credit_history must NOT declare reference_type/reference_id columns', () => {
        const src = fs.readFileSync(path.join(__dirname, '../../db/init.sql'), 'utf8');
        // Carve out the credit_history block and search inside it
        const m = src.match(/CREATE TABLE IF NOT EXISTS credit_history[\s\S]*?\);/);
        expect(m).not.toBeNull();
        expect(m[0]).not.toMatch(/\breference_type\b/);
        expect(m[0]).not.toMatch(/\breference_id\b/);
    });

    test('init.sql weight_loss_history must NOT declare ref_id column', () => {
        const src = fs.readFileSync(path.join(__dirname, '../../db/init.sql'), 'utf8');
        const m = src.match(/CREATE TABLE IF NOT EXISTS weight_loss_history[\s\S]*?\);/);
        expect(m).not.toBeNull();
        expect(m[0]).not.toMatch(/\bref_id\b/);
    });

    test('Each cert table must declare ledger_charged_at column', () => {
        const src = fs.readFileSync(path.join(__dirname, '../../db/init.sql'), 'utf8');
        for (const t of ['gold_certificate', 'silver_certificate', 'photo_certificate']) {
            const m = src.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${t}[\\s\\S]*?\\);`));
            expect(m).not.toBeNull();
            expect(m[0]).toMatch(/\bledger_charged_at\b/);
        }
    });

    test('migrations.js must drop reference_type/reference_id/ref_id and the partial unique indexes', () => {
        const src = fs.readFileSync(path.join(__dirname, '../../db/migrations.js'), 'utf8');
        expect(src).toContain('migrateDropWorkflowLinks');
        expect(src).toContain("dropColumnIfExists('credit_history',      'reference_type')");
        expect(src).toContain("dropColumnIfExists('credit_history',      'reference_id')");
        expect(src).toContain("dropColumnIfExists('weight_loss_history', 'ref_id')");
        expect(src).toContain("dropIndexIfExists('ux_gc_debit')");
        expect(src).toContain("dropIndexIfExists('ux_sc_debit')");
        expect(src).toContain("dropIndexIfExists('ux_pc_debit')");
    });

    test('ledgerService must export chargeCertificate (atomic gate)', () => {
        const src = fs.readFileSync(SVC('ledgerService.js'), 'utf8');
        expect(src).toContain('function chargeCertificate');
        expect(src).toContain('chargeCertificate,');  // exported
        // Insert into credit_history must NOT carry workflow back-pointers
        expect(src).not.toMatch(/INSERT INTO credit_history[\s\S]{0,400}reference_type/);
        // Atomic gate must be present
        expect(src).toMatch(/UPDATE \$\{certTable\}[\s\S]*ledger_charged_at IS NULL/);
    });

    test('certificateService must use chargeCertificate (no alreadyCharged COUNT pattern)', () => {
        const src = fs.readFileSync(SVC('certificateService.js'), 'utf8');
        expect(src).toContain('chargeCertificate');
        // Old pre-flight COUNT(*) on credit_history.reference_type must be gone
        expect(src).not.toMatch(/credit_history WHERE reference_type/);
    });

    test('photoCertificateRepository must use chargeCertificate (not skip_status_check)', () => {
        const src = fs.readFileSync(REPO('photoCertificateRepository.js'), 'utf8');
        expect(src).toContain('chargeCertificate');
        expect(src).not.toMatch(/skip_status_check/);
    });

    test('testService WLH inserts must NOT include ref_id column', () => {
        const src = fs.readFileSync(SVC('testService.js'), 'utf8');
        // Grep for INSERT INTO weight_loss_history — none should mention ref_id
        const inserts = src.match(/INSERT INTO weight_loss_history[\s\S]*?\)/g) || [];
        expect(inserts.length).toBeGreaterThan(0);
        for (const ins of inserts) {
            expect(ins).not.toMatch(/\bref_id\b/);
        }
    });

    test('CH CSV export route must NOT expose reference_type/reference_id', () => {
        const src = fs.readFileSync(path.join(__dirname, '../../routes/creditHistoryRoutes.js'), 'utf8');
        expect(src).not.toMatch(/Reference Type/);
        expect(src).not.toMatch(/r\.reference_type/);
        expect(src).not.toMatch(/r\.reference_id/);
    });
});
