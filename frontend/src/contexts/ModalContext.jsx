import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState(null);

    const openModal = useCallback((type, data = {}) => {
        setModal({ type, data });
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
    }, []);

    const value = useMemo(() => ({
        modal,
        openModal,
        closeModal
    }), [modal, openModal, closeModal]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error('useModal must be used within ModalProvider');
    }

    return context;
};
