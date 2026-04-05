import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoldTest from '../../../pages/GoldTest';

jest.mock('../../../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: jest.fn() })
}));

jest.mock('../../../components/NewGoldTestModal', () => () => null);
jest.mock('../../../components/PaymentDeliveryModal', () => () => null);

jest.mock('../../../services/api', () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
}));

const api = require('../../../services/api').default || require('../../../services/api');

const todoCard = {
    id: 'GT-001',
    auto_number: 'GT-001',
    customer_name: 'Asha',
    created_at: '2026-04-04T00:00:00.000Z',
    item_count: 1,
    total_weight: '10.00',
    status: 'TODO'
};

const detailRecord = {
    id: 'GT-001',
    customer_name: 'Asha',
    created_at: '2026-04-04T00:00:00.000Z',
    total: 0,
    mode_of_payment: 'Cash',
    items: [{
        id: 'GTI-001',
        item_type: 'Ring',
        item_no: '001',
        gross_weight: 10,
        test_weight: 0.5,
        net_weight: 9.5,
        purity: ''
    }]
};

describe('GoldTest page modal selection', () => {
    beforeEach(() => {
        api.get.mockImplementation((url) => {
            if (url.includes('status = TODO')) {
                return Promise.resolve({ data: { success: true, data: [todoCard] } });
            }

            if (url.includes('status = IN_PROGRESS') || url.includes('status = DONE')) {
                return Promise.resolve({ data: { success: true, data: [] } });
            }

            if (url === '/gold-tests/GT-001') {
                return Promise.resolve({ data: { success: true, data: detailRecord } });
            }

            return Promise.resolve({ data: { success: true, data: [] } });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('reopens the TODO card modal for the same test id without requiring a refresh', async () => {
        render(<GoldTest />);

        const card = await screen.findByText('Asha');

        fireEvent.click(card);

        await waitFor(() => {
            expect(screen.getByText(/Add Test Results/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Close'));

        await waitFor(() => {
            expect(screen.queryByText(/Add Test Results/i)).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Asha'));

        await waitFor(() => {
            expect(screen.getByText(/Add Test Results/i)).toBeInTheDocument();
        });
    });
});
