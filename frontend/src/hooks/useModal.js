import { useCallback, useState } from 'react';

const scheduleNextFrame = (callback) => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
    }

    return setTimeout(callback, 0);
};

export function useModal(initialId = null) {
    const [selectedId, setSelectedId] = useState(initialId);
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback((id) => {
        setSelectedId(id);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        scheduleNextFrame(() => setSelectedId(null));
    }, []);

    return { selectedId, isOpen, open, close };
}
