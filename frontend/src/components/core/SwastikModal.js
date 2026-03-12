import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

/**
 * Centrally managed Modal component that standardizes the "Submit-and-Close"
 * pattern and unifies the design aesthetics for all Swastik Lab dialogs.
 */
const SwastikModal = ({
    show,
    onHide,
    title,
    size = 'lg',
    onSubmit,
    children,
    submitLabel = 'Save Record',
    cancelLabel = 'Cancel',
    isSubmitting = false,
    disableSubmit = false
}) => {
    return (
        <Modal
            show={show}
            onHide={!isSubmitting ? onHide : undefined}
            size={size}
            centered
            backdrop="static"
            className="swastik-core-modal"
        >
            <Modal.Header closeButton={!isSubmitting} className="border-0 pb-2">
                <Modal.Title className="fw-bold text-dark fs-5">
                    {title}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-2">
                {children}
            </Modal.Body>

            {onSubmit && (
                <Modal.Footer className="border-0 pt-0 d-flex justify-content-between">
                    <div className="text-muted small">
                        <span className="fw-bold text-danger">*</span> Required fields
                    </div>
                    <div>
                        <Button
                            variant="secondary"
                            onClick={onHide}
                            disabled={isSubmitting}
                            className="me-2 px-4 shadow-sm"
                            style={{ borderRadius: '6px' }}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onSubmit}
                            disabled={isSubmitting || disableSubmit}
                            className="px-5 shadow-sm fw-bold"
                            style={{ backgroundColor: '#0176d3', borderColor: '#0176d3', borderRadius: '6px' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Processing...
                                </>
                            ) : submitLabel}
                        </Button>
                    </div>
                </Modal.Footer>
            )}

            <style>{`
                .swastik-core-modal .modal-content {
                    border-radius: 12px;
                    border: none;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                }
                .swastik-core-modal .modal-header .btn-close {
                    font-size: 0.8rem;
                }
            `}</style>
        </Modal>
    );
};

export default SwastikModal;
