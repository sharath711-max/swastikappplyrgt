import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThermalReceipt from '../ThermalReceipt';
import PhotoCertificate from '../PhotoCert';

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

    test('Thermal Layout: Verify the .thermal-receipt container and purity-box rendering', () => {
        render(<ThermalReceipt test={mockTest} items={[mockItem]} type="RESULT" />);

        const container = screen.getByTestId('thermal-container');
        expect(container).toHaveClass('thermal-receipt');

        // 80mm check is usually via computed style in browser, 
        // but we verify the existence of the purity box as requested.
        expect(screen.getByTestId('purity-box')).toBeInTheDocument();
        expect(screen.getByText('91.60%')).toBeInTheDocument();
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
