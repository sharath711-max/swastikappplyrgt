import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GenericListView from '../components/ListViews/GenericListView';
import { FaEye, FaFlask, FaCertificate, FaGem, FaBook } from 'react-icons/fa';
import './ListViewsPage.css';

const ListViewsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mapping configuration
    const CONFIG = {
        tests: {
            label: 'Tests',
            icon: <FaFlask />,
            subTabs: [
                { key: 'gold-tests', label: 'Gold Tests' },
                { key: 'silver-tests', label: 'Silver Tests' }
            ]
        },
        certificates: {
            label: 'Certificates',
            icon: <FaCertificate />,
            subTabs: [
                { key: 'gold-certificates', label: 'Gold Certificates' },
                { key: 'silver-certificates', label: 'Silver Certificates' },
                { key: 'photo-certificates', label: 'Photo Certificates' }
            ]
        },
        items: {
            label: 'Items',
            icon: <FaGem />,
            subTabs: [
                { key: 'gold-test-items', label: 'Gold Items' },
                { key: 'silver-test-items', label: 'Silver Items' },
                { key: 'gold-certificate-items', label: 'Gold Cert Items' },
                { key: 'silver-certificate-items', label: 'Silver Cert Items' },
                { key: 'photo-certificate-items', label: 'Photo Cert Items' }
            ]
        },
        ledger: {
            label: 'Ledger',
            icon: <FaBook />,
            subTabs: [
                { key: 'credit-history', label: 'Credit History' },
                { key: 'weight-loss-history', label: 'Weight Loss' }
            ]
        }
    };

    const getInitialState = useCallback(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('category') || 'tests';
        const tab = params.get('tab') || 'gold-tests';
        return { category: cat, tab: tab };
    }, [location.search]);

    const [activeCategory, setActiveCategory] = useState(() => getInitialState().category);
    const [activeTab, setActiveTab] = useState(() => getInitialState().tab);

    useEffect(() => {
        const state = getInitialState();
        setActiveCategory(state.category);
        setActiveTab(state.tab);
    }, [getInitialState]);

    const handleCategoryChange = (catKey) => {
        const defaultSubTab = CONFIG[catKey].subTabs[0].key;
        setActiveCategory(catKey);
        setActiveTab(defaultSubTab);
        navigate(`/list-views?category=${catKey}&tab=${defaultSubTab}`);
    };

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        navigate(`/list-views?category=${activeCategory}&tab=${tabKey}`);
    };

    const viewAction = (row) => {
        const id = row.id || row.parent_id;
        if (!id) return null;
        return (
            <button className="btn-sf-view" onClick={() => navigate(`/record/${activeTab}/${id}`)}>
                <FaEye className="me-2" /> View
            </button>
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
                <div className="breadcrumb-label">OPERATIONS & RECORDS</div>
                <div className="title-section">
                    <h2>{CONFIG[activeCategory].label} List Views</h2>
                </div>

                <div className="category-tabs">
                    {Object.keys(CONFIG).map((key) => (
                        <div
                            key={key}
                            className={`category-tab-item ${activeCategory === key ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(key)}
                        >
                            <span className="tab-icon">{CONFIG[key].icon}</span>
                            <span>{CONFIG[key].label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sub-nav-container">
                <div className="sub-nav-pills">
                    {CONFIG[activeCategory].subTabs.map((sub) => (
                        <button
                            key={sub.key}
                            className={`sub-pill ${activeTab === sub.key ? 'active' : ''}`}
                            onClick={() => handleTabChange(sub.key)}
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="data-table-container">
                <div className="data-panel-card">
                    <GenericListView
                        type={activeTab}
                        endpoint={`/list/${activeTab}`}
                        columns={COLUMNS[activeTab] || []}
                        title={CONFIG[activeCategory].subTabs.find(t => t.key === activeTab)?.label}
                        emptyMessage={`No ${activeTab.replace('-', ' ')} records found.`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ListViewsPage;
