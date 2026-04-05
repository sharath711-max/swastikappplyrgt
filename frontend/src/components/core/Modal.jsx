import React, { useEffect } from 'react';

let openModalCount = 0;

const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xlarge: 'max-w-6xl'
};

const Modal = ({ isOpen, show, onClose, onHide, title, children, size = 'medium', dark = false }) => {
    const isModalOpen = typeof isOpen === 'boolean' ? isOpen : !!show;
    const handleClose = onClose || onHide || (() => { });

    useEffect(() => {
        if (!isModalOpen) {
            return undefined;
        }

        openModalCount += 1;
        document.body.classList.add('modal-open');

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            openModalCount = Math.max(0, openModalCount - 1);
            if (openModalCount === 0) {
                document.body.classList.remove('modal-open');
            }
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen, handleClose]);

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
