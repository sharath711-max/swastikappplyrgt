import React from 'react';
import { createPortal } from 'react-dom';
import { usePrint } from '../../contexts/PrintContext';
import PrintManager from './PrintManager';
import ThermalReceipt from './ThermalReceipt';
import './PrintPortal.css';

/**
 * Renders the active print job directly in document.body via a React portal.
 * Hidden on screen; only visible via @media print.
 * window.print() is triggered by PrintContext after this mounts.
 */
export default function PrintPortal() {
    const { job } = usePrint();
    if (!job) return null;

    const content = job.printType === 'receipt'
        ? <ThermalReceipt snapshot={job.receiptData} />
        : job.itemLevel && job.data?.items?.length > 0
            ? job.data.items.map((it, idx) => (
                <div key={it.id || idx} style={{ pageBreakAfter: idx < job.data.items.length - 1 ? 'always' : 'auto' }}>
                    <PrintManager type={job.printType} data={job.data} item={it} photos={job.photos} layout={job.layout} />
                </div>
            ))
            : <PrintManager type={job.printType} data={job.data} item={job.item} photos={job.photos} layout={job.layout} />;

    return createPortal(
        <div id="in-page-print-root">{content}</div>,
        document.body
    );
}
