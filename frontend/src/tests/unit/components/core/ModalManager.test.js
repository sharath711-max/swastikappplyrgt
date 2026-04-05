import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalManager from '../../../../components/core/ModalManager';
import { ModalProvider, useModal } from '../../../../contexts/ModalContext';

jest.mock('../../../../components/NewCustomerModal', () => (props) => (
    props.show ? (
        <div>
            <div>Customer Manager Modal</div>
            <div>{props.customer?.name || 'No customer'}</div>
            <button type="button" onClick={props.onClose || props.onHide}>Close</button>
        </div>
    ) : null
));

jest.mock('../../../../components/NewWeightLossHistoryModal', () => (props) => (
    props.show ? (
        <div>
            <div>Weight Loss Manager Modal</div>
            <button type="button" onClick={props.onClose || props.onHide}>Close</button>
        </div>
    ) : null
));

const ModalTrigger = () => {
    const { openModal } = useModal();

    return (
        <button
            type="button"
            onClick={() => openModal('customer', {
                customer: { name: 'Riya' },
                reload: jest.fn()
            })}
        >
            Open Customer Modal
        </button>
    );
};

describe('ModalManager', () => {
    test('renders the active modal and closes it through context', () => {
        render(
            <ModalProvider>
                <ModalTrigger />
                <ModalManager />
            </ModalProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /open customer modal/i }));

        expect(screen.getByText('Customer Manager Modal')).toBeInTheDocument();
        expect(screen.getByText('Riya')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /close/i }));

        expect(screen.queryByText('Customer Manager Modal')).not.toBeInTheDocument();
    });
});
