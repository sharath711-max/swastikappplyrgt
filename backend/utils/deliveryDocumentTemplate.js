const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})}`;

const formatWeight = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '-';
    return `${numeric.toFixed(3)} g`;
};

const formatPurity = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return 'Pending';
    return `${numeric.toFixed(2)}%`;
};

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const renderItemRows = (items) => items.map((item) => `
    <tr>
        <td>${escapeHtml(item.reference)}</td>
        <td>
            <div class="item-name">${escapeHtml(item.name)}</div>
            ${item.returned ? '<div class="badge">Returned sample</div>' : ''}
        </td>
        <td>${formatWeight(item.grossWeight)}</td>
        <td>${formatWeight(item.testWeight)}</td>
        <td>${formatWeight(item.netWeight)}</td>
        <td>${formatPurity(item.purity)}</td>
        <td>${formatCurrency(item.amount)}</td>
    </tr>
`).join('');

const renderPhotoStrip = (items) => {
    const photoItems = items
        .filter((item) => item.photoDataUri)
        .slice(0, 3)
        .map((item) => `
            <div class="photo-card">
                <img src="${item.photoDataUri}" alt="${escapeHtml(item.name)}">
                <span>${escapeHtml(item.reference)}</span>
            </div>
        `)
        .join('');

    if (!photoItems) return '';

    return `
        <div class="photo-strip">
            <h3>Captured Sample Images</h3>
            <div class="photo-grid">${photoItems}</div>
        </div>
    `;
};

const generateDeliveryDocumentHTML = ({ record, verifyUrl, generatedAt }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(record.autoNumber)} - Delivery Packet</title>
    <style>
        @page {
            size: A4;
            margin: 12mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #162033;
            background: #f4efe4;
            font-family: "Trebuchet MS", "Segoe UI", sans-serif;
        }

        .page {
            min-height: 262mm;
            padding: 14mm;
            background:
                radial-gradient(circle at top right, rgba(212, 175, 55, 0.18), transparent 28%),
                linear-gradient(180deg, #fffdfa 0%, #fff7eb 100%);
            border: 1.5mm solid #7a5c18;
            position: relative;
        }

        .page + .page {
            page-break-before: always;
        }

        .brand-ribbon {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            padding: 12px 14px;
            background: linear-gradient(135deg, #1f2937 0%, #7a5c18 100%);
            color: #fff8e7;
            border-radius: 16px;
        }

        .brand-ribbon h1,
        .brand-ribbon p {
            margin: 0;
        }

        .brand-ribbon h1 {
            font-size: 23px;
            letter-spacing: 1px;
        }

        .brand-ribbon p {
            margin-top: 4px;
            font-size: 12px;
            opacity: 0.92;
        }

        .stamp {
            min-width: 150px;
            padding: 12px;
            border: 1px solid rgba(255, 248, 231, 0.35);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.08);
            text-align: right;
        }

        .stamp-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            opacity: 0.8;
        }

        .stamp-value {
            margin-top: 6px;
            font-size: 18px;
            font-weight: 700;
        }

        .hero {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 1.3fr 0.7fr;
            gap: 16px;
        }

        .hero-card,
        .summary-card,
        .receipt-card,
        .table-card,
        .receipt-table-card {
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid rgba(122, 92, 24, 0.16);
            box-shadow: 0 14px 30px rgba(31, 41, 55, 0.08);
        }

        .hero-card {
            padding: 18px 20px;
        }

        .eyebrow {
            margin: 0 0 8px;
            color: #7a5c18;
            font-size: 12px;
            letter-spacing: 1.1px;
            text-transform: uppercase;
            font-weight: 700;
        }

        .hero-title {
            margin: 0;
            font-size: 30px;
            line-height: 1.08;
        }

        .hero-copy {
            margin: 12px 0 0;
            color: #475569;
            font-size: 14px;
            line-height: 1.5;
        }

        .summary-card {
            padding: 18px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 10px;
        }

        .summary-item {
            padding: 12px;
            border-radius: 14px;
            background: #fff8ec;
        }

        .summary-item span {
            display: block;
            color: #7c879a;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }

        .summary-item strong {
            font-size: 14px;
            line-height: 1.35;
        }

        .table-card,
        .receipt-table-card {
            margin-top: 18px;
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #1f2937;
            color: #fff;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 12px 14px;
        }

        td {
            padding: 12px 14px;
            border-bottom: 1px solid #e8ecf3;
            font-size: 13px;
            vertical-align: top;
        }

        tr:last-child td {
            border-bottom: none;
        }

        .item-name {
            font-weight: 700;
            margin-bottom: 4px;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 999px;
            background: #fef3c7;
            color: #92400e;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            font-weight: 700;
        }

        .footer-bar {
            margin-top: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 14px 18px;
            border-radius: 18px;
            background: #1f2937;
            color: #fff;
        }

        .footer-bar strong {
            display: block;
            font-size: 18px;
            margin-top: 6px;
        }

        .verify-block {
            text-align: right;
            max-width: 58%;
        }

        .verify-link {
            color: #fde68a;
            font-size: 12px;
            word-break: break-word;
        }

        .note-row {
            margin-top: 12px;
            color: #64748b;
            font-size: 11px;
            line-height: 1.5;
        }

        .photo-strip {
            margin-top: 18px;
            padding: 18px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid rgba(122, 92, 24, 0.16);
        }

        .photo-strip h3 {
            margin: 0 0 14px;
            font-size: 16px;
        }

        .photo-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .photo-card {
            border: 1px solid #e8ecf3;
            border-radius: 14px;
            padding: 10px;
            background: #fff;
        }

        .photo-card img {
            display: block;
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 8px;
        }

        .photo-card span {
            display: block;
            text-align: center;
            font-size: 11px;
            color: #64748b;
        }

        .receipt-layout {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 0.95fr 1.05fr;
            gap: 16px;
        }

        .receipt-card {
            padding: 18px;
        }

        .receipt-highlight {
            margin-top: 14px;
            padding: 16px;
            border-radius: 16px;
            background: linear-gradient(135deg, #7a5c18 0%, #b88918 100%);
            color: #fff;
        }

        .receipt-highlight .amount {
            display: block;
            margin-top: 6px;
            font-size: 28px;
            font-weight: 800;
        }

        .receipt-list {
            margin: 16px 0 0;
            padding: 0;
            list-style: none;
        }

        .receipt-list li {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px dashed #d8dee8;
            font-size: 13px;
        }

        .receipt-list li:last-child {
            border-bottom: none;
        }

        .receipt-copy {
            margin-top: 16px;
            font-size: 13px;
            line-height: 1.6;
            color: #475569;
        }

        .receipt-footer {
            margin-top: 18px;
            padding-top: 14px;
            border-top: 1px solid #e8ecf3;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-size: 12px;
            color: #64748b;
        }

        .security-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            padding: 8px 12px;
            border-radius: 999px;
            background: #eef6ff;
            color: #1d4ed8;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.6px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <section class="page">
        <div class="brand-ribbon">
            <div>
                <h1>SWASTIK GOLD AND SILVER LAB</h1>
                <p>Government approved testing and certification centre</p>
                <p>Customer delivery packet generated from the secured workflow completion pipeline</p>
            </div>
            <div class="stamp">
                <div class="stamp-label">Document Packet</div>
                <div class="stamp-value">${escapeHtml(record.label)}</div>
            </div>
        </div>

        <div class="hero">
            <div class="hero-card">
                <p class="eyebrow">Certified completion packet</p>
                <h2 class="hero-title">${escapeHtml(record.autoNumber)}</h2>
                <p class="hero-copy">
                    This packet combines the final certificate summary and a customer-facing receipt.
                    It is generated when the laboratory workflow card is moved to the DONE column.
                </p>
                <div class="security-chip">Secure digital issue</div>
            </div>

            <div class="summary-card">
                <p class="eyebrow">Customer and billing</p>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span>Customer</span>
                        <strong>${escapeHtml(record.customerName)}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Phone</span>
                        <strong>${escapeHtml(record.customerPhone)}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Issued</span>
                        <strong>${escapeHtml(formatDate(record.issueDate))}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Payment</span>
                        <strong>${escapeHtml(record.paymentMode)}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>Item</th>
                        <th>Gross</th>
                        <th>Test</th>
                        <th>Net</th>
                        <th>Purity</th>
                        <th>Charge</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderItemRows(record.items)}
                </tbody>
            </table>
        </div>

        ${renderPhotoStrip(record.items)}

        <div class="footer-bar">
            <div>
                <div>Total payable</div>
                <strong>${formatCurrency(record.totalAmount)}</strong>
            </div>
            <div class="verify-block">
                <div>Verify authenticity online</div>
                <div class="verify-link">${escapeHtml(verifyUrl)}</div>
            </div>
        </div>

        <div class="note-row">
            Generated at ${escapeHtml(formatDate(generatedAt))}. The signed delivery link used to access this PDF is time-bound, but the downloaded certificate remains valid once issued.
        </div>
    </section>

    <section class="page">
        <div class="brand-ribbon">
            <div>
                <h1>Customer Receipt</h1>
                <p>Branded completion receipt for secure phone delivery</p>
            </div>
            <div class="stamp">
                <div class="stamp-label">Receipt Ref</div>
                <div class="stamp-value">${escapeHtml(record.autoNumber)}</div>
            </div>
        </div>

        <div class="receipt-layout">
            <div class="receipt-card">
                <p class="eyebrow">Receipt summary</p>
                <div class="receipt-highlight">
                    Completion amount
                    <span class="amount">${formatCurrency(record.totalAmount)}</span>
                </div>

                <ul class="receipt-list">
                    <li><span>Document type</span><strong>${escapeHtml(record.label)}</strong></li>
                    <li><span>Payment mode</span><strong>${escapeHtml(record.paymentMode)}</strong></li>
                    <li><span>Item count</span><strong>${escapeHtml(String(record.items.length))}</strong></li>
                    <li><span>Customer phone</span><strong>${escapeHtml(record.customerPhone)}</strong></li>
                </ul>

                <div class="receipt-copy">
                    Thank you for choosing Swastik Lab. This receipt confirms that the laboratory process has been completed and the final certificate packet was digitally issued for customer delivery.
                </div>

                <div class="receipt-footer">
                    <span>Generated by workflow automation</span>
                    <span>${escapeHtml(formatDate(generatedAt))}</span>
                </div>
            </div>

            <div class="receipt-table-card">
                <table>
                    <thead>
                        <tr>
                            <th>Line</th>
                            <th>Description</th>
                            <th>Purity</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${record.items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(item.name)}</td>
                                <td>${formatPurity(item.purity)}</td>
                                <td>${formatCurrency(item.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</body>
</html>
`;

module.exports = {
    generateDeliveryDocumentHTML
};
