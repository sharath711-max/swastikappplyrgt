const fs = require('fs');
const path = require('path');

function sqlEscape(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  if (typeof v === 'boolean') return v ? '1' : '0';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function fmtNumber(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  if (typeof v === 'number') return String(v);
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : 'NULL';
}

function safeParseData(s) {
  if (!s) return [];
  try { return JSON.parse(s); } catch (e) {
    // Try unescape then parse
    try { return JSON.parse(s.replace(/\\\"/g, '"')); } catch (e2) { return []; }
  }
}

function computeNet(gross, test) {
  const g = Number(gross) || 0;
  const t = Number(test) || 0;
  return g - t;
}

function computeFine(net, purity) {
  const n = Number(net) || 0;
  const p = Number(purity) || 0;
  return (n * p) / 100.0;
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const src = path.join(repoRoot, 'db_json', 'gold_certificate.json');
  const outDir = path.join(repoRoot, 'scripts', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'gold_certificate_migration.sql');

  const raw = fs.readFileSync(src, 'utf8');
  const records = JSON.parse(raw);

  const lines = [];
  lines.push('-- Generated migration SQL for gold_certificate → gold_certificate + gold_certificate_item');
  lines.push('PRAGMA foreign_keys = OFF;');
  lines.push('BEGIN TRANSACTION;');

  let parentCount = 0;
  let itemCount = 0;

  for (const rec of records) {
    parentCount++;
    const parentId = rec.id ? String(rec.id) : `OLD_GC_${parentCount}`;
    const created = rec.created || new Date().toISOString();
    const lastmodified = created;

    const autoNumber = rec.auto_number || null;
    const status = rec.status || null;
    const mode_of_payment = rec.mode_of_payment || null;
    const total = fmtNumber(rec.total);
    const gst = fmtNumber(rec.gst);
    const gst_bill_number = rec.gst_bill_number === undefined || rec.gst_bill_number === null ? 'NULL' : sqlEscape(rec.gst_bill_number);
    const total_tax = fmtNumber(rec.total_tax);
    const customer_id = rec.customer_id ? sqlEscape(rec.customer_id) : 'NULL';

    lines.push(`-- Parent ${parentCount} (${parentId})`);
    lines.push(
      `INSERT INTO gold_certificate (id, auto_number, customer_id, status, mode_of_payment, total, gst, gst_bill_number, total_tax, created, lastmodified) VALUES (${sqlEscape(parentId)}, ${autoNumber ? sqlEscape(autoNumber) : 'NULL'}, ${customer_id}, ${status ? sqlEscape(status) : 'NULL'}, ${mode_of_payment ? sqlEscape(mode_of_payment) : 'NULL'}, ${total}, ${gst}, ${gst_bill_number}, ${total_tax}, ${sqlEscape(created)}, ${sqlEscape(lastmodified)});`
    );

    const items = safeParseData(rec.data);
    let idx = 1;
    for (const it of items) {
      itemCount++;
      const itemId = `${parentId}_item_${idx}`;
      // certificate_number: use existing if present, otherwise generate per-parent sequence A001, A002...
      const certificate_number = it.certificate_number || `A${String(idx).padStart(3, '0')}`;
      // item_number must match DB column name; generate unique item_number per parent
      const item_number = `${parentId}_itm_${String(idx).padStart(3, '0')}`;
      const item_type = it.item || it.item_name || null;
      const gross_weight = fmtNumber(it.total_weight ?? it.gross_weight);
      const test_weight = fmtNumber(it.test_weight ?? 0);
      const net_weight_val = computeNet(Number(it.total_weight ?? it.gross_weight) || 0, Number(it.test_weight) || 0);
      const net_weight = fmtNumber(net_weight_val);
      const purity = fmtNumber(it.purity);
      const fine_weight = fmtNumber(computeFine(net_weight_val, it.purity));
      const rate_per_gram = it.rate_per_gram !== undefined ? fmtNumber(it.rate_per_gram) : 'NULL';
      const item_total = it.total !== undefined ? fmtNumber(it.total) : 'NULL';
      const returned = (it.returned || false) ? '1' : '0';

      lines.push(`-- Item ${itemCount} for parent ${parentId}`);
      lines.push(`INSERT INTO gold_certificate_item (id, item_number, gold_certificate_id, certificate_number, item_type, gross_weight, test_weight, net_weight, purity, rate_per_gram, fine_weight, item_total, returned, created) VALUES (${sqlEscape(itemId)}, ${sqlEscape(item_number)}, ${sqlEscape(parentId)}, ${certificate_number ? sqlEscape(certificate_number) : 'NULL'}, ${item_type ? sqlEscape(item_type) : 'NULL'}, ${gross_weight}, ${test_weight}, ${net_weight}, ${purity}, ${rate_per_gram}, ${fine_weight}, ${item_total}, ${returned}, ${sqlEscape(created)});`);

      idx++;
    }
  }

  lines.push('COMMIT;');
  lines.push('PRAGMA foreign_keys = ON;');

  fs.writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${outFile} — ${parentCount} parents, ${itemCount} items`);
}

main().catch(err => { console.error(err); process.exit(1); });
