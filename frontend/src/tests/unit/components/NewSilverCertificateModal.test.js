import React from 'react';  // eslint-disable-line no-unused-vars
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import NewSilverCertificateModal from '../../../components/NewSilverCertificateModal';
import { ModalProvider } from '../../../contexts/ModalContext';

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

const renderModal = (props = {}) => {
    const onHide    = jest.fn();
    const onSuccess = jest.fn();
    const result = render(
        <ModalProvider>
            <NewSilverCertificateModal show={true} onHide={onHide} onSuccess={onSuccess} {...props} />
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
    await user.click(document.querySelector('#addSampleBtn'));
};

const clickSubmit = async (user) => {
    const btn = document.querySelector('#sampleDetailsSubmitBtn');
    await act(async () => { await user.click(btn); });
};

const parsePayload = (formDataArg) => JSON.parse(formDataArg.get('data'));

beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockResolvedValue({ data: { data: mockCustomers } });
    mockApiPost.mockResolvedValue({ data: { success: true } });
});

describe('SC Modal — Group A: Row entry', () => {
    test('A1: Title shows "New Silver Certificate"', () => {
        renderModal();
        expect(screen.getByText(/new silver certificate/i)).toBeInTheDocument();
    });

    test('A2: Default state shows one empty row after customer select', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        expect(getSampleRows().length).toBe(1);
    });

    test('A3: + button adds a second row', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await clickAddSampleBtn(user);
        expect(getSampleRows().length).toBe(2);
    });

    test('A4: Sample Returned defaults to CHECKED (Python SC parity)', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        const cb = document.querySelector('#sampleDetailsContainer input[name="returned"]');
        expect(cb).toBeChecked();
    });
});

describe('SC Modal — Group B: GST checkbox', () => {
    test('B1: GST defaults to checked', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        expect(document.querySelector('input[name="gst"]')).toBeChecked();
    });

    test('B2: GST flag flows to payload', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '0.5' });
        await clickSubmit(user);
        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const payload = parsePayload(mockApiPost.mock.calls[0][1]);
        expect(payload.gst).toBe(true);
        expect(payload.type).toBe('silver');
    });

    test('B3: Unchecking GST flows false', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await user.click(document.querySelector('input[name="gst"]'));
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '0.5' });
        await clickSubmit(user);
        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const payload = parsePayload(mockApiPost.mock.calls[0][1]);
        expect(payload.gst).toBe(false);
    });
});

describe('SC Modal — Group C: Submit flow', () => {
    test('C1: Submit before customer → no button', () => {
        renderModal();
        expect(document.querySelector('#sampleDetailsSubmitBtn')).toBeNull();
    });

    test('C2: Single row → POST /certificates/with-photo with type:silver', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { name: 'Anklet', item: 'Anklet', total: '50', test: '2.0' });
        await clickSubmit(user);
        await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
        const [url, formData, opts] = mockApiPost.mock.calls[0];
        expect(url).toBe('/certificates/with-photo');
        expect(opts.headers['X-Request-Id']).toBeTruthy();
        const payload = parsePayload(formData);
        expect(payload.type).toBe('silver');
        expect(payload.customer_id).toBe('CUS-001');
        expect(payload.items[0]).toMatchObject({
            item_type: 'Anklet',
            gross_weight: 50,
            test_weight: 2.0,
            returned: true,
        });
    });
});

describe('SC Modal — Group D: Validation', () => {
    test('D1: Empty item type blocks submit', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { total: '10', test: '0.5' });
        await clickSubmit(user);
        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(expect.stringMatching(/item type/i), 'error');
    });

    test('D2: Test weight > Total → blocked', async () => {
        const user = userEvent.setup();
        renderModal();
        await selectFirstCustomer(user);
        await fillRow(user, 0, { item: 'Ring', total: '10', test: '15' });
        await clickSubmit(user);
        expect(mockApiPost).not.toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith(expect.stringMatching(/test weight.*cannot exceed/i), 'error');
    });
});

describe('SC Modal — Group E: Customer flow', () => {
    test('E1: AddCustomer block visible by default', () => {
        renderModal();
        expect(document.querySelector('#addCustomerBlock')).not.toBeNull();
        expect(document.querySelector('#sampleDetailsBlock')).toBeNull();
    });

    test('E2: previousCertificate placeholder exists', () => {
        renderModal();
        expect(document.querySelector('#previousCertificate')).not.toBeNull();
    });

    test('E3: AddCustomer has Notes textarea', () => {
        renderModal();
        expect(document.querySelector('textarea[name="notes"]')).not.toBeNull();
    });
});
