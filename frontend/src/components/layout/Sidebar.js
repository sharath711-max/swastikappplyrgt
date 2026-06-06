import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaTachometerAlt, FaUsers, FaTable, FaChartBar,
    FaCoins, FaBalanceScale, FaCertificate, FaFileAlt, FaImage,
} from 'react-icons/fa';
import ProtectedComponent from './ProtectedComponent';
import { useWorkflow, WORKFLOWS } from '../../contexts/WorkflowContext';
import { APP_CONFIG } from '../../utils/Constants';

// Icon per workflow — matches WorkflowDispatchCards on the dashboard so the
// operator sees the same glyph in two places (sidebar nav + dashboard tile).
const WORKFLOW_ICONS = {
    gold:        FaCoins,
    gold_cert:   FaCertificate,
    silver:      FaBalanceScale,
    silver_cert: FaFileAlt,
    photo_cert:  FaImage,
};

const WORKFLOW_ROLES = ['admin', 'manager', 'technician', 'front_desk'];

// Records sub-nav — vertical expansion of the 5 record types (GT/GC/ST/SC/PC).
// Each links to the shared list-views page (same GT-style table) by tab.
// Items + Ledger remain reachable by URL but are intentionally not surfaced here.
const RECORD_LINKS = [
    { tab: 'gold-tests',          category: 'tests',        label: 'Gold Test' },
    { tab: 'gold-certificates',   category: 'certificates', label: 'Gold Certificate' },
    { tab: 'silver-tests',        category: 'tests',        label: 'Silver Test' },
    { tab: 'silver-certificates', category: 'certificates', label: 'Silver Certificate' },
    { tab: 'photo-certificates',  category: 'certificates', label: 'Photo Certificate' },
];

const Sidebar = ({ sidebarCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        selectedWorkflow,
        setSelectedWorkflow,
        tryWorkflowSwitch,
    } = useWorkflow();


    const isActive = (path, exact = false) => {
        if (!path) return false;
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const onWorkflowsPath = location.pathname.startsWith('/workflow');
    const onRecordsPath   = location.pathname.startsWith('/list-views');
    const currentRecordTab = new URLSearchParams(location.search).get('tab');
    const [recordsOpen, setRecordsOpen] = useState(onRecordsPath);

    const handleSelectWorkflow = (key) => {
        if (!tryWorkflowSwitch(key)) return;
        setSelectedWorkflow(key);
        if (!onWorkflowsPath) navigate('/workflow');
    };

    return (
        <aside className="app-sidebar app-sidebar--flat">
            <nav className="sidebar-nav">
                {/* Dashboard */}
                <ProtectedComponent roles={['admin', 'manager']}>
                    <Link
                        to="/"
                        className={`nav-item ${isActive('/', true) ? 'active' : ''}`}
                    >
                        <span className="nav-icon"><FaTachometerAlt /></span>
                        {!sidebarCollapsed && <span className="nav-label">Dashboard</span>}
                    </Link>
                </ProtectedComponent>

                {/* Workflow operational queues — simple icon + label rows.
                    Operator chose Python-style sidebar: no chips, no aging
                    dots, no count badges, no "+ New" buttons. Aging /
                    queue-pressure signal now lives on the dashboard
                    WorkflowDispatchCards + on the WorkflowBoard itself. */}
                <ProtectedComponent roles={WORKFLOW_ROLES}>
                    {WORKFLOWS.map((w) => {
                        const isCurrent = onWorkflowsPath && selectedWorkflow === w.key;
                        const Icon = WORKFLOW_ICONS[w.key] || FaCoins;
                        return (
                            <button
                                key={w.key}
                                type="button"
                                className={`nav-item nav-item--button ${isCurrent ? 'active' : ''}`}
                                onClick={() => handleSelectWorkflow(w.key)}
                                title={w.label}
                                aria-current={isCurrent ? 'page' : undefined}
                            >
                                <span className="nav-icon"><Icon aria-hidden="true" /></span>
                                {!sidebarCollapsed && <span className="nav-label">{w.label}</span>}
                            </button>
                        );
                    })}
                </ProtectedComponent>

                {/* Customers / Bills */}
                <ProtectedComponent roles={['admin', 'manager', 'front_desk']}>
                    <Link
                        to="/customers"
                        className={`nav-item ${isActive('/customers') ? 'active' : ''}`}
                    >
                        <span className="nav-icon"><FaUsers /></span>
                        {!sidebarCollapsed && <span className="nav-label">Customers</span>}
                    </Link>
                </ProtectedComponent>
                <ProtectedComponent roles={['admin', 'manager']}>
                    <div className={`nav-group ${onRecordsPath ? 'active' : ''}`}>
                        <button
                            type="button"
                            className="nav-group-header nav-item--button"
                            onClick={() => {
                                // Collapsed rail can't show children — jump to the
                                // first record list instead of a dead toggle.
                                if (sidebarCollapsed) {
                                    navigate('/list-views?category=tests&tab=gold-tests');
                                    return;
                                }
                                setRecordsOpen((o) => !o);
                            }}
                            aria-expanded={recordsOpen}
                            title="Records"
                        >
                            <span className="nav-icon"><FaTable /></span>
                            {!sidebarCollapsed && <span className="nav-label">Records</span>}
                            {!sidebarCollapsed && (
                                <span
                                    className="nav-caret"
                                    aria-hidden="true"
                                    style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7 }}
                                >
                                    {recordsOpen ? '▾' : '▸'}
                                </span>
                            )}
                        </button>
                        {!sidebarCollapsed && recordsOpen && (
                            <div className="nav-subitems">
                                {RECORD_LINKS.map((r) => (
                                    <Link
                                        key={r.tab}
                                        to={`/list-views?category=${r.category}&tab=${r.tab}`}
                                        className={`nav-subitem ${onRecordsPath && currentRecordTab === r.tab ? 'active' : ''}`}
                                    >
                                        {r.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </ProtectedComponent>
                <ProtectedComponent roles={['admin', 'manager', 'front_desk']}>
                    <Link
                        to="/reports"
                        className={`nav-item ${isActive('/reports') ? 'active' : ''}`}
                    >
                        <span className="nav-icon"><FaChartBar /></span>
                        {!sidebarCollapsed && <span className="nav-label">Reports</span>}
                    </Link>
                </ProtectedComponent>
            </nav>

            {!sidebarCollapsed && (
                <div className="sidebar-footer">
                    <div className="app-info">
                        <div className="app-version">{APP_CONFIG.version}</div>
                        <div className="app-copyright">{APP_CONFIG.copyright}</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
