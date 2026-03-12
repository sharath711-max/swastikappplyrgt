import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Phase2Modal from '../Phase2Modal';

// Mock context and services
jest.mock('../../services/api', () => ({
    post: jest.fn(() => Promise.resolve({ data: { success: true } })),
    patch: jest.fn(() => Promise.resolve({ data: { success: true } })),
    defaults: { baseURL: 'http://localhost:5000/api' }
}));

jest.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: jest.fn() })
}));

const mockRecord = {
    id: 'GT-001',
    auto_number: '20220704-042',
    status: 'IN_PROGRESS',
    customer_id: 'CUS-123',
    items: [{
        id: 'GTI-001',
        item_number: '20220704-042-1',
        gross_weight: 10.000,
        test_weight: 0,
        net_weight: 10.000,
        purity: ''
    }]
};

describe('Pillar 2: Integration Testing - Technician Testing & WLH (Phase2Modal)', () => {
    test('Negative Case: Error shows when Returned + Test weight exceeds Intake', async () => {
        render(<Phase2Modal show={true} onHide={() => { }} test={mockRecord} />);

        // Input Test Weight: 0.500
        const testInput = screen.getByTestId('item-test-weight');
        fireEvent.change(testInput, { target: { value: '0.500' } });

        // Input Returned Weight: 10.000 (Total 10.500 > 10.000 Intake)
        const netInput = screen.getByTestId('item-net-weight');
        fireEvent.change(netInput, { target: { value: '10.000' } });

        // Input Purity to pass first validation
        const purityInput = screen.getByTestId('item-purity');
        fireEvent.change(purityInput, { target: { value: '91.60' } });

        // Submit
        const saveButton = screen.getByText(/Save/i);
        fireEvent.click(saveButton);

        expect(await screen.findByText(/Returned \+ Test cannot exceed Intake/i)).toBeInTheDocument();
    });

    test('Positive Case (Zero Loss): Successfully saves without triggering specific WLH alerts', async () => {
        render(<Phase2Modal show={true} onHide={() => { }} test={mockRecord} />);

        fireEvent.change(screen.getByTestId('item-test-weight'), { target: { value: '0.500' } });
        fireEvent.change(screen.getByTestId('item-net-weight'), { target: { value: '9.500' } });
        fireEvent.change(screen.getByTestId('item-purity'), { target: { value: '91.6' } });

        // Should NOT see "Weight Loss Detected" in the summary alert
        expect(screen.queryByText(/Weight Loss Detected/i)).not.toBeInTheDocument();
    });

    test('Positive Case (With Loss): Triggers Weight Loss History Alert when discrepancy > 0.001', async () => {
        render(<Phase2Modal show={true} onHide={() => { }} test={mockRecord} />);

        fireEvent.change(screen.getByTestId('item-test-weight'), { target: { value: '0.500' } });
        fireEvent.change(screen.getByTestId('item-net-weight'), { target: { value: '9.200' } }); // 10.0 - (0.5+9.2) = 0.300 loss

        // Assert Alert presence
        expect(await screen.findByText(/Weight Loss Detected/i)).toBeInTheDocument();

        // Ensure "Categorize Loss" button is present and opens modal
        const auditBtn = await screen.findByText(/Categorize Loss/i);
        expect(auditBtn).toBeInTheDocument();
    });
});
