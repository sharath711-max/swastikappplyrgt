import React from 'react';
import NewGoldCertificateModal   from './NewGoldCertificateModal';
import NewSilverCertificateModal from './NewSilverCertificateModal';
import NewPhotoCertificateModal  from './NewPhotoCertificateModal';

// Pure dispatcher. The only callers (WorkflowBoard) pass type ∈ {gold, silver,
// photo} — the full cert family per docs/print-service-architecture.md. There
// is no fourth cert type, so no fallback render path is needed.
const NewCertificateModal = ({ show, onHide, onSuccess, type }) => {
    if (type === 'gold')   return <NewGoldCertificateModal   show={show} onHide={onHide} onSuccess={onSuccess} />;
    if (type === 'silver') return <NewSilverCertificateModal show={show} onHide={onHide} onSuccess={onSuccess} />;
    if (type === 'photo')  return <NewPhotoCertificateModal  show={show} onHide={onHide} onSuccess={onSuccess} />;
    return null;
};

export default NewCertificateModal;
