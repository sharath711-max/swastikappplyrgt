/**
 * Swastik Gold & Silver Testing Lab
 * Professional Certificate Template (Print-Optimized HTML)
 */

const generateCertificateHTML = (data) => {
    const { certificate_no, issue_date, customer, items, total_weight, total_amount, photo_path, certificate_type } = data;
    const isGold = certificate_type.toLowerCase() === 'gold';
    const primaryColor = isGold ? '#D4AF37' : '#C0C0C0'; // Gold or Silver
    const secondaryColor = '#1a1a1a';

    const dateFormatted = new Date(issue_date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    const itemsHTML = items.map(item => `
        <tr>
            <td>${item.item_name}</td>
            <td>${item.weight}g</td>
            <td>${item.purity}%</td>
            <td>${item.carat || '-'}</td>
            <td class="text-right">₹${item.amount.toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${certificate_no}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        
        :root {
            --primary: ${primaryColor};
            --secondary: ${secondaryColor};
            --bg: #ffffff;
        }

        body {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: var(--secondary);
        }

        .certificate-container {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 10mm auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            position: relative;
            box-sizing: border-box;
            border: 15px solid var(--primary);
            outline: 2px solid var(--secondary);
            outline-offset: -10px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            margin: 0;
            font-size: 32px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--primary);
        }

        .header p {
            margin: 5px 0;
            font-size: 14px;
            opacity: 0.8;
        }

        .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            font-size: 16px;
        }

        .meta-info div b {
            display: block;
            font-size: 12px;
            color: var(--primary);
            text-transform: uppercase;
        }

        .photo-section {
            float: right;
            width: 200px;
            height: 200px;
            border: 2px solid var(--primary);
            margin-left: 20px;
            margin-bottom: 20px;
            background: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .photo-section img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }

        .details-table th {
            background: var(--primary);
            color: white;
            text-align: left;
            padding: 12px;
            font-weight: 600;
        }

        .details-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }

        .text-right { text-align: right; }

        .totals {
            margin-top: 20px;
            border-top: 2px solid var(--secondary);
            padding-top: 10px;
        }

        .total-row {
            display: flex;
            justify-content: flex-end;
            gap: 50px;
            font-size: 18px;
            font-weight: 600;
        }

        .footer {
            position: absolute;
            bottom: 40mm;
            left: 20mm;
            right: 20mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .signature {
            text-align: center;
            width: 150px;
        }

        .signature-line {
            border-top: 1px solid var(--secondary);
            margin-top: 50px;
            padding-top: 5px;
            font-size: 14px;
        }

        .seal {
            width: 80px;
            height: 80px;
            border: 3px double var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            color: var(--primary);
            transform: rotate(-15deg);
        }

        @media print {
            body { background: none; }
            .certificate-container { 
                margin: 0; 
                box-shadow: none;
                width: 100%;
            }
            .no-print { display: none; }
        }

        .no-print-toolbar {
            background: #333;
            color: white;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .btn-print {
            background: var(--primary);
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="no-print no-print-toolbar">
        <span>Previewing Certificate: <b>${certificate_no}</b></span>
        <button class="btn-print" onclick="window.print()">Print Certificate</button>
    </div>

    <div class="certificate-container">
        <div class="header">
            <h1>SWASTIK GOLD & SILVER LAB</h1>
            <p>Government Approved Testing & Certification Centre</p>
            <p>123 Jewelers Market, Mumbai | Phone: +91 98765 43210</p>
        </div>

        <div class="meta-info">
            <div>
                <b>Certificate No.</b>
                ${certificate_no}
            </div>
            <div>
                <b>Date of Issue</b>
                ${dateFormatted}
            </div>
            <div style="text-align: right;">
                <b>Customer Name</b>
                ${customer.name}
                <br>
                <small>${customer.phone}</small>
            </div>
        </div>

        ${photo_path ? `
            <div class="photo-section">
                <img src="${photo_path}" alt="Sample Photo">
            </div>
        ` : ''}

        <div style="min-height: 400px;">
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Weight</th>
                        <th>Purity</th>
                        <th>Carat</th>
                        <th class="text-right">Testing Charges</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div class="totals">
                <div class="total-row">
                    <span>Total Weight: <b>${total_weight}g</b></span>
                    <span>Total Amount: <b>₹${total_amount.toLocaleString('en-IN')}</b></span>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="signature">
                <div class="signature-line">Lab Technician</div>
            </div>
            <div class="seal">
                SWASTIK<br>LABS<br>VERIFIED
            </div>
            <div class="signature">
                <div class="signature-line">Authorized Signatory</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { generateCertificateHTML };
