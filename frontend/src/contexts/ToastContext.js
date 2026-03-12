import React, { createContext, useContext, useCallback } from 'react';
import { toast as rtToast } from 'react-toastify';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const options = {
            autoClose: duration || 5000,
            position: "top-right",
            pauseOnHover: true,
            draggable: true
        };

        switch (type) {
            case 'success': rtToast.success(message, options); break;
            case 'error': rtToast.error(message, options); break;
            case 'warning': rtToast.warn(message, options); break;
            default: rtToast.info(message, options); break;
        }
    }, []);

    const removeToast = useCallback(() => { }, []);
    const clearAllToasts = useCallback(() => { }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
