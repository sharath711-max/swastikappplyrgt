import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Phase2Modal from '../../../components/Phase2Modal';
import { ModalProvider } from '../../../contexts/ModalContext';
import { PrintProvider } from '../../../contexts/PrintContext';

// Mock context and services
jest.mock('../../../services/api', () => ({
    __esModule: true,
    default: {
        get  : jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
        post : jest.fn(() => Promise.resolve({ data: { success: true } })),
        patch: jest.fn(() => Promise.resolve({ data: { success: true } })),
        defaults: { baseURL: 'http://localhost:6001/api' },
    },
    post : jest.fn(() => Promise.resolve({ data: { success: true } })),
    patch: jest.fn(() => Promise.resolve({ data: { success: true } })),
    defaults: { baseURL: 'http://localhost:6001/api' }
}));

jest.mock('../../../contexts/ToastContext', () => ({
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

const renderModal = (props = {}) => render(
    <PrintProvider>
        <ModalProvider>
            <Phase2Modal show={true} onHide={() => { }} test={mockRecord} {...props} />
        </ModalProvider>
    </PrintProvider>
);

describe('Pillar 2: Integration Testing - Technician Testing & WLH (Phase2Modal)', () => {
    test('Negative Case: Error shows when Returned + Test weight exceeds Intake', async () => {
        renderModal();

        // Input Test Weight: 0.500
        const testInput = screen.getByTestId('item-test-weight');
        fireEvent.change(testInput, { target: { value: '0.500' } });

        // Input Returned Weight: 10.000 (Total 10.500 > 10.000 Intake)
        const netInput = screen.getByTestId('item-net-weight');
        fireEvent.change(netInput, { target: { value: '10.000' } });

        // Input Purity to pass first validation
        const purityInput = screen.getByTestId('item-purity');
        fireEvent.change(purityInput, { target: { value: '91.60' } });

        // Submit — Python parity: "Save" = draft (no validation); validation runs on "Delivered" (IN_PROGRESS → DONE submit).
        const submitButton = document.querySelector('#paymentSubmitBtn');
        expect(submitButton).not.toBeNull();
        fireEvent.click(submitButton);

        // Validation message: "Overweight — Test + Returned exceeds intake"
        expect(await screen.findByText(/exceeds intake|cannot exceed/i)).toBeInTheDocument();
    });

    test('Positive Case (Zero Loss): Successfully saves without triggering specific WLH alerts', async () => {
        renderModal();

        fireEvent.change(screen.getByTestId('item-test-weight'), { target: { value: '0.500' } });
        fireEvent.change(screen.getByTestId('item-net-weight'), { target: { value: '9.500' } });
        fireEvent.change(screen.getByTestId('item-purity'), { target: { value: '91.6' } });

        // Should NOT see "Weight Loss Detected" in the summary alert
        expect(screen.queryByText(/Weight Loss Detected/i)).not.toBeInTheDocument();
    });

    test('Positive Case (With Loss): Triggers Weight Loss History Alert when discrepancy > 0.001', async () => {
        renderModal();

        fireEvent.change(screen.getByTestId('item-test-weight'), { target: { value: '0.500' } });
        fireEvent.change(screen.getByTestId('item-net-weight'), { target: { value: '9.200' } }); // 10.0 - (0.5+9.2) = 0.300 loss

        // Assert Alert presence
        expect(await screen.findByText(/Weight Loss Detected/i)).toBeInTheDocument();

        // Ensure "Categorize Loss" button is present and opens modal
        const auditBtn = await screen.findByText(/Categorize Loss/i);
        expect(auditBtn).toBeInTheDocument();
    });
});

describe('Phase2Modal — mode_of_payment off-list clamp (regression guard)', () => {
    test('off-list "Pending" from draft is clamped to Cash so dropdown matches state', () => {
        const draftWithPending = {
            ...mockRecord,
            status: 'IN_PROGRESS',
            total: 500,
            mode_of_payment: 'Pending',  // ← off-list value previously caused dropdown/state drift
        };

        render(
            <PrintProvider>
                <ModalProvider>
                    <Phase2Modal show={true} onHide={() => { }} test={draftWithPending} />
                </ModalProvider>
            </PrintProvider>
        );

        // Find the Mode <select> — there is exactly one in the modal footer
        const selects = document.querySelectorAll('select');
        const modeSelect = Array.from(selects).find((s) =>
            Array.from(s.options).some((o) => o.value === 'Cash')
        );
        expect(modeSelect).toBeTruthy();

        // After clamp: state is "Cash" → visible option is "Cash" → POST will send "Cash"
        // Without the clamp, modeSelect.value would have been "Pending" while DOM showed "Cash"
        expect(modeSelect.value).toBe('Cash');
        expect(modeSelect.options[modeSelect.selectedIndex].text).toBe('Cash');
    });

    test('valid value "UPI" from draft is preserved (not clobbered to Cash)', () => {
        const draftWithUpi = {
            ...mockRecord,
            status: 'IN_PROGRESS',
            total: 500,
            mode_of_payment: 'UPI',
        };

        render(
            <PrintProvider>
                <ModalProvider>
                    <Phase2Modal show={true} onHide={() => { }} test={draftWithUpi} />
                </ModalProvider>
            </PrintProvider>
        );

        const selects = document.querySelectorAll('select');
        const modeSelect = Array.from(selects).find((s) =>
            Array.from(s.options).some((o) => o.value === 'UPI')
        );
        expect(modeSelect.value).toBe('UPI');
    });
});
