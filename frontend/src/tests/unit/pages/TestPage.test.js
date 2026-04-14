import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TestPage from '../../../pages/TestPage';

const mockAddToast = jest.fn();

jest.mock('../../../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: mockAddToast }),
}));

jest.mock('../../../components/NewGoldTestModal',   () => () => null);
jest.mock('../../../components/NewSilverTestModal', () => () => null);

jest.mock('../../../services/api', () => ({
    get:   jest.fn(),
    post:  jest.fn(),
    patch: jest.fn(),
}));

const api = require('../../../services/api');

const todoItem = {
    id: 'GTS-001', auto_number: 'GT24-001',
    customer_name: 'Asha', status: 'TODO',
    total: 0, mode_of_payment: 'Cash', type: 'gold',
};

const detailRecord = {
    id: 'GTS-001', customer_name: 'Asha',
    total: 0, mode_of_payment: 'Cash',
    items: [{
        id: 'GTI-001', item_type: 'Ring',
        gross_weight: 10, test_weight: 0.5,
        purity: 91, returned: false,
    }],
};

function renderTestPage(props = {}) {
    return render(
        <MemoryRouter>
            <TestPage
                title="Gold Tests"
                endpoint="gold-tests"
                print="gold-certificate"
                modalType="gold"
                {...props}
            />
        </MemoryRouter>
    );
}

describe('TestPage', () => {
    beforeEach(() => {
        jest.spyOn(window, 'open').mockReturnValue({ location: {}, close: jest.fn() });
        api.get.mockImplementation(url => {
            if (url === '/gold-tests')
                return Promise.resolve({ data: { success: true, data: [todoItem] } });
            if (url === '/gold-tests/GTS-001')
                return Promise.resolve({ data: { success: true, data: detailRecord } });
            return Promise.resolve({ data: { success: true, data: [] } });
        });
    });

    afterEach(() => jest.clearAllMocks());

    test('renders the page title', async () => {
        renderTestPage();
        expect(await screen.findByText('Gold Tests')).toBeInTheDocument();
    });

    test('loads and displays test records', async () => {
        renderTestPage();
        expect(await screen.findByText('GT24-001')).toBeInTheDocument();
        expect(screen.getByText('Asha')).toBeInTheDocument();
    });

    test('finalize button absent on DONE records', async () => {
        api.get.mockResolvedValueOnce({ data: { success: true, data: [{ ...todoItem, status: 'DONE' }] } });
        renderTestPage();
        await screen.findByText('GT24-001');
        expect(screen.queryByText('Finalize')).not.toBeInTheDocument();
    });

    test('finalize shows success toast and reloads', async () => {
        api.post.mockResolvedValueOnce({
            data: { success: true, data: { certificate: null }, meta: { idempotent: false } },
        });
        renderTestPage();
        const btn = await screen.findByText('Finalize');
        fireEvent.click(btn);
        await waitFor(() =>
            expect(mockAddToast).toHaveBeenCalledWith('Finalized successfully', 'success')
        );
    });

    test('idempotent finalize shows "Already processed" toast — silver meta path', async () => {
        const silverItem = { ...todoItem, id: 'STS-001' };
        api.get.mockImplementation(url => {
            if (url === '/silver-tests')
                return Promise.resolve({ data: { success: true, data: [silverItem] } });
            if (url === '/silver-tests/STS-001')
                return Promise.resolve({ data: { success: true, data: { ...detailRecord, id: 'STS-001' } } });
            return Promise.resolve({ data: { success: true, data: [] } });
        });
        api.post.mockResolvedValueOnce({
            data: { success: true, data: {}, meta: { idempotent: true } },
        });
        renderTestPage({
            endpoint: 'silver-tests', print: 'silver-certificate',
            modalType: 'silver', title: 'Silver Tests',
        });
        await screen.findByText('Finalize');
        fireEvent.click(screen.getByText('Finalize'));
        await waitFor(() =>
            expect(mockAddToast).toHaveBeenCalledWith('Already processed', 'info')
        );
    });
});
