import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import NewGoldTestModal from '../components/NewGoldTestModal';
import NewSilverTestModal from '../components/NewSilverTestModal';
import NewCertificateModal from '../components/NewCertificateModal';
import Phase2Modal from '../components/Phase2Modal';
import { FaClock, FaCheck, FaTrash, FaFileInvoice, FaSearch, FaTimes, FaCertificate, FaLock, FaPlus } from 'react-icons/fa';
import { useSocket } from '../hooks/useSocket';
import { usePrint } from '../contexts/PrintContext';
import { useWorkflow, WORKFLOW_KEYS, WORKFLOW_BY_KEY } from '../contexts/WorkflowContext';
import { getAgingBucket, agingTitle } from '../utils/aging';
import './WorkflowBoard.css';

const COLUMN_LIMIT = 200;
const createRequestId = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// ── Board mutation helpers (pure — take board object, return new board object) ──

function replaceAcrossColumns(board, updated) {
    const result = {};
    for (const col of ['TODO', 'IN_PROGRESS', 'DONE']) {
        result[col] = (board[col] || []).map(item =>
            item.id === updated.id && item.type === updated.type ? updated : item
        );
    }
    return result;
}


function removeFromAllColumns(board, id, type) {
    const result = {};
    for (const col of ['TODO', 'IN_PROGRESS', 'DONE']) {
        result[col] = (board[col] || []).filter(i => !(i.id === id && i.type === type));
    }
    return result;
}

function prependToColumn(board, newItem) {
    // Remove any existing entry for this id+type first — prevents duplicate cards
    // if socket delivers item:added after the item was already moved to another column.
    const cleaned = removeFromAllColumns(board, newItem.id, newItem.type);
    const col = newItem.status || 'TODO';
    return {
        ...cleaned,
        [col]: [newItem, ...(cleaned[col] || [])].slice(0, COLUMN_LIMIT),
    };
}

const WorkflowBoard = () => {
    const { addToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const { triggerPrint } = usePrint();
    const {
        selectedWorkflow,
        setSelectedWorkflow,
        requestNewWorkflow,
        newRequest,
        consumeNewRequest,
        setOpenModalKey,
        registerModalCloser,
    } = useWorkflow();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewTestModal, setShowNewTestModal] = useState(false);
    const [showSilverTestModal, setShowSilverTestModal] = useState(false);
    const [certModal, setCertModal] = useState({ show: false, type: 'gold' });
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);

    const [phase2Modal, setPhase2Modal] = useState({ show: false, test: null, readOnly: false });
    const [board, setBoard] = useState({ TODO: [], IN_PROGRESS: [], DONE: [] });
    // Low-frequency tick so aging-bucket boundaries (30m/2h/1d) cross without
    // requiring a fetch. 60s is well under the smallest bucket width.
    const [nowMs, setNowMs] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 60 * 1000);
        return () => clearInterval(id);
    }, []);
    const fetchSequenceRef  = React.useRef(0);
    const actionSequenceRef = React.useRef(0);
    const lastVersions      = React.useRef({});   // { id: version } — stale-update guard
    const pendingIds        = React.useRef(new Set()); // ids of in-flight optimistic writes

    // Legacy ?tab= URL support — map once into the context, then strip from URL
    // so the sidebar (and not the URL) becomes the source of truth.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && WORKFLOW_KEYS.includes(tab)) {
            setSelectedWorkflow(tab);
            params.delete('tab');
            const query = params.toString();
            navigate(`${location.pathname}${query ? `?${query}` : ''}`, { replace: true });
        }
    }, [location.search, location.pathname, navigate, setSelectedWorkflow]);

    const fetchData = useCallback(async () => {
        const requestSeq = ++fetchSequenceRef.current;
        setLoading(true);
        try {
            const response = await api.get('/workflow/kanban', { params: { limit: COLUMN_LIMIT } });
            const nextBoard = response.data.data || { TODO: [], IN_PROGRESS: [], DONE: [] };
            if (requestSeq !== fetchSequenceRef.current) {
                return;
            }
            setBoard(nextBoard);
            setItems([...(nextBoard.TODO || []), ...(nextBoard.IN_PROGRESS || []), ...(nextBoard.DONE || [])]);
        } catch (error) {
            addToast('Failed to update workflow board', 'error');
        } finally {
            if (requestSeq === fetchSequenceRef.current) {
                setLoading(false);
            }
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const applyBoardState = useCallback((nextBoard) => {
        setBoard(nextBoard);
        setItems([...(nextBoard.TODO || []), ...(nextBoard.IN_PROGRESS || []), ...(nextBoard.DONE || [])]);
    }, []);

    // Fetch a single record and normalize it to the kanban board shape
    const fetchBoardItem = useCallback(async (id, type) => {
        try {
            let raw;
            if (type === 'gold') {
                const res = await api.get(`/gold-tests/${id}`);
                raw = res.data.data;
            } else if (type === 'silver') {
                const res = await api.get(`/silver-tests/${id}`);
                raw = res.data.data || res.data;
            } else {
                const apiType = type.replace('_cert', '');
                const res = await api.get(`/certificates/${id}?type=${apiType}`);
                raw = res.data.data || res.data;
            }
            if (!raw) return null;
            return {
                type,
                id           : raw.id,
                customer_id  : raw.customer_id,
                auto_number  : raw.auto_number,
                status       : raw.status,
                total        : raw.total || 0,
                mode_of_payment: raw.mode_of_payment,
                createdon    : raw.created || raw.createdon,
                customer_name: raw.customer_name,
                has_snapshot : raw.has_snapshot ?? (raw.print_snapshot ? 1 : 0),
                version      : raw.version || 0,
            };
        } catch {
            return null;
        }
    }, []);

    const moveCardInBoard = useCallback((currentBoard, item, targetStatus) => {
        const nextBoard = {
            TODO: [...(currentBoard.TODO || [])],
            IN_PROGRESS: [...(currentBoard.IN_PROGRESS || [])],
            DONE: [...(currentBoard.DONE || [])],
        };

        Object.keys(nextBoard).forEach((columnKey) => {
            nextBoard[columnKey] = nextBoard[columnKey].filter((entry) => !(entry.id === item.id && entry.type === item.type));
        });

        const movedItem = { ...item, status: targetStatus };
        nextBoard[targetStatus] = [movedItem, ...(nextBoard[targetStatus] || [])].slice(0, COLUMN_LIMIT);
        return nextBoard;
    }, []);

    // Real-time updates — targeted per-ID updates with version guard
    useSocket(
        ['gold_test', 'silver_test', 'gold_cert', 'silver_cert', 'workflow'],
        {
            'item:added': async ({ id, type }) => {
                if (!id || !type || pendingIds.current.has(id)) return;
                const fresh = await fetchBoardItem(id, type);
                if (!fresh) return;
                lastVersions.current[id] = fresh.version;
                setBoard(prev => prependToColumn(prev, fresh));
                setItems(prev => [fresh, ...prev.filter(i => !(i.id === id && i.type === type))]);
            },
            'item:updated': async ({ id, type }) => {
                if (!id || !type || pendingIds.current.has(id)) return;
                const prevVer = lastVersions.current[id] || 0;
                const fresh = await fetchBoardItem(id, type);
                if (!fresh || fresh.version <= prevVer) return;
                lastVersions.current[id] = fresh.version;
                setBoard(prev => replaceAcrossColumns(prev, fresh));
                setItems(prev => prev.map(i => (i.id === id && i.type === type) ? fresh : i));
            },
            'item:done': async ({ id, type }) => {
                if (!id || !type || pendingIds.current.has(id)) return;
                const fresh = await fetchBoardItem(id, type);
                if (!fresh) return;
                const prevVer = lastVersions.current[id] || 0;
                if (fresh.version <= prevVer) return;
                lastVersions.current[id] = fresh.version;
                setBoard(prev => replaceAcrossColumns(prev, fresh));
                setItems(prev => prev.map(i => (i.id === id && i.type === type) ? fresh : i));
            },
            'cert:created': async ({ id, type }) => {
                if (!id || !type || pendingIds.current.has(id)) return;
                // cert:created emits test type ('gold'/'silver'); map to cert type
                const certType = type.endsWith('_cert') ? type : `${type}_cert`;
                const fresh = await fetchBoardItem(id, certType);
                if (!fresh) return;
                lastVersions.current[id] = fresh.version;
                setBoard(prev => prependToColumn(prev, fresh));
                setItems(prev => [fresh, ...prev.filter(i => !(i.id === id && i.type === certType))]);
            },
            'cert:updated': async ({ id, type }) => {
                if (!id || !type || pendingIds.current.has(id)) return;
                const certType = type.endsWith('_cert') ? type : `${type}_cert`;
                const prevVer = lastVersions.current[id] || 0;
                const fresh = await fetchBoardItem(id, certType);
                if (!fresh || fresh.version <= prevVer) return;
                lastVersions.current[id] = fresh.version;
                setBoard(prev => replaceAcrossColumns(prev, fresh));
                setItems(prev => prev.map(i => (i.id === id && i.type === certType) ? fresh : i));
            },
            'cert:done': async ({ id, type }) => {
                if (!id || !type || pendingIds.current.has(id)) return;
                const certType = type.endsWith('_cert') ? type : `${type}_cert`;
                const fresh = await fetchBoardItem(id, certType);
                if (!fresh) return;
                const prevVer = lastVersions.current[id] || 0;
                if (fresh.version <= prevVer) return;
                lastVersions.current[id] = fresh.version;
                setBoard(prev => replaceAcrossColumns(prev, fresh));
                setItems(prev => prev.map(i => (i.id === id && i.type === certType) ? fresh : i));
            },
        },
        [fetchBoardItem]
    );

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

        const itemId = draggedItem.id;
        const itemType = draggedItem.type;
        pendingIds.current.add(itemId);
        const previousBoard = board;
        try {
            const actionSeq = ++actionSequenceRef.current;
            applyBoardState(moveCardInBoard(previousBoard, draggedItem, targetStatus));

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
                        // Gate rejected the move — roll back the optimistic
                        // UI so the card returns to its source column rather
                        // than visually stranding in IN_PROGRESS while
                        // pendingIds blocks socket reconciliation.
                        applyBoardState(previousBoard);
                        addToast('⚠️ Add test results (purity) before moving to Tested.', 'warning');
                        setDraggedItem(null);
                        return;
                    }
                }
                await api.post('/workflow/move', {
                    testId: draggedItem.id,
                    type: draggedItem.type,
                    toStatus: 'IN_PROGRESS'
                }, {
                    headers: { 'X-Request-Id': createRequestId() }
                });
                addToast('Moved to Tested ✓', 'success');
            } else if (targetStatus === 'DONE') {
                const amount = Number(draggedItem.total || 0);
                const mode = (draggedItem.mode_of_payment || '').trim();
                if (!(Number.isFinite(amount) && amount > 0 && mode)) {
                    // Gate rejected the move — roll back the optimistic UI.
                    // Same rationale as the TODO → IN_PROGRESS gate above.
                    applyBoardState(previousBoard);
                    addToast('⚠️ Add payment details first before moving to Completed.', 'warning');
                    setDraggedItem(null);
                    return;
                }
                if (draggedItem.type === 'gold' || draggedItem.type === 'silver') {
                    const endpoint = draggedItem.type === 'gold' ? `/gold-tests/${draggedItem.id}` : `/silver-tests/${draggedItem.id}`;
                    const detailRes = await api.get(endpoint);
                    const cardItems = detailRes.data?.data?.items || [];
                    const totalWtLoss = cardItems.reduce((acc, it) => acc + (
                        Number(it.gross_weight || 0) - (Number(it.test_weight || 0) + Number(it.net_weight || 0))
                    ), 0);
                    await api.post(`/${draggedItem.type}-tests/${draggedItem.id}/finalize`, {
                        items: cardItems.map(i => ({ id: i.id, purity: Number(i.purity), returned: !!i.returned, item_number: i.item_number || i.item_no })),
                        mode_of_payment: mode,
                        weight_loss: Math.max(0, totalWtLoss),
                        cert: { gst: detailRes.data?.data?.gst === 1 }
                    }, {
                        headers: { 'X-Request-Id': createRequestId() }
                    });
                } else {
                    await api.post('/workflow/finalize', {
                        testId: draggedItem.id,
                        type: draggedItem.type
                    }, {
                        headers: { 'X-Request-Id': createRequestId() }
                    });
                }
                addToast('Moved to Completed ✓', 'success');
            }
            if (actionSeq === actionSequenceRef.current) {
                // Targeted single-item fetch to confirm server state after move
                const fresh = await fetchBoardItem(itemId, itemType);
                if (fresh && actionSeq === actionSequenceRef.current) {
                    setBoard(prev => replaceAcrossColumns(prev, fresh));
                    setItems(prev => prev.map(i => (i.id === fresh.id && i.type === fresh.type) ? fresh : i));
                    lastVersions.current[itemId] = fresh.version;
                }
            }
        } catch (err) {
            applyBoardState(previousBoard);
            addToast(err.response?.data?.error || 'Move failed', 'error');
        } finally {
            setDraggedItem(null);
            setTimeout(() => pendingIds.current.delete(itemId), 500);
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

    const currentTheme = getTabTheme(selectedWorkflow);

    // Clear search when switching workflows so filters don't carry across queues.
    const lastSelectedRef = React.useRef(selectedWorkflow);
    useEffect(() => {
        if (lastSelectedRef.current !== selectedWorkflow) {
            setSearchTerm('');
            lastSelectedRef.current = selectedWorkflow;
        }
    }, [selectedWorkflow]);

    // ── SEARCH FILTER ─────────────────────────────────────────────────────
    const filteredItems = items.filter(item => {
        if (item.type !== selectedWorkflow) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            (item.customer_name || '').toLowerCase().includes(q) ||
            (item.auto_number || '').toLowerCase().includes(q) ||
            (item.id || '').toString().includes(q)
        );
    });

    // ── NEW-WORKFLOW REQUESTS FROM SIDEBAR ────────────────────────────────
    // Sidebar + button publishes a {key, nonce} token. Atomic consume — the
    // context drops the token on read, so Strict Mode double-invoke and
    // multi-subscriber races can't replay the open.
    // Guard: if the matching modal is already open, do nothing (operator
    // repeat-click protection — preserves draft form state).
    useEffect(() => {
        if (!newRequest) return;
        const token = consumeNewRequest();
        if (!token) return;
        const { key } = token;

        const certType = key === 'photo_cert' ? 'photo' : key.replace('_cert', '');
        const alreadyOpenForKey =
            (key === 'gold'   && showNewTestModal) ||
            (key === 'silver' && showSilverTestModal) ||
            (key.endsWith('_cert') && certModal.show && certModal.type === certType);
        if (alreadyOpenForKey) return;

        if (key === 'gold') {
            setShowNewTestModal(true);
        } else if (key === 'silver') {
            setShowSilverTestModal(true);
        } else {
            setCertModal({ show: true, type: certType });
        }
    }, [newRequest, consumeNewRequest, showNewTestModal, showSilverTestModal, certModal]);

    // Report current open new-* modal to the context so the sidebar's
    // workflow-switch guard knows when to prompt the operator.
    useEffect(() => {
        let key = null;
        if (showNewTestModal) key = 'gold';
        else if (showSilverTestModal) key = 'silver';
        else if (certModal.show) {
            const t = certModal.type;
            key = t === 'gold' ? 'gold_cert'
                : t === 'silver' ? 'silver_cert'
                : t === 'photo' ? 'photo_cert'
                : null;
        }
        setOpenModalKey(key);
    }, [showNewTestModal, showSilverTestModal, certModal, setOpenModalKey]);

    // Register the closer the switch guard calls when the operator confirms
    // abandoning an in-progress entry. Closes every new-* modal type.
    useEffect(() => {
        const closer = () => {
            setShowNewTestModal(false);
            setShowSilverTestModal(false);
            setCertModal((prev) => ({ ...prev, show: false }));
        };
        return registerModalCloser(closer);
    }, [registerModalCloser]);

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

    // Section title for the current workflow, with the next-cert-item-number
    // preview for GC / SC / PC. The peek value comes from the kanban response
    // so it stays in sync with each refresh — read-only, does not increment.
    const getSectionTitle = (key) => {
        const seqs = board.nextCertSeqs || {};
        switch (key) {
            case 'gold':        return 'Gold Test';
            case 'silver':      return 'Silver Test';
            case 'gold_cert':   return `Gold Certificate Testing${seqs.gold   ? ` (${seqs.gold})`   : ''}`;
            case 'silver_cert': return `Silver Certificate Testing${seqs.silver ? ` (${seqs.silver})` : ''}`;
            case 'photo_cert':  return `Photo Certificate Testing${seqs.photo  ? ` (${seqs.photo})`  : ''}`;
            default: return String(key || '').toUpperCase();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };


    // ── CONTEXT MENU ──────────────────────────────────────────────────────
    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, item: item });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
    };

    // Map workflow item.type → PrintContext route key.
    // Tests print via the same route in both Receipt (layout:receipt) and
    // Certificate (full layout) modes; certificates have their own routes.
    const PRINT_ROUTE_BY_TYPE = {
        gold       : 'gold-test',
        silver     : 'silver-test',
        gold_cert  : 'gold-certificate',
        silver_cert: 'silver-certificate',
        photo_cert : 'photo-certificate',
    };

    // Card-quick-print: one-click receipt direct from the kanban card
    // without opening Phase2Modal. Reuses the same triggerPrint('receipt')
    // path as the context-menu Receipt action. stopPropagation prevents
    // the card body's onClick from firing in parallel.
    const handleCardReceipt = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        if (!item) return;
        const printType = PRINT_ROUTE_BY_TYPE[item.type];
        if (!printType) {
            addToast('Receipt is only available for known workflows.', 'info');
            return;
        }
        try {
            await triggerPrint(printType, item.id, { layout: 'receipt' });
        } catch (err) {
            addToast('Failed to generate receipt. Please try again.', 'error');
        }
    };

    const handleReceipt = async () => {
        if (contextMenu.item) {
            const { type, id } = contextMenu.item;
            const printType = PRINT_ROUTE_BY_TYPE[type];
            if (!printType) {
                addToast('Receipt is only available for tests.', 'info');
                handleCloseContextMenu();
                return;
            }
            try {
                await triggerPrint(printType, id, { layout: 'receipt' });
            } catch (err) {
                addToast('Failed to generate receipt. Please try again.', 'error');
            }
        }
        handleCloseContextMenu();
    };

    const handleCertificate = async () => {
        if (contextMenu.item) {
            const { type, id } = contextMenu.item;
            const printType = PRINT_ROUTE_BY_TYPE[type];
            if (!printType) {
                addToast('Unknown item type.', 'error');
                handleCloseContextMenu();
                return;
            }
            try {
                await triggerPrint(printType, id);
            } catch (err) {
                addToast('Failed to generate certificate. Please try again.', 'error');
            }
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
        <div className="workflow-page slds-scope">

            {/* ── HEADER — SLDS page-header pattern ── */}
            <div className="slds-page-header workflow-page-header">
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-title">
                        <div className="slds-media">
                            <div className="slds-media__body">
                                <div className="slds-page-header__name">
                                    <div className="slds-page-header__name-title">
                                        <h1>
                                            <span className="slds-page-header__title slds-truncate" title="Laboratory Workflow">
                                                Laboratory Workflow
                                            </span>
                                        </h1>
                                    </div>
                                </div>
                                <p className="slds-page-header__meta-text">Real-time laboratory operations monitoring</p>
                            </div>
                        </div>
                    </div>
                    <div className="slds-page-header__col-actions">
                        <div className="slds-page-header__controls">
                            {/* Search Filter — SLDS form-element + input-has-icon pattern */}
                            <div className="slds-page-header__control">
                                <div className="slds-form-element">
                                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left-right">
                                        <FaSearch className="slds-icon slds-input__icon slds-input__icon_left slds-icon-text-default workflow-search-icon" aria-hidden="true" />
                                        <input
                                            id="workflow-search"
                                            type="text"
                                            className="slds-input workflow-search-input"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Search customer, token..."
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                className="slds-button slds-button_icon slds-input__icon slds-input__icon_right"
                                                onClick={() => setSearchTerm('')}
                                                aria-label="Clear search"
                                            >
                                                <FaTimes aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="slds-page-header__control">
                                <Button
                                    className="slds-button slds-button_brand"
                                    onClick={() => requestNewWorkflow(selectedWorkflow)}
                                    aria-label={`New ${WORKFLOW_BY_KEY[selectedWorkflow]?.label || 'Record'}`}
                                >
                                    <FaPlus aria-hidden="true" className="me-1" />
                                    New {WORKFLOW_BY_KEY[selectedWorkflow]?.label || 'Record'}
                                </Button>
                            </div>
                            <div className="slds-page-header__control">
                                <Button className="slds-button slds-button_neutral" onClick={fetchData}>
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BODY: full-width Kanban (workflow rail moved into Sidebar) ── */}
            <div className={`workflow-body theme-${currentTheme.type}`}>
                <div className="workflow-main">
                    {/* ── SECTION TITLE — code echo anchors operator to the active queue ── */}
                    <div className="section-title-row">
                        {WORKFLOW_BY_KEY[selectedWorkflow] && (
                            <span
                                className={`workflow-code workflow-code--lg workflow-code--${selectedWorkflow}`}
                                aria-hidden="true"
                            >
                                {WORKFLOW_BY_KEY[selectedWorkflow].code}
                            </span>
                        )}
                        <span className="section-title-text">{getSectionTitle(selectedWorkflow)}</span>
                    </div>

                    {(selectedWorkflow === 'gold_cert' ||
                      selectedWorkflow === 'silver_cert' ||
                      selectedWorkflow === 'photo_cert') && (
                        <div className="sequence-policy-helper" role="note">
                            Sequence numbers reset each calendar year. Existing records permanently retain their original sequence.
                            Skipped numbers can occur after cancellations, retries, or protected audit flows.
                        </div>
                    )}

                    {/* ── SEARCH RESULT INFO ── */}
                    {searchTerm && (
                        <div className="search-result-info">
                            Showing <strong>{filteredItems.length}</strong> result{filteredItems.length !== 1 ? 's' : ''} for "<strong>{searchTerm}</strong>"
                            <span
                                onClick={() => setSearchTerm('')}
                                className="search-result-clear"
                            > × Clear</span>
                        </div>
                    )}

                    {/* ── KANBAN GRID — SLDS grid container, custom columns inside ── */}
                    <div className="kanban-grid slds-grid slds-gutters slds-wrap">
                {columnsConfig.map(col => {
                    const colItems = (board[col.id] || []).filter(item => {
                        if (item.type !== selectedWorkflow) return false;
                        if (!searchTerm.trim()) return true;
                        const q = searchTerm.toLowerCase();
                        return (
                            (item.customer_name || '').toLowerCase().includes(q) ||
                            (item.auto_number || '').toLowerCase().includes(q) ||
                            (item.id || '').toString().includes(q)
                        );
                    });
                    // Column-level severity = oldest item in this column. DONE
                    // is always fresh (aging excluded for sealed work), so the
                    // Completed header never gets a severity chip.
                    let colSeverity = 0;
                    let colSeverityBucket = 'fresh';
                    let colSeverityLabel = null;
                    if (col.id !== 'DONE') {
                        for (const item of colItems) {
                            const a = getAgingBucket(item.createdon, item.status, nowMs);
                            if (a.severity > colSeverity) {
                                colSeverity = a.severity;
                                colSeverityBucket = a.bucket;
                                colSeverityLabel = a.label;
                            }
                            if (colSeverity === 3) break; // can't get worse than cold
                        }
                    }
                    const showColSeverity = colSeverity > 0;
                    const isDragTarget = dragOverCol === col.id && draggedItem && draggedItem.status !== col.id;
                    return (
                        <div
                            key={col.id}
                            className="kanban-column slds-col slds-size_1-of-1 slds-medium-size_1-of-3"
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
                            {/* SLDS card structure; column color preserved as the header band */}
                            <article className="slds-card kanban-column__card">
                                <div className="slds-card__header column-header" style={{ backgroundColor: col.color, color: 'white' }}>
                                    <header className="slds-media slds-media_center slds-has-flexi-truncate">
                                        <div className="slds-media__body">
                                            <h3 className="slds-card__header-title column-title">{col.title}</h3>
                                        </div>
                                        <div className="slds-no-flex column-header__meta">
                                            {showColSeverity && (
                                                <span
                                                    className={`column-severity column-severity--${colSeverityBucket}`}
                                                    title={`Oldest ${col.title.toLowerCase()} item: ${agingTitle(colSeverity)}`}
                                                    aria-label={`Oldest ${col.title.toLowerCase()} item: ${agingTitle(colSeverity)}`}
                                                >
                                                    {colSeverityLabel}
                                                </span>
                                            )}
                                            <span className="slds-badge column-count" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                                {colItems.length}
                                            </span>
                                        </div>
                                    </header>
                                </div>

                                <div className="slds-card__body column-body">
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
                                    const isSealed = item.status === 'DONE';
                                    const shortId = item.auto_number?.split('-')[1] || item.auto_number;
                                    const isDragging = draggedItem?.id === item.id && draggedItem?.type === item.type;
                                    const aging = getAgingBucket(item.createdon, item.status, nowMs);
                                    return (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className={`kanban-card mb-3 kanban-card--aging-${aging.bucket}${isSealed ? ' kanban-card--sealed' : ''}`}
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
                                                <div className="d-flex align-items-center gap-1">
                                                    <button
                                                        type="button"
                                                        className="kanban-card__receipt-btn"
                                                        onClick={(e) => handleCardReceipt(e, item)}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        aria-label="Print receipt"
                                                        title="Print Receipt"
                                                    >
                                                        <FaFileInvoice aria-hidden="true" />
                                                    </button>
                                                    <Badge bg="dark" className="p-2">#{shortId}</Badge>
                                                </div>
                                            </div>
                                            <div className="card-meta">
                                                <FaClock className="me-1" /> {formatDate(item.createdon)}
                                                {aging.label && (
                                                    <span
                                                        className={`kanban-card__aging-badge kanban-card__aging-badge--${aging.bucket}`}
                                                        title={agingTitle(aging.severity)}
                                                        aria-label={agingTitle(aging.severity)}
                                                    >
                                                        {aging.label}
                                                    </span>
                                                )}
                                            </div>
                                            {isReady && <div className="ready-indicator"><FaCheck /></div>}
                                            {isSealed && (
                                                <div
                                                    className="kanban-card__sealed-indicator"
                                                    aria-label="Sealed — finalized record, not editable"
                                                    title="Sealed — finalized record, not editable"
                                                >
                                                    <FaLock aria-hidden="true" />
                                                </div>
                                            )}
                                            <div className="card-footer">
                                                <span className="type-tag">{item.type.replace('_cert', '')}</span>
                                                {isSealed && (
                                                    <span className="card-sealed-tag" aria-hidden="true">
                                                        SEALED
                                                    </span>
                                                )}
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
                            </article>
                        </div>
                    );
                })}
                    </div>
                </div>
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
                    {/* Python parity: Tested/Completed show Certificate; Ongoing/Completed
                        show Receipt (GT/ST only — certs have their own print path); Delete is
                        hidden once DONE. */}
                    {(contextMenu.item?.status === 'IN_PROGRESS' || contextMenu.item?.status === 'DONE') && (
                        <button className="menu-item" onClick={handleCertificate}>
                            <FaCertificate className="me-2" /> Certificate
                        </button>
                    )}
                    {(contextMenu.item?.status === 'TODO' || contextMenu.item?.status === 'DONE')
                        && (contextMenu.item?.type === 'gold' || contextMenu.item?.type === 'silver') && (
                        <button className="menu-item" onClick={handleReceipt}>
                            <FaFileInvoice className="me-2" /> Receipt
                        </button>
                    )}
                    {contextMenu.item?.status !== 'DONE' && (
                        <button className="menu-item danger" onClick={handleDelete}>
                            <FaTrash className="me-2" /> Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkflowBoard;
