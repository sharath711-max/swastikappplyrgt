import React from 'react';  // eslint-disable-line no-unused-vars
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import CertificateForm from '../../../components/CertificateForm';
import { ModalProvider } from '../../../contexts/ModalContext';

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockCustomers = [
    { id: 'CUS-001', name: 'Acme Jewellers', phone: '9876543210' },
];

const mockApiPost = jest.fn(() => Promise.resolve({ data: { success: true } }));
const mockApiGet  = jest.fn();

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

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderForm = (props = {}) => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const result = render(
        <ModalProvider>
            <CertificateForm
                onSubmit={onSubmit}
                onCancel={onCancel}
                isOpen={true}
                {...props}
            />
        </ModalProvider>
    );
    return { ...result, onSubmit, onCancel };
};

const selectFirstCustomer = async (user) => {
    const search = screen.getByPlaceholderText(/search by name or phone/i);
    await user.type(search, 'Acme');
    const suggestion = await screen.findByText(/Acme Jewellers/i);
    await user.click(suggestion);
};

const clickAdd = async (user) => {
    const addBtn = screen.getByRole('button', { name: /add to list/i });
    await user.click(addBtn);
};

const getRows = () => Array.from(document.querySelectorAll('tbody tr'))
    .filter((tr) => tr.querySelector('td.fw-bold'));

const parsePostedData = (onSubmit) => {
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const fd = onSubmit.mock.calls[0][0];
    return JSON.parse(fd.get('data'));
};

// ── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockImplementation((url) => {
        if (url === '/customers') return Promise.resolve({ data: { data: mockCustomers } });
        if (url === '/analytics/rates') return Promise.resolve({
            data: { data: { gold_rate_per_gram: 6500, silver_rate_per_gram: 80 } },
        });
        return Promise.resolve({ data: {} });
    });
    mockApiPost.mockResolvedValue({ data: { success: true } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GOLD CERTIFICATE (GC)
// ─────────────────────────────────────────────────────────────────────────────

describe('GC (Gold Certificate) — full UI flow', () => {
    test('A1: Add via Button — gold item with weights + rate adds to list', async () => {
        const user = userEvent.setup();
        renderForm({ forcedType: 'gold' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Ring');
        const weightInputs = screen.getAllByPlaceholderText('0.000');
        await user.type(weightInputs[0], '10');   // gross
        await user.type(weightInputs[1], '0.5');  // test
        await clickAdd(user);

        const rows = getRows();
        expect(rows.length).toBe(1);
        expect(rows[0]).toHaveTextContent('Ring');
        expect(rows[0]).toHaveTextContent('10g');
    });

    test('A2: Add via Enter Key (Gold) — item added, form NOT submitted', async () => {
        const user = userEvent.setup({ onSubmit: jest.fn() });
        const { onSubmit } = renderForm({ forcedType: 'gold' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Bangle');
        const weightInputs = screen.getAllByPlaceholderText('0.000');
        await user.type(weightInputs[0], '15');
        await user.type(weightInputs[1], '0.2{Enter}');

        expect(getRows().length).toBe(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    test('D2: Issue Certificate — onSubmit fires with correct gold payload', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm({ forcedType: 'gold' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Ring');
        const weightInputs = screen.getAllByPlaceholderText('0.000');
        await user.type(weightInputs[0], '10');
        await user.type(weightInputs[1], '0.5');
        await clickAdd(user);

        expect(getRows().length).toBe(1);

        const issueBtn = screen.getByRole('button', { name: /issue certificate/i });
        await act(async () => { await user.click(issueBtn); });

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        const data = parsePostedData(onSubmit);
        expect(data.type).toBe('gold');
        expect(data.customer_id).toBe('CUS-001');
        expect(data.items).toHaveLength(1);
        expect(data.items[0]).toMatchObject({
            item_type: 'Ring',
            gross_weight: 10,
            test_weight: 0.5,
        });
    });

    test('E1/E2: Enter in customer-search input does NOT trigger Issue', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm({ forcedType: 'gold' });

        const search = screen.getByPlaceholderText(/search by name or phone/i);
        await user.type(search, 'Acme{Enter}');

        // No items, no premature submit, no alert chain
        expect(onSubmit).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SILVER CERTIFICATE (SC)
// ─────────────────────────────────────────────────────────────────────────────

describe('SC (Silver Certificate) — full UI flow', () => {
    test('A1: Add silver item — gross + test_weight required, item appears', async () => {
        const user = userEvent.setup();
        renderForm({ forcedType: 'silver' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Anklet');
        const weightInputs = screen.getAllByPlaceholderText('0.000');
        await user.type(weightInputs[0], '25');   // gross
        await user.type(weightInputs[1], '0.3');  // test
        await clickAdd(user);

        const rows = getRows();
        expect(rows.length).toBe(1);
        expect(rows[0]).toHaveTextContent('Anklet');
        expect(rows[0]).toHaveTextContent('25g');
    });

    test('A2: Enter adds silver item without submitting form', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm({ forcedType: 'silver' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Bracelet');
        const weightInputs = screen.getAllByPlaceholderText('0.000');
        await user.type(weightInputs[0], '12');
        await user.type(weightInputs[1], '0.2{Enter}');

        expect(getRows().length).toBe(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    test('D2: Issue Silver Cert — onSubmit fires with type=silver payload', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm({ forcedType: 'silver' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Anklet');
        const weightInputs = screen.getAllByPlaceholderText('0.000');
        await user.type(weightInputs[0], '25');
        await user.type(weightInputs[1], '0.3');
        await clickAdd(user);

        const issueBtn = screen.getByRole('button', { name: /issue certificate/i });
        await act(async () => { await user.click(issueBtn); });

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        const data = parsePostedData(onSubmit);
        expect(data.type).toBe('silver');
        expect(data.items[0]).toMatchObject({
            item_type: 'Anklet',
            gross_weight: 25,
            test_weight: 0.3,
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO CERTIFICATE (PC)
// ─────────────────────────────────────────────────────────────────────────────

describe('PC (Photo Certificate) — full UI flow', () => {
    test('A1: Add photo item — only weight is required', async () => {
        const user = userEvent.setup();
        renderForm({ forcedType: 'photo' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Idol');
        const weightInput = screen.getByPlaceholderText('0.000');
        await user.type(weightInput, '50');
        await clickAdd(user);

        const rows = getRows();
        expect(rows.length).toBe(1);
        expect(rows[0]).toHaveTextContent('Idol');
        expect(rows[0]).toHaveTextContent('50g');
    });

    test('A2: Enter adds photo item without submitting form', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm({ forcedType: 'photo' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Statue');
        const weightInput = screen.getByPlaceholderText('0.000');
        await user.type(weightInput, '30{Enter}');

        expect(getRows().length).toBe(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    test('D2: Issue Photo Cert — payload has type=photo + gross_weight from weight field', async () => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm({ forcedType: 'photo' });
        await selectFirstCustomer(user);

        const desc = screen.getByPlaceholderText(/RING, NECK/i);
        await user.type(desc, 'Idol');
        const weightInput = screen.getByPlaceholderText('0.000');
        await user.type(weightInput, '50');
        await clickAdd(user);

        const issueBtn = screen.getByRole('button', { name: /issue certificate/i });
        await act(async () => { await user.click(issueBtn); });

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        const data = parsePostedData(onSubmit);
        expect(data.type).toBe('photo');
        expect(data.items[0]).toMatchObject({
            item_type: 'Idol',
            gross_weight: 50,
        });
    });

    test('Photo type renders a single weight input + file input (no test/rate fields)', async () => {
        renderForm({ forcedType: 'photo' });
        const weightInputs = screen.getAllByPlaceholderText('0.000');
        expect(weightInputs.length).toBe(1);
        // File input present
        expect(document.querySelector('input[type="file"]')).toBeTruthy();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED EVENT-CONTROL CHECKS (the regression guards from the GAP fix)
// ─────────────────────────────────────────────────────────────────────────────

describe('CertificateForm — event control regression guards', () => {
    test.each([
        ['gold',   'gold'],
        ['silver', 'silver'],
        ['photo',  'photo'],
    ])('Form-level Enter on text inputs is swallowed (type=%s)', async (_label, type) => {
        const user = userEvent.setup();
        const { onSubmit } = renderForm({ forcedType: type });

        // Press Enter inside the customer search input (outside the entry card)
        const search = screen.getByPlaceholderText(/search by name or phone/i);
        await user.type(search, 'Acme{Enter}');

        // Form must NOT submit (was the original bug)
        expect(onSubmit).not.toHaveBeenCalled();
    });

    test.each([
        ['gold',   'gold'],
        ['silver', 'silver'],
    ])('Issue button is type=button (no implicit submit) — type=%s', async (_label, type) => {
        renderForm({ forcedType: type });
        const issueBtn = screen.getByRole('button', { name: /issue certificate/i });
        expect(issueBtn).toHaveAttribute('type', 'button');
    });
});
