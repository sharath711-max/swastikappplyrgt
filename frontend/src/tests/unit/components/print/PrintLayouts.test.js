import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThermalReceipt from '../../../../components/print/ThermalReceipt';
import PhotoCertificate from '../../../../components/print/PhotoCert';

describe('Pillar 4: Visual/DOM Testing - Print Outputs', () => {
    const mockTest = {
        id: 'GTS-20220704-042',
        customer_name: 'JAGANATH',
        created_at: Date.now(),
        bill_number: 'SW-123'
    };
    const mockItem = {
        id: 'GTI-1',
        item_no: '001',
        item_type: 'Gatti',
        gross_weight: 15.650,
        test_weight: 0.500,
        net_weight: 15.150,
        purity: 91.6,
        show_kt: true
    };

    const buildSnapshot = (overrides = {}) => ({
        lab: { name: 'Swastik Assayers' },
        receipt: { number: '17', createdAt: '2026-04-16T13:21:00Z', type: 'GT', status: 'PENDING', ...overrides },
        customer: { name: 'JAGANATH', phone: '+919999999999' },
        items: [{ id: 'GTI-1', name: 'Gatti', weight: 15.650, sampleWeight: 0.500, amount: 30 }],
        totals: { total: 30 },
    });

    test('Thermal Layout: renders branded wrapper, customer, grand total, thank-you (identical for ongoing & final)', () => {
        const { container } = render(<ThermalReceipt snapshot={buildSnapshot()} />);

        expect(container.querySelector('.thermal-receipt-wrapper')).toBeInTheDocument();
        expect(screen.getByText('Swastik Assayers')).toBeInTheDocument();
        expect(screen.getByText('JAGANATH')).toBeInTheDocument();
        expect(screen.getByText('Grand Total')).toBeInTheDocument();
        expect(screen.getByText('Thank you for your business!')).toBeInTheDocument();
        // Status banner & draft disclaimer must NOT exist (Python parity).
        expect(screen.queryByTestId('tr-status')).toBeNull();
        expect(screen.queryByTestId('tr-disclaimer')).toBeNull();
    });

    test('Thermal Layout: invoice number renders zero-padded 3-digit, prefix stripped', () => {
        render(<ThermalReceipt snapshot={buildSnapshot({ number: 'GT26-17' })} />);
        expect(screen.getByText('017')).toBeInTheDocument();
    });

    test('Thermal Layout: receipt type code maps to readable operational label', () => {
        render(<ThermalReceipt snapshot={buildSnapshot({ type: 'GT' })} />);
        expect(screen.getByText('Gold Testing')).toBeInTheDocument();
    });

    test('A4 Positioning: Verify PhotoCertificate positioning and dynamic field overlay', () => {
        // Mount PhotoCert with a dummy photo
        const { container } = render(<PhotoCertificate test={mockTest} item={mockItem} photos={['mock-photo.jpg']} />);

        const mainContainer = container.querySelector('.pc-certificate-container');
        // In a real browser, the stylesheet provides width/height based on @media print.
        // For JSDOM, we just verify the container structure holds up.
        expect(mainContainer).toBeInTheDocument();

        // Assert for dynamic field overlay (Name, Date, Case Ref)
        // In physical print mode, these must be visible to correctly overlay onto stationery
        expect(screen.getByText(/JAGANATH/i)).toBeInTheDocument();
        expect(screen.getByText(/001/i)).toBeInTheDocument(); // itemRefNum
        expect(screen.getByText(/91.60%/i)).toBeInTheDocument();

        // Verify specifically for "Absolute Positioning" cues in the DOM if we apply them
        const photos = container.querySelector('.pos-jewel-photo');
        expect(photos).toBeInTheDocument();

        // User's High-fidelity PC classes check
        expect(container.querySelector('.pos-result-pct')).toBeInTheDocument();
    });
});
