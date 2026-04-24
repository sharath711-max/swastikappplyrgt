import React, { useRef } from 'react';
import { Modal } from 'react-bootstrap';
import CertificateForm from './CertificateForm';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { preventDuplicateCreate } from '../utils/certificateGuard';
import runModalSubmit from '../utils/handleSubmit';

const NewCertificateModal = ({ show, onHide, onSuccess, type }) => {
    const { addToast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const submitReqIdRef = useRef(null);

    const handleCreate = async (formData) => {
        setLoading(true);
        try {
            await runModalSubmit({
                action: async () => {
                    const payload = JSON.parse(formData.get('data'));
                    const certificateTypeMap = {
                        gold: 'GC',
                        silver: 'SC',
                        photo: 'PC'
                    };

                    if (!preventDuplicateCreate(certificateTypeMap[payload.type] || 'CERT', payload.customer_id)) {
                        throw new Error('Duplicate certificate submission blocked');
                    }

                    if (!submitReqIdRef.current) {
                        submitReqIdRef.current = window.crypto?.randomUUID?.() || Date.now().toString();
                    }

                    const res = await api.post('/certificates/with-photo', formData, {
                        headers: { 'X-Request-Id': submitReqIdRef.current }
                    });
                    addToast('Certificate issued successfully', 'success');
                    return res.data;
                },
                reload: onSuccess,
                close: () => {
                    submitReqIdRef.current = null;
                    onHide();
                }
            });
        } catch (error) {
            if (error.message === 'Duplicate certificate submission blocked') {
                addToast('Certificate creation is already in progress', 'warning');
                return;
            }
            console.error('Error issuing certificate:', error);
            const msg = error.response?.data?.error || 'Failed to issue certificate';
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const titleMap = {
        gold: 'New Gold Certificate Entry',
        silver: 'New Silver Certificate Entry',
        photo: 'New Photo Certificate Entry'
    };

    return (
        <Modal show={show} onHide={onHide} centered dialogClassName="modal-container" className="new-sample-modal">
            <Modal.Header closeButton className="new-sample-header">
                <Modal.Title className="fw-bold">
                    {titleMap[type] || 'New Certificate Entry'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-3">
                <CertificateForm
                    forcedType={type}
                    isOpen={show}
                    onSubmit={handleCreate}
                    onCancel={onHide}
                    loading={loading}
                />
            </Modal.Body>
        </Modal>
    );
};

export default NewCertificateModal;
