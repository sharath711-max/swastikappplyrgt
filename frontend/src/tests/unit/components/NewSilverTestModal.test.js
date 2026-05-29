import React from 'react';  // eslint-disable-line no-unused-vars
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import NewSilverTestModal from '../../../components/NewSilverTestModal';
import { ModalProvider } from '../../../contexts/ModalContext';

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockCustomers = [
    { id: 'CUS-001', name: 'Acme Jewellers', phone: '9876543210', balance: 1800 },
    { id: 'CUS-002', name: 'Beta Silver',    phone: '9123456780', balance: 0 },
];

const mockApiPost = jest.fn(() => Promise.resolve({ data: { success: true } }));
const mockApiGet  = jest.fn(() => Promise.resolve({ data: { data: mockCustomers } }));

jest.mock('../../../services/api', () => ({
    __esModule: true,
    default: {
        get : (...args) => mockApiGet(...args),
        post: (...args) => mockApiPost(...args),
    },
}));

const mockAddToast = jest.fn();
jest.mock('../../../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: (...args) => mockAddToast(...args) }),
}));

jest.mock('../../../utils/certificateGuard', () => ({
    __esModule: true,
    preventDuplicateCreate: () => true,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderModal = (props = {}) => {
    const onHide    = jest.fn();
    const onSuccess = jest.fn();
    const result = render(
        <ModalProvider>
            <NewSilverTestModal show={true} onHide={onHide} onSuccess={onSuccess} {...props} />
        </ModalProvider>
    );
    return { ...result, onHide, onSuccess };
};

const selectFirstCustomer = async (user) => {
    const search = screen.getByPlaceholderText(/search by name or phone/i);
    await user.type(search, 'Acme');
    const suggestion = await screen.findByText(/Acme Jewellers/i);
    await user.click(suggestion);
};

const getSampleRows = () =>
    Array.from(document.querySelectorAll('#sampleDetailsContainer .sampleDetails'));

const fillRow = async (user, rowIdx, { name, item, total, test }) => {
    const nameInputs  = screen.getAllByPlaceholderText('Name');
    const itemInputs  = screen.getAllByPlaceholderText('Item type');
    const totalInputs = screen.getAllByPlaceholderText('Total weight');
    const testInputs  = screen.getAllByPlaceholderText('Test weight');

    if (name !== undefined) {
        await user.clear(nameInputs[rowIdx]);
        if (name) await user.type(nameInputs[rowIdx], String(name));
    }
    if (item !== undefined) {
        await user.clear(itemInputs[rowIdx]);
        if (item) await user.type(itemInputs[rowIdx], String(item));
    }
    if (total !== undefined) {
        await user.clear(totalInputs[rowIdx]);
        if (total !== '' && total !== null) await user.type(totalInputs[rowIdx], String(total));
    }
    if (test !== undefined) {
        await user.clear(testInputs[rowIdx]);
        if (test !== '' && test !== null) await user.type(testInputs[rowIdx], String(test));
    }
};

const clickAddSampleBtn = async (user) => {
    const btn = document.querySelector('#addSampleBtn');
    await user.click(btn);
};

const clickSubmit = async (user) => {
    const btn = document.querySelector('#sampleDetailsSubmitBtn');
    await act(async () => { await user.click(btn); });
};

beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue({ data: { data: mockCustomers } });
    mockApiPost.mockResolvedValue({ data: { success: true } });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ST Modal — Group A: Row entry', () => {
    test('A1: Title shows "New Silver Test"', () => {
        renderModal();
        expect(screen.getByText(/new silver test/i)).toBeInTheDocument();
    });

    test('A2: Default state shows one empty row after customer select', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        expect(getSampleRows().length).toBe(1);
    });

    test('A3: Click + button adds a second row', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await clickAddSampleBtn(user);
        expect(getSampleRows().length).toBe(2);
    });

    test('A4: First row Sample Returned defaults to UNCHECKED (ST mirrors GT)', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        const returnedCheckbox = document.querySelector('#sampleDetailsContainer input[name="returned"]');
        expect(returnedCheckbox).not.toBeChecked();
    });

    test('A5: First row delete button is invisible when only one row exists', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        const rows = getSampleRows();
        expect(rows[0].querySelector('.deleteSampleDetailsBtn')).toHaveClass('invisible');
    });
});

describe('ST Modal — Group B: Row updates', () => {
    test('B1: Update each field on a row independently', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { name: 'Heirloom', item: 'Ring', total: '12.5', test: '0.3' });
        expect(screen.getByDisplayValue('Heirloom')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Ring')).toBeInTheDocument();
        expect(screen.getByDisplayValue('12.5')).toBeInTheDocument();
        expect(screen.getByDisplayValue('0.3')).toBeInTheDocument();
    });

    test('B2: Per-row Returned checkbox is independent', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await clickAddSampleBtn(user);

        const checkboxes = document.querySelectorAll('#sampleDetailsContainer input[name="returned"]');
        expect(checkboxes.length).toBe(2);
        await user.click(checkboxes[0]);
        expect(checkboxes[0]).toBeChecked();
        expect(checkboxes[1]).not.toBeChecked();
    });

    test('B3: Delete row removes the correct row, others intact', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '0.1' });
        await clickAddSampleBtn(user);
        await fillRow(user, 1, { item: 'Chain', total: '20', test: '0.2' });

        const rows = getSampleRows();
        await user.click(rows[0].querySelector('.deleteSampleDetailsBtn'));

        expect(getSampleRows().length).toBe(1);
        expect(screen.getByDisplayValue('Chain')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Ring')).not.toBeInTheDocument();
    });
});

describe('ST Modal — Group C: Submit flow', () => {
    test('C1: Submit before customer select → no submit button, no API call', () => {
        renderModal();
        expect(document.querySelector('#sampleDetailsSubmitBtn')).toBeNull();
        expect(mockApiPost).not.toHaveBeenCalled();
    });

    test('C2: Single valid row → POST /silver-tests with correct payload', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { name: 'Bracelet', item: 'Bangle', total: '25', test: '1.0' });
        await clickSubmit(user);

        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const [url, payload, opts] = mockApiPost.mock.calls[0];
        expect(url).toBe('/silver-tests');
        expect(payload.customer_id).toBe('CUS-001');
        expect(payload.items).toHaveLength(1);
        expect(payload.items[0]).toMatchObject({
            item_type:    'Bangle',
            item_name:    'Bracelet',
            gross_weight: 25,
            total_weight: 25,
            test_weight:  1.0,
            sample_weight:1.0,
            returned:     false,
        });
        expect(opts.headers['X-Request-Id']).toBeTruthy();
    });

    test('C3: Multi-row submit posts all rows as items array', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '0.5' });
        await clickAddSampleBtn(user);
        await fillRow(user, 1, { item: 'Chain', total: '20', test: '1.0' });
        await clickSubmit(user);

        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const [, payload] = mockApiPost.mock.calls[0];
        expect(payload.items).toHaveLength(2);
        expect(payload.items.map(i => i.item_type)).toEqual(['Ring', 'Chain']);
    });
});

describe('ST Modal — Group D: Validation', () => {
    test('D1: Empty item type → toast error, no API', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { total: '10', test: '0.5' });
        await clickSubmit(user);
        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(expect.stringMatching(/item type/i), 'error');
    });

    test('D2: Total weight 0 → blocks submit', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '0', test: '0' });
        await clickSubmit(user);
        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(expect.stringMatching(/total weight/i), 'error');
    });

    test('D3: Test weight > Total weight → blocks submit', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '15' });
        await clickSubmit(user);
        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(expect.stringMatching(/test weight.*cannot exceed/i), 'error');
    });
});

describe('ST Modal — Group E: Customer flow', () => {
    test('E1: AddCustomer block visible by default; SampleDetails hidden', () => {
        renderModal();
        expect(document.querySelector('#addCustomerBlock')).not.toBeNull();
        expect(document.querySelector('#sampleDetailsBlock')).toBeNull();
    });

    test('E2: Selecting customer hides AddCustomer and shows SampleDetails', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        expect(document.querySelector('#addCustomerBlock')).toBeNull();
        expect(document.querySelector('#sampleDetailsBlock')).not.toBeNull();
    });

    test('E3: Customer balance displayed after selection', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        const balanceInputs = document.querySelectorAll('input[disabled][readonly]');
        const balanceInput = Array.from(balanceInputs).find(el => el.value === '1800');
        expect(balanceInput).toBeTruthy();
    });

    test('E4: AddCustomer has Notes textarea', () => {
        renderModal();
        expect(document.querySelector('textarea[name="notes"]')).not.toBeNull();
    });

    test('E5: Phone has 10-digit constraints', () => {
        renderModal();
        const phoneInput = document.querySelector('input[name="phone"]');
        expect(phoneInput).toHaveAttribute('pattern', '[0-9]{10}');
        expect(phoneInput).toHaveAttribute('minLength', '10');
        expect(phoneInput).toHaveAttribute('maxLength', '10');
    });
});

describe('ST Modal — Group F: Edge cases', () => {
    test('F1: 20-row cap — + button disables at limit', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        for (let i = 0; i < 19; i++) await clickAddSampleBtn(user);
        expect(getSampleRows().length).toBe(20);
        expect(document.querySelector('#addSampleBtn')).toBeDisabled();
    }, 30000);

    test('F2: Date display is read-only', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        const dateInput = document.querySelector('#dateTimePicker');
        expect(dateInput).toHaveAttribute('readOnly');
        expect(dateInput.value).toContain(String(new Date().getFullYear()));
    });

    test('F3: Returned checkbox value flows to API payload', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '0.5' });
        const returnedCheckbox = document.querySelector('#sampleDetailsContainer input[name="returned"]');
        await user.click(returnedCheckbox);
        await clickSubmit(user);
        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const [, payload] = mockApiPost.mock.calls[0];
        expect(payload.items[0].returned).toBe(true);
    });
});
