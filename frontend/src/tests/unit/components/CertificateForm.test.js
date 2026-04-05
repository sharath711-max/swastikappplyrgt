import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CertificateForm from '../../../components/CertificateForm';

jest.mock('../../../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: jest.fn() })
}));

jest.mock('../../../contexts/ModalContext', () => ({
    useModal: () => ({ openModal: jest.fn() })
}));

jest.mock('../../../services/api', () => ({
    get: jest.fn()
}));

const api = require('../../../services/api').default || require('../../../services/api');

describe('CertificateForm modal state sync', () => {
    beforeEach(() => {
        api.get.mockResolvedValue({ data: { data: [] } });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('resets draft fields when the modal is reopened', async () => {
        const props = {
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
            forcedType: 'gold',
            isOpen: true
        };

        const { rerender } = render(<CertificateForm {...props} />);

        const descriptionInput = await screen.findByPlaceholderText(/e\.g\. RING, NECK/i);
        fireEvent.change(descriptionInput, { target: { value: 'Ring' } });

        expect(descriptionInput).toHaveValue('Ring');

        rerender(<CertificateForm {...props} isOpen={false} />);
        rerender(<CertificateForm {...props} isOpen={true} />);

        expect(screen.getByPlaceholderText(/e\.g\. RING, NECK/i)).toHaveValue('');
    });

    test('updates the draft fields when the certificate type changes', async () => {
        const baseProps = {
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
            isOpen: true
        };

        const { rerender } = render(<CertificateForm {...baseProps} forcedType="gold" />);

        expect(await screen.findByText(/Gross Wt/i)).toBeInTheDocument();

        rerender(<CertificateForm {...baseProps} forcedType="photo" />);

        await waitFor(() => {
            expect(screen.getByText(/Upload Item Photo/i)).toBeInTheDocument();
        });

        expect(screen.queryByText(/Gross Wt/i)).not.toBeInTheDocument();
    });
});
