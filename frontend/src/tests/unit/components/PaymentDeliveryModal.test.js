import React from 'react';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentDeliveryModal from '../../../components/PaymentDeliveryModal';

jest.mock('../../../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: jest.fn() })
}));

jest.mock('../../../contexts/ModalContext', () => ({
    useModal: () => ({ openModal: jest.fn() })
}));

jest.mock('../../../services/api', () => ({
    get: jest.fn(),
    post: jest.fn()
}));

const api = require('../../../services/api').default || require('../../../services/api');

describe('PaymentDeliveryModal state sync and regressions', () => {
    beforeEach(() => {
        api.get.mockResolvedValue({
            data: {
                success: true,
                data: {
                    id: 'GT123',
                    customer_name: 'Test Customer',
                    mode_of_payment: 'Cash',
                    total: 1000,
                    items: [
                        { id: 1, item_type: 'Ring', purity: 90, sample_weight: 10, returned: false }
                    ]
                }
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('resets state when modal is closed and reopened', async () => {
        const props = {
            onHide: jest.fn(),
            onSuccess: jest.fn(),
            testId: 'GT123',
            show: true
        };

        const { rerender } = render(<PaymentDeliveryModal {...props} />);

        // Wait for modal to render and fetch data
        await waitFor(() => {
            expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
        });

        // Close modal
        rerender(<PaymentDeliveryModal {...props} show={false} />);
        
        // Change mock to return different data to verify refetch occurs on reopen
        api.get.mockResolvedValueOnce({
            data: {
                success: true,
                data: {
                    id: 'GT123',
                    customer_name: 'New Customer',
                    mode_of_payment: 'UPI',
                    total: 2000,
                    items: [
                        { id: 1, item_type: 'Ring', purity: 95, sample_weight: 10, returned: false }
                    ]
                }
            }
        });

        // Reopen modal
        rerender(<PaymentDeliveryModal {...props} show={true} />);

        await waitFor(() => {
            expect(screen.getByText(/New Customer/i)).toBeInTheDocument();
        });
        
        // Assert that the new amount and payment mode is populated
        expect(screen.getByDisplayValue('2000.00')).toBeInTheDocument();
        expect(screen.getByDisplayValue('UPI')).toBeInTheDocument();
    });

    test('validates purity inputs properly', async () => {
        const props = {
            onHide: jest.fn(),
            onSuccess: jest.fn(),
            testId: 'GT123',
            show: true
        };

        render(<PaymentDeliveryModal {...props} />);

        await waitFor(() => {
            expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
        });
        
        // Wait till purity input renders
        const purityInput = await screen.findByDisplayValue('90');
        expect(purityInput).toBeInTheDocument();

        // Change to invalid purity
        fireEvent.change(purityInput, { target: { value: '150' } });

        const saveButton = screen.getByText(/Save Draft/i).closest('button');
        fireEvent.click(saveButton);

        // Toast should be called because invalid purity
        const { useToast } = require('../../../contexts/ToastContext');
        const { addToast } = useToast();
        expect(addToast).toHaveBeenCalledWith(expect.stringContaining('valid purity'), 'error');
    });
});
