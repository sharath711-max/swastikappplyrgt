import React from 'react';  // eslint-disable-line no-unused-vars
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import NewGoldTestModal from '../../../components/NewGoldTestModal';
import { ModalProvider } from '../../../contexts/ModalContext';

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockCustomers = [
    { id: 'CUS-001', name: 'Acme Jewellers', phone: '9876543210', balance: 1500 },
    { id: 'CUS-002', name: 'Beta Gold',      phone: '9123456780', balance: 0 },
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
            <NewGoldTestModal show={true} onHide={onHide} onSuccess={onSuccess} {...props} />
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

// ── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue({ data: { data: mockCustomers } });
    mockApiPost.mockResolvedValue({ data: { success: true } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP A — ROW ENTRY (Python-style multi-row inline)
// ─────────────────────────────────────────────────────────────────────────────

describe('GT Modal — Group A: Row entry (multi-row inline)', () => {
    test('A1: Default state shows one empty row after customer select', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        const rows = getSampleRows();
        expect(rows.length).toBe(1);
    });

    test('A2: Click + button adds a second row', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        await clickAddSampleBtn(user);

        const rows = getSampleRows();
        expect(rows.length).toBe(2);
    });

    test('A3: First row delete button is invisible when only one row exists', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        const rows = getSampleRows();
        const deleteBtn = rows[0].querySelector('.deleteSampleDetailsBtn');
        expect(deleteBtn).toHaveClass('invisible');
    });

    test('A4: After adding a second row, both delete buttons are visible', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await clickAddSampleBtn(user);

        const rows = getSampleRows();
        expect(rows[0].querySelector('.deleteSampleDetailsBtn')).not.toHaveClass('invisible');
        expect(rows[1].querySelector('.deleteSampleDetailsBtn')).not.toHaveClass('invisible');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP B — ROW UPDATES
// ─────────────────────────────────────────────────────────────────────────────

describe('GT Modal — Group B: Row updates', () => {
    test('B1: Update each field on a row independently', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        await fillRow(user, 0, { name: 'Wedding ring', item: 'Ring', total: '10.5', test: '0.2' });

        expect(screen.getByDisplayValue('Wedding ring')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Ring')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10.5')).toBeInTheDocument();
        expect(screen.getByDisplayValue('0.2')).toBeInTheDocument();
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

        const rowsBefore = getSampleRows();
        const deleteBtn0 = rowsBefore[0].querySelector('.deleteSampleDetailsBtn');
        await user.click(deleteBtn0);

        const rowsAfter = getSampleRows();
        expect(rowsAfter.length).toBe(1);
        // Chain row survived
        expect(screen.getByDisplayValue('Chain')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Ring')).not.toBeInTheDocument();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP C — SUBMIT FLOW
// ─────────────────────────────────────────────────────────────────────────────

describe('GT Modal — Group C: Submit flow', () => {
    test('C1: Submit without customer selected → toast error, no API call', async () => {
        const user = userEvent.setup();
        renderModal();
        // Sample block isn't visible until customer selected — so submit button isn't rendered.
        // Verify by checking submit btn doesn't exist:
        expect(document.querySelector('#sampleDetailsSubmitBtn')).toBeNull();
        expect(mockApiPost).not.toHaveBeenCalled();
        // (suppress unused warning)
        expect(user).toBeTruthy();
    });

    test('C2: Single valid row submit → POST /gold-tests with correct payload', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { name: 'Wedding ring', item: 'Ring', total: '10', test: '0.5' });

        await clickSubmit(user);

        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const [url, payload, opts] = mockApiPost.mock.calls[0];
        expect(url).toBe('/gold-tests');
        expect(payload.customer_id).toBe('CUS-001');
        expect(payload.items).toHaveLength(1);
        expect(payload.items[0]).toMatchObject({
            item_type:    'Ring',
            item_name:    'Wedding ring',
            description:  'Wedding ring',
            gross_weight: 10,
            total_weight: 10,
            test_weight:  0.5,
            sample_weight:0.5,
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
        await clickAddSampleBtn(user);
        await fillRow(user, 2, { item: 'Earring', total: '5', test: '0.1' });

        await clickSubmit(user);

        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const [, payload] = mockApiPost.mock.calls[0];
        expect(payload.items).toHaveLength(3);
        expect(payload.items.map(i => i.item_type)).toEqual(['Ring', 'Chain', 'Earring']);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP D — VALIDATION (Python-style: on Submit, all rows checked)
// ─────────────────────────────────────────────────────────────────────────────

describe('GT Modal — Group D: Validation', () => {
    test('D1: Empty item type on first row → toast error, no API call', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        // Fill weight but leave item type empty
        await fillRow(user, 0, { total: '10', test: '0.5' });

        await clickSubmit(user);

        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(
            expect.stringMatching(/item type/i),
            'error'
        );
    });

    test('D2: Total weight 0 → validation blocks submit', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '0', test: '0' });

        await clickSubmit(user);

        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(
            expect.stringMatching(/total weight/i),
            'error'
        );
    });

    test('D3: Test weight > Total weight → validation blocks submit', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '15' });

        await clickSubmit(user);

        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(
            expect.stringMatching(/test weight.*cannot exceed/i),
            'error'
        );
    });

    test('D4: Invalid row marked with is-invalid class on the offending field', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { total: '10', test: '0.5' });   // no item type

        await clickSubmit(user);

        const rows = getSampleRows();
        const itemInput = rows[0].querySelector('input[name="item"]');
        expect(itemInput).toHaveClass('is-invalid');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP E — CUSTOMER FLOW
// ─────────────────────────────────────────────────────────────────────────────

describe('GT Modal — Group E: Customer flow', () => {
    test('E1: Selecting customer hides AddCustomer block and shows SampleDetails', async () => {
        const user = userEvent.setup();
        renderModal();

        // Initially: AddCustomer block visible, SampleDetails hidden
        expect(document.querySelector('#addCustomerBlock')).not.toBeNull();
        expect(document.querySelector('#sampleDetailsBlock')).toBeNull();

        await selectFirstCustomer(user);

        expect(document.querySelector('#addCustomerBlock')).toBeNull();
        expect(document.querySelector('#sampleDetailsBlock')).not.toBeNull();
    });

    test('E2: Customer balance displayed in modal after selection', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        // Balance input shows the selected customer's balance
        const balanceInputs = document.querySelectorAll('input[disabled][readonly]');
        const balanceInput = Array.from(balanceInputs).find(el => el.value === '1500');
        expect(balanceInput).toBeTruthy();
    });

    test('E3: AddCustomer form has Notes textarea (Python parity)', () => {
        renderModal();
        const notesField = document.querySelector('textarea[name="notes"]');
        expect(notesField).not.toBeNull();
    });

    test('E4: AddCustomer phone field has 10-digit constraints', () => {
        renderModal();
        const phoneInput = document.querySelector('input[name="phone"]');
        expect(phoneInput).toHaveAttribute('pattern', '[0-9]{10}');
        expect(phoneInput).toHaveAttribute('minLength', '10');
        expect(phoneInput).toHaveAttribute('maxLength', '10');
    });

    test('E5: "Add New Customer?" link clears selected customer and reveals form', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        // Sample block visible after select
        expect(document.querySelector('#sampleDetailsBlock')).not.toBeNull();

        const link = document.querySelector('#addCustomerBtn');
        await user.click(link);

        // AddCustomer form re-appears, SampleDetails hides
        expect(document.querySelector('#addCustomerBlock')).not.toBeNull();
        expect(document.querySelector('#sampleDetailsBlock')).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP F — EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────

describe('GT Modal — Group F: Edge cases', () => {
    test('F1: 20-row cap — + button disables at limit', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        // Already starts with 1 row, so add 19 more
        for (let i = 0; i < 19; i++) {
            await clickAddSampleBtn(user);
        }
        expect(getSampleRows().length).toBe(20);

        const addBtn = document.querySelector('#addSampleBtn');
        expect(addBtn).toBeDisabled();
    }, 30000);

    test('F2: Date display shows today (read-only)', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        const dateInput = document.querySelector('#dateTimePicker');
        expect(dateInput).toHaveAttribute('readOnly');
        // Should contain current year
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

    test('F4: Modal has no top-level <form> on sample details (only AddCustomer form when visible)', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);

        // After customer select, AddCustomer block is hidden, so no <form> in the modal
        const forms = document.querySelectorAll('#sampleDetailsBlock form');
        expect(forms.length).toBe(0);
    });
});
