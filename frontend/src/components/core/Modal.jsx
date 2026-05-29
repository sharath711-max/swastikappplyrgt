import React, { useCallback } from 'react';
import useModalLifecycle from '../../hooks/useModalLifecycle';

const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xlarge: 'max-w-6xl'
};

// Custom (non-react-bootstrap) modal primitive. All cross-modal concerns —
// body lock, escape arbitration, focus restoration, duplicate suppression —
// are delegated to the modalLifecycle singleton via useModalLifecycle. The
// component itself only owns its own DOM and click-outside-to-close.
const Modal = ({ isOpen, show, onClose, onHide, title, children, size = 'medium', dark = false, modalKey = null }) => {
    const isModalOpen = typeof isOpen === 'boolean' ? isOpen : !!show;
    const handleClose = useCallback(() => {
        if (onClose) onClose();
        else if (onHide) onHide();
    }, [onClose, onHide]);

    // Stack-aware lifecycle. Escape closes only when this modal is the
    // topmost — handled inside the singleton, so we just pass the close
    // handler as the escape callback.
    useModalLifecycle({
        isOpen: isModalOpen,
        key: modalKey,
        onEscape: handleClose,
    });

    if (!isModalOpen) {
        return null;
    }

    return (
        <div
            className={`modal-overlay ${dark ? 'modal-dark' : ''}`}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
            role="presentation"
        >
            <div
                className={`modal-content ${sizeClasses[size] || ''}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={handleClose} type="button" aria-label="Close modal">
                        x
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
