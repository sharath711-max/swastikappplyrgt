import React, { useRef } from 'react';
import { Modal } from 'react-bootstrap';
import CertificateForm from './CertificateForm';
import NewGoldCertificateModal   from './NewGoldCertificateModal';
import NewSilverCertificateModal from './NewSilverCertificateModal';
import NewPhotoCertificateModal  from './NewPhotoCertificateModal';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { preventDuplicateCreate } from '../utils/certificateGuard';
import runModalSubmit from '../utils/handleSubmit';

const NewCertificateModal = ({ show, onHide, onSuccess, type }) => {
    const { addToast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const submitReqIdRef = useRef(null);

    // GC / SC / PC each have Python-parity layouts (multi-row inline, GST,
    // customer balance, notes). PC adds per-row photo input. CertificateForm
    // is kept as a fallback for any unforeseen types but is no longer the
    // primary path for these three.
    if (type === 'gold')   return <NewGoldCertificateModal   show={show} onHide={onHide} onSuccess={onSuccess} />;
    if (type === 'silver') return <NewSilverCertificateModal show={show} onHide={onHide} onSuccess={onSuccess} />;
    if (type === 'photo')  return <NewPhotoCertificateModal  show={show} onHide={onHide} onSuccess={onSuccess} />;

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
        silver: 'New Silver Certificate Entry',
        photo: 'New Photo Certificate Entry'
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" className="new-cert-modal">
            <Modal.Header closeButton style={{ background: '#f8f9fa', padding: '.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                <Modal.Title className="fw-bold fs-6">
                    {titleMap[type] || 'New Certificate Entry'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
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
