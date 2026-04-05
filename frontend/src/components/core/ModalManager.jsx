import React from 'react';
import NewCustomerModal from '../NewCustomerModal';
import NewWeightLossHistoryModal from '../NewWeightLossHistoryModal';
import { useModal } from '../../contexts/ModalContext';

const ModalManager = () => {
    const { modal, closeModal } = useModal();

    if (!modal) {
        return null;
    }

    switch (modal.type) {
        case 'customer':
            return (
                <NewCustomerModal
                    show={true}
                    onClose={closeModal}
                    onHide={closeModal}
                    onSuccess={modal.data?.reload}
                    customer={modal.data?.customer || null}
                />
            );

        case 'weightLossHistory':
            return (
                <NewWeightLossHistoryModal
                    show={true}
                    onClose={closeModal}
                    onHide={closeModal}
                    onSuccess={modal.data?.reload}
                    customerId={modal.data?.customerId}
                    initialAmount={modal.data?.initialAmount}
                    initialReason={modal.data?.initialReason}
                />
            );

        default:
            return null;
    }
};

export default ModalManager;
