import React from 'react';
import { useLocation } from 'react-router-dom';
import { useRecordModal } from '../contexts/RecordModalContext';
import { usePrint } from '../contexts/PrintContext';
import GenericListView from '../components/ListViews/GenericListView';
import { FaEye, FaPrint } from 'react-icons/fa';
import './ListViewsPage.css';

// Tab → display label. Flattened from the record categories. The sidebar only
// surfaces the 5 record types (GT/GC/ST/SC/PC); Items + Ledger tabs remain
// addressable by URL (?tab=...) so nothing is lost, just not in the nav.
const TAB_LABELS = {
    'gold-tests':               'Gold Tests',
    'silver-tests':             'Silver Tests',
    'gold-certificates':        'Gold Certificates',
    'silver-certificates':      'Silver Certificates',
    'photo-certificates':       'Photo Certificates',
    'gold-test-items':          'Gold Items',
    'silver-test-items':        'Silver Items',
    'gold-certificate-items':   'Gold Cert Items',
    'silver-certificate-items': 'Silver Cert Items',
    'photo-certificate-items':  'Photo Cert Items',
    'credit-history':           'Credit History',
    'weight-loss-history':      'Weight Loss',
};

const DEFAULT_TAB = 'gold-tests';

const ListViewsPage = () => {
    const location = useLocation();
    const { openRecord } = useRecordModal();
    const { triggerPrint } = usePrint();

    // Navigation now lives entirely in the sidebar — the page just renders the
    // table for whatever `?tab=` is selected. Falls back to gold tests.
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get('tab') || DEFAULT_TAB;
    const activeTab = TAB_LABELS[requestedTab] ? requestedTab : DEFAULT_TAB;
    const label = TAB_LABELS[activeTab];

    const viewAction = (row) => {
        const id = row.id || row.parent_id;
        if (!id) return null;

        const isPrintable = activeTab.endsWith('tests') || activeTab.endsWith('certificates');
        const printType = activeTab.replace(/s$/, '');

        return (
            <div className="d-flex gap-2">
                <button className="btn-sf-view" onClick={() => openRecord(activeTab, id)}>
                    <FaEye className="me-2" /> View
                </button>
                {isPrintable && (
                    <button className="btn-sf-view bg-white text-primary border-primary" style={{ border: '1px solid' }} onClick={async (e) => {
                        e.stopPropagation();
                        try {
                            await triggerPrint(printType, id, { layout: 'small', itemLevel: true });
                        } catch (err) {
                            console.error('Print failed:', err);
                        }
                    }} title="Print Small Certificates for all items">
                        <FaPrint className="me-2" /> Small Cert
                    </button>
                )}
            </div>
        );
    };

    const COLUMNS = {
        'gold-tests': [
            { key: 'auto_number', label: 'Record No' },
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'status', label: 'Status', render: r => <span className={`sf-badge ${r.status === 'DONE' ? 'sf-badge-success' : 'sf-badge-warning'}`}>{r.status}</span> },
            { key: 'mode_of_payment', label: 'Mode' },
            { key: 'total', label: 'Total' },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'silver-tests': [
            { key: 'auto_number', label: 'Record No' },
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'status', label: 'Status', render: r => <span className={`sf-badge ${r.status === 'DONE' ? 'sf-badge-success' : 'sf-badge-warning'}`}>{r.status}</span> },
            { key: 'mode_of_payment', label: 'Mode' },
            { key: 'total', label: 'Total' },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'gold-certificates': [
            { key: 'auto_number', label: 'Record No' },
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'status', label: 'Status', render: r => <span className={`sf-badge ${r.status === 'DONE' ? 'sf-badge-success' : 'sf-badge-warning'}`}>{r.status}</span> },
            { key: 'total', label: 'Total' },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'silver-certificates': [
            { key: 'auto_number', label: 'Record No' },
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'status', label: 'Status', render: r => <span className={`sf-badge ${r.status === 'DONE' ? 'sf-badge-success' : 'sf-badge-warning'}`}>{r.status}</span> },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'photo-certificates': [
            { key: 'auto_number', label: 'Record No' },
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'status', label: 'Status', render: r => <span className={`sf-badge ${r.status === 'DONE' ? 'sf-badge-success' : 'sf-badge-warning'}`}>{r.status}</span> },
            { key: 'total', label: 'Total' },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'gold-test-items': [
            { key: 'item_number', label: 'Item No' },
            { key: 'parent_auto_number', label: 'Record No' },
            { key: 'item_type', label: 'Type' },
            { key: 'purity', label: 'Purity %' },
            { key: 'returned', label: 'Returned', render: r => <span className={`sf-badge ${r.returned ? 'sf-badge-neutral' : 'sf-badge-success'}`}>{r.returned ? 'Returned' : 'In Lab'}</span> },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'silver-test-items': [
            { key: 'item_number', label: 'Item No' },
            { key: 'parent_auto_number', label: 'Record No' },
            { key: 'item_type', label: 'Type' },
            { key: 'purity', label: 'Purity %' },
            { key: 'returned', label: 'Returned', render: r => <span className={`sf-badge ${r.returned ? 'sf-badge-neutral' : 'sf-badge-success'}`}>{r.returned ? 'Returned' : 'In Lab'}</span> },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'gold-certificate-items': [
            { key: 'item_number', label: 'Item No' },
            { key: 'parent_auto_number', label: 'Record No' },
            { key: 'item_type', label: 'Type' },
            { key: 'item_total', label: 'Valuation' },
            { key: 'returned', label: 'Returned', render: r => <span className={`sf-badge ${r.returned ? 'sf-badge-neutral' : 'sf-badge-success'}`}>{r.returned ? 'Returned' : 'In Lab'}</span> },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'silver-certificate-items': [
            { key: 'item_number', label: 'Item No' },
            { key: 'parent_auto_number', label: 'Record No' },
            { key: 'item_type', label: 'Type' },
            { key: 'item_total', label: 'Valuation' },
            { key: 'returned', label: 'Returned', render: r => <span className={`sf-badge ${r.returned ? 'sf-badge-neutral' : 'sf-badge-success'}`}>{r.returned ? 'Returned' : 'In Lab'}</span> },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'photo-certificate-items': [
            { key: 'item_number', label: 'Item No' },
            { key: 'parent_auto_number', label: 'Record No' },
            { key: 'item_type', label: 'Type' },
            { key: 'returned', label: 'Returned', render: r => <span className={`sf-badge ${r.returned ? 'sf-badge-neutral' : 'sf-badge-success'}`}>{r.returned ? 'Returned' : 'In Lab'}</span> },
            { key: 'created', label: 'Created' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'credit-history': [
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'type', label: 'Type', render: r => <span className={`sf-badge ${r.type === 'debit' ? 'sf-badge-danger' : 'sf-badge-success'}`}>{r.type?.toUpperCase() || 'UNKNOWN'}</span> },
            { key: 'amount', label: 'Amount' },
            { key: 'mode_of_payment', label: 'Payment Mode' },
            { key: 'created', label: 'Date' },
            { key: 'action', label: 'Action', render: viewAction }
        ],
        'weight-loss-history': [
            { key: 'customer_name', label: 'Customer Name' },
            { key: 'amount', label: 'Loss (g)' },
            { key: 'reason', label: 'Reason' },
            { key: 'created', label: 'Date' },
            { key: 'action', label: 'Action', render: viewAction }
        ]
    };

    return (
        <div className="list-views-page">
            <div className="page-header-panel">
                <div className="breadcrumb-label">OPERATIONS &amp; RECORDS</div>
                <div className="title-section">
                    <h2>{label} List View</h2>
                </div>
            </div>

            <div className="data-table-container">
                <div className="data-panel-card">
                    <GenericListView
                        type={activeTab}
                        endpoint={`/list/${activeTab}`}
                        columns={COLUMNS[activeTab] || []}
                        title={label}
                        emptyMessage={`No ${activeTab.replace(/-/g, ' ')} records found.`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ListViewsPage;
