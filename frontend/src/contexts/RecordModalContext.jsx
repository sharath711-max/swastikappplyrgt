import React, { createContext, useContext, useState, useCallback } from 'react';
import RecordDetailModal from '../components/RecordDetailModal';

// Lets any "View" affordance open the Record Detail modal in-context instead
// of navigating to the full /record/:type/:id page. Mounts the modal once.
const RecordModalContext = createContext({ openRecord: () => {} });

export const useRecordModal = () => useContext(RecordModalContext);

export function RecordModalProvider({ children }) {
    const [state, setState] = useState({ show: false, type: null, id: null });

    const openRecord = useCallback((type, id) => {
        if (!type || !id) return;
        setState({ show: true, type, id });
    }, []);

    const close = useCallback(() => setState(s => ({ ...s, show: false })), []);

    return (
        <RecordModalContext.Provider value={{ openRecord }}>
            {children}
            <RecordDetailModal show={state.show} onHide={close} type={state.type} id={state.id} />
        </RecordModalContext.Provider>
    );
}
