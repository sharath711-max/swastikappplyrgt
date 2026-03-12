import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge, Button, Spinner } from 'react-bootstrap';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import NewGoldTestModal from '../components/NewGoldTestModal';
import NewSilverTestModal from '../components/NewSilverTestModal';
import NewCertificateModal from '../components/NewCertificateModal';
import Phase2Modal from '../components/Phase2Modal';
import { FaClock, FaCheck, FaTrash, FaFileInvoice, FaSearch, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './WorkflowBoard.css';

const WorkflowBoard = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [batchMoving, setBatchMoving] = useState(false);
    const [showNewTestModal, setShowNewTestModal] = useState(false);
    const [showSilverTestModal, setShowSilverTestModal] = useState(false);
    const [certModal, setCertModal] = useState({ show: false, type: 'gold' });
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
    const [activeTab, setActiveTab] = useState('gold');
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);

    const [phase2Modal, setPhase2Modal] = useState({ show: false, test: null, readOnly: false });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [location.search]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/workflow');
            setItems(response.data.data || []);
        } catch (error) {
            addToast('Failed to update workflow board', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── BATCH MOVE ────────────────────────────────────────────────────────
    const handleBatchTransferAll = async () => {
        const testedItems = filteredItems.filter(t => t.status === 'IN_PROGRESS');
        if (testedItems.length === 0) {
            addToast('No items in Tested status to transfer.', 'info');
            return;
        }

        const eligible = testedItems.filter(item => {
            const amount = Number(item.total || 0);
            return Number.isFinite(amount) && amount > 0 && !!item.mode_of_payment;
        });

        if (eligible.length === 0) {
            addToast('No eligible items ready for completion. Add payment details first.', 'info');
            return;
        }

        setBatchMoving(true);
        addToast(`Moving ${eligible.length} items to Completed...`, 'info');
        let count = 0;
        for (const card of eligible) {
            try {
                let resultsEndpoint = '';
                let statusEndpoint = `/workflow/${card.type}/${card.id}/status`;

                if (card.type === 'gold') resultsEndpoint = `/gold-tests/${card.id}/results`;
                else if (card.type === 'silver') resultsEndpoint = `/silver-tests/${card.id}/results`;
                else resultsEndpoint = `/certificates/${card.id}/results`;

                const res = await api.get(card.type === 'gold' ? `/gold-tests/${card.id}` :
                    card.type === 'silver' ? `/silver-tests/${card.id}` :
                        `/certificates/${card.id}?type=${card.type.replace('_cert', '')}`);
                const detail = res.data.data || res.data;
                const cardItems = detail.items || [];

                await api.post(resultsEndpoint, {
                    items: cardItems.map(i => ({ id: i.id, purity: Number(i.purity), returned: !!i.returned })),
                    mode_of_payment: card.mode_of_payment,
                    total: Number(card.total || 0)
                });
                await api.patch(statusEndpoint, { status: 'DONE' });
                count++;
            } catch (err) {
                console.error(`Failed to move item ${card.id}:`, err);
            }
        }
        setBatchMoving(false);
        addToast(`${count} items moved to Completed.`, 'success');
        fetchData();
    };

    // ── CARD CLICK ────────────────────────────────────────────────────────
    const handleCardClick = async (item) => {
        try {
            let details = null;
            if (item.type === 'gold') {
                const res = await api.get(`/gold-tests/${item.id}`);
                details = res.data.data;
            } else if (item.type === 'silver') {
                const res = await api.get(`/silver-tests/${item.id}`);
                details = res.data.data || res.data;
            } else if (item.type.includes('cert')) {
                const apiType = item.type.replace('_cert', '');
                const res = await api.get(`/certificates/${item.id}?type=${apiType}`);
                details = res.data;
            }

            if (!details) {
                addToast("Could not fetch details", 'error');
                return;
            }

            const payload = { ...details, type: item.type, status: item.status };

            if (item.type === 'photo_cert' || item.status === 'TODO' || item.status === 'IN_PROGRESS') {
                setPhase2Modal({ show: true, test: payload, readOnly: false });
            } else if (item.status === 'DONE') {
                setPhase2Modal({ show: true, test: payload, readOnly: true });
            }
        } catch (error) {
            addToast("Opened with limited data (detail fetch failed)", 'error');
        }
    };

    // ── DRAG AND DROP ─────────────────────────────────────────────────────
    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverCol(null);
    };

    const handleDragOver = (e, colId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverCol(colId);
    };

    const handleDragLeave = () => {
        setDragOverCol(null);
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        setDragOverCol(null);
        if (!draggedItem || draggedItem.status === targetStatus) {
            setDraggedItem(null);
            return;
        }

        // Only allow forward moves
        const order = ['TODO', 'IN_PROGRESS', 'DONE'];
        const fromIdx = order.indexOf(draggedItem.status);
        const toIdx = order.indexOf(targetStatus);
        if (toIdx <= fromIdx) {
            addToast('Cards can only move forward (Ongoing → Tested → Completed).', 'info');
            setDraggedItem(null);
            return;
        }

        try {
            if (targetStatus === 'IN_PROGRESS' && draggedItem.status === 'TODO') {
                // Check purity for gold/silver tests
                if (draggedItem.type === 'gold' || draggedItem.type === 'silver') {
                    const endpoint = draggedItem.type === 'gold'
                        ? `/gold-tests/${draggedItem.id}`
                        : `/silver-tests/${draggedItem.id}`;
                    const detailRes = await api.get(endpoint);
                    const detail = detailRes.data?.data;
                    const cardItems = detail?.items || [];
                    const hasPurity = cardItems.length > 0 && cardItems.every(i => {
                        const p = Number(i.purity);
                        return Number.isFinite(p) && p > 0 && p <= 100;
                    });
                    if (!hasPurity) {
                        addToast('⚠️ Add test results (purity) before moving to Tested.', 'warning');
                        setDraggedItem(null);
                        return;
                    }
                }
                await api.patch(`/workflow/${draggedItem.type}/${draggedItem.id}/status`, { status: 'IN_PROGRESS' });
                addToast('Moved to Tested ✓', 'success');
            } else if (targetStatus === 'DONE') {
                const amount = Number(draggedItem.total || 0);
                const mode = (draggedItem.mode_of_payment || '').trim();
                if (!(Number.isFinite(amount) && amount > 0 && mode)) {
                    addToast('⚠️ Add payment details first before moving to Completed.', 'warning');
                    setDraggedItem(null);
                    return;
                }
                await api.patch(`/workflow/${draggedItem.type}/${draggedItem.id}/status`, { status: 'DONE' });
                addToast('Moved to Completed ✓', 'success');
            }
            await fetchData();
        } catch (err) {
            addToast(err.response?.data?.error || 'Move failed', 'error');
        } finally {
            setDraggedItem(null);
        }
    };

    // ── HELPERS ───────────────────────────────────────────────────────────
    const columnsConfig = [
        { id: 'TODO', title: 'Ongoing', color: '#0176d3' },
        { id: 'IN_PROGRESS', title: 'Tested', color: '#f59e0b' },
        { id: 'DONE', title: 'Completed', color: '#10b981' }
    ];

    const getTabTheme = (tab) => {
        if (tab === 'gold') return { accent: 'var(--gold)', light: 'var(--gold-light)', type: 'gold' };
        if (tab === 'silver') return { accent: 'var(--silver)', light: 'var(--silver-light)', type: 'silver' };
        return { accent: '#6366f1', light: '#eef2ff', type: 'cert' };
    };

    const currentTheme = getTabTheme(activeTab);

    // ── SEARCH FILTER ─────────────────────────────────────────────────────
    const filteredItems = items.filter(item => {
        if (item.type !== activeTab) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            (item.customer_name || '').toLowerCase().includes(q) ||
            (item.auto_number || '').toLowerCase().includes(q) ||
            (item.id || '').toString().includes(q)
        );
    });

    const getTypeLabel = (type) => {
        switch (type) {
            case 'gold': return 'Gold Test';
            case 'silver': return 'Silver Test';
            case 'gold_cert': return 'Gold Cert';
            case 'silver_cert': return 'Silver Cert';
            case 'photo_cert': return 'Photo Cert';
            default: return type.toUpperCase();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // ── WEIGHT LOSS DETECTION ─────────────────────────────────────────────
    const hasWeightLoss = (item) => {
        const gross = Number(item.gross_weight || item.total_weight || 0);
        const net = Number(item.net_weight || item.returned_weight || 0);
        return gross > 0 && net > 0 && gross > net + 0.001;
    };

    const weightLossAmount = (item) => {
        const gross = Number(item.gross_weight || item.total_weight || 0);
        const net = Number(item.net_weight || item.returned_weight || 0);
        return (gross - net).toFixed(3);
    };

    // ── CONTEXT MENU ──────────────────────────────────────────────────────
    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, item: item });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
    };

    const handleReceipt = () => {
        if (contextMenu.item) {
            navigate(`/print/${contextMenu.item.type}-test/${contextMenu.item.id}`);
        }
        handleCloseContextMenu();
    };

    const handleDelete = async () => {
        if (contextMenu.item) {
            try {
                await api.delete(`/${contextMenu.item.type}-tests/${contextMenu.item.id}`);
                addToast('Deleted successfully', 'success');
                fetchData();
            } catch (error) {
                addToast('Failed to delete', 'error');
            }
        }
        handleCloseContextMenu();
    };

    useEffect(() => {
        if (contextMenu.visible) {
            document.addEventListener('click', handleCloseContextMenu);
            return () => document.removeEventListener('click', handleCloseContextMenu);
        }
    }, [contextMenu.visible]);

    if (loading && items.length === 0) {
        return (
            <div className="slds-spinner_container" style={{ minHeight: '100vh', background: '#f1f5f9' }}>
                <div className="slds-spinner"></div>
            </div>
        );
    }

    return (
        <div className="workflow-page">

            {/* ── HEADER ── */}
            <div className="board-header">
                <div className="board-title">
                    <h1>Laboratory Workflow</h1>
                    <p>Real-time laboratory operations monitoring</p>
                </div>
                <div className="d-flex gap-3 align-items-center flex-wrap">
                    {/* Search Filter */}
                    <div style={{ position: 'relative', minWidth: '200px' }}>
                        <FaSearch style={{
                            position: 'absolute', left: '10px', top: '50%',
                            transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px'
                        }} />
                        <input
                            id="workflow-search"
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search customer, token..."
                            style={{
                                paddingLeft: '32px', paddingRight: searchTerm ? '30px' : '12px',
                                height: '38px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                                fontSize: '13px', outline: 'none', width: '100%',
                                background: '#f8fafc'
                            }}
                        />
                        {searchTerm && (
                            <FaTimes
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute', right: '10px', top: '50%',
                                    transform: 'translateY(-50%)', color: '#94a3b8',
                                    cursor: 'pointer', fontSize: '12px'
                                }}
                            />
                        )}
                    </div>

                    <Button
                        className="btn-secondary-action"
                        onClick={handleBatchTransferAll}
                        disabled={batchMoving}
                    >
                        {batchMoving ? <Spinner animation="border" size="sm" /> : <><FaCheck className="me-2" /> Batch Move</>}
                    </Button>
                    <Button className="btn-secondary-action" onClick={fetchData}>
                        Refresh
                    </Button>

                    {(() => {
                        const btnText = `+ New ${getTypeLabel(activeTab)}`;
                        const handleNew = () => {
                            if (activeTab === 'gold') setShowNewTestModal(true);
                            else if (activeTab === 'silver') setShowSilverTestModal(true);
                            else {
                                const type = activeTab === 'photo_cert' ? 'photo' : activeTab.replace('_cert', '');
                                setCertModal({ show: true, type });
                            }
                        };
                        return <Button className="btn-action" onClick={handleNew}>{btnText}</Button>;
                    })()}
                </div>
            </div>

            {/* ── TABS ── */}
            <div className={`tab-navigation theme-${currentTheme.type}`}>
                {['gold', 'silver', 'gold_cert', 'silver_cert', 'photo_cert'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => { setActiveTab(tab); setSearchTerm(''); navigate(`?tab=${tab}`); }}
                    >
                        {getTypeLabel(tab)}
                    </button>
                ))}
            </div>

            {/* ── SEARCH RESULT INFO ── */}
            {searchTerm && (
                <div style={{
                    padding: '6px 24px', fontSize: '12px', color: '#64748b',
                    background: '#f8fafc', borderBottom: '1px solid #e2e8f0'
                }}>
                    Showing <strong>{filteredItems.length}</strong> result{filteredItems.length !== 1 ? 's' : ''} for "<strong>{searchTerm}</strong>"
                    <span
                        onClick={() => setSearchTerm('')}
                        style={{ marginLeft: '8px', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                    > × Clear</span>
                </div>
            )}

            {/* ── KANBAN GRID ── */}
            <div className="kanban-grid">
                {columnsConfig.map(col => {
                    const colItems = filteredItems.filter(t => t.status === col.id);
                    const isDragTarget = dragOverCol === col.id && draggedItem && draggedItem.status !== col.id;
                    return (
                        <div
                            key={col.id}
                            className="kanban-column"
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.id)}
                            style={{
                                outline: isDragTarget ? `3px dashed ${col.color}` : 'none',
                                borderRadius: isDragTarget ? '16px' : undefined,
                                background: isDragTarget ? `${col.color}0d` : undefined,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div className="column-header" style={{ backgroundColor: col.color, color: 'white' }}>
                                <h3 className="column-title">{col.title}</h3>
                                <span className="column-count" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    {colItems.length}
                                </span>
                            </div>

                            <div className="column-body">
                                {/* DROP ZONE HINT */}
                                {isDragTarget && (
                                    <div style={{
                                        border: `2px dashed ${col.color}`,
                                        borderRadius: '10px',
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: col.color,
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        marginBottom: '12px',
                                        background: 'white'
                                    }}>
                                        Drop here → {col.title}
                                    </div>
                                )}

                                {colItems.map(item => {
                                    const isReady = item.status === 'IN_PROGRESS' && Number(item.total || 0) > 0 && !!item.mode_of_payment;
                                    const shortId = item.auto_number?.split('-')[1] || item.auto_number;
                                    const showWtLoss = item.status === 'DONE' && hasWeightLoss(item);
                                    const isDragging = draggedItem?.id === item.id && draggedItem?.type === item.type;
                                    return (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="kanban-card mb-3"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => !draggedItem && handleCardClick(item)}
                                            onContextMenu={(e) => handleContextMenu(e, item)}
                                            style={{
                                                opacity: isDragging ? 0.4 : 1,
                                                cursor: 'grab',
                                                transition: 'opacity 0.2s ease'
                                            }}
                                        >
                                            <div className="card-top d-flex justify-content-between">
                                                <div className="card-customer">{item.customer_name || 'Anonymous'}</div>
                                                <Badge bg="dark" className="p-2">#{shortId}</Badge>
                                            </div>
                                            <div className="card-meta">
                                                <FaClock className="me-1" /> {formatDate(item.createdon)}
                                            </div>
                                            {/* Weight Loss Alert Badge */}
                                            {showWtLoss && (
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    background: '#fef3c7', border: '1px solid #f59e0b',
                                                    borderRadius: '6px', padding: '3px 8px',
                                                    fontSize: '11px', fontWeight: 700, color: '#92400e',
                                                    margin: '4px 0'
                                                }}>
                                                    <FaExclamationTriangle style={{ color: '#f59e0b' }} />
                                                    Weight Loss: {weightLossAmount(item)}g
                                                </div>
                                            )}
                                            {isReady && <div className="ready-indicator"><FaCheck /></div>}
                                            <div className="card-footer">
                                                <span className="type-tag">{item.type.replace('_cert', '')}</span>
                                                {item.status !== 'TODO' && item.total > 0 && (
                                                    <span className="card-amount" style={{ color: col.color }}>
                                                        ₹{Number(item.total).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {colItems.length === 0 && !isDragTarget && (
                                    <div className="empty-state">No {col.title.toLowerCase()} items</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── MODALS ── */}
            <NewGoldTestModal
                show={showNewTestModal}
                onHide={() => setShowNewTestModal(false)}
                onSuccess={fetchData}
            />
            <NewSilverTestModal
                show={showSilverTestModal}
                onHide={() => setShowSilverTestModal(false)}
                onSuccess={fetchData}
            />
            <NewCertificateModal
                show={certModal.show}
                type={certModal.type}
                onHide={() => setCertModal({ ...certModal, show: false })}
                onSuccess={fetchData}
            />
            <Phase2Modal
                show={phase2Modal.show}
                test={phase2Modal.test}
                readOnly={phase2Modal.readOnly}
                onHide={() => setPhase2Modal({ ...phase2Modal, show: false })}
                onSuccess={fetchData}
            />

            {contextMenu.visible && (
                <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button className="menu-item" onClick={handleReceipt}>
                        <FaFileInvoice className="me-2" /> View Receipt
                    </button>
                    <button className="menu-item danger" onClick={handleDelete}>
                        <FaTrash className="me-2" /> Delete Permanent
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkflowBoard;
