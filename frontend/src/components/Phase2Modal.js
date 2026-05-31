import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Alert, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { FaCamera, FaCopy, FaFileAlt, FaExclamationTriangle, FaFileInvoice, FaLock } from 'react-icons/fa';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import PriceCalculationTable from './core/PriceCalculationTable';
import api from '../services/api';
import { usePrint } from '../contexts/PrintContext';
import useSafeModalClose from '../hooks/useSafeModalClose';
import useFocusWhen from '../hooks/useFocusWhen';

const CURRENT_SYSTEM = 'LAB';

const getWeights = (item) => {
    const gross = Number(item.gross_weight || 0);
    const test  = Number(item.test_weight  || 0);
    const net = (item.net_weight != null && item.net_weight !== '')
        ? Number(item.net_weight)
        : parseFloat((gross - test).toFixed(3));
    const loss = parseFloat((gross - (test + net)).toFixed(3));
    return { gross, test, net, loss };
};

const clampDecimals = (value, dp) => {
    if (value === '' || value === null || value === undefined) return '';
    const n = parseFloat(value);
    if (isNaN(n)) return '';
    return parseFloat(n.toFixed(dp));
};

const blockInvalidNumericKeys = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
};

const sanitizeNumericString = (raw, dp) => {
    const stripped = String(raw).replace(/[^0-9.]/g, '');
    const firstDot = stripped.indexOf('.');
    const singleDot = firstDot === -1
        ? stripped
        : stripped.slice(0, firstDot + 1) + stripped.slice(firstDot + 1).replace(/\./g, '');
    return clampDecimals(singleDot, dp);
};

const normalizeItemValues = (itemList) =>
    itemList.map(item => ({
        ...item,
        purity     : item.purity !== '' ? clampDecimals(item.purity, 2) : '',
        test_weight: item.test_weight != null && item.test_weight !== ''
            ? clampDecimals(item.test_weight, 3) : item.test_weight,
        net_weight : item.net_weight  != null && item.net_weight  !== ''
            ? clampDecimals(item.net_weight, 3)  : item.net_weight,
    }));

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const Phase2Modal = ({ show, onHide, test, onSuccess, onConflict, readOnly = false }) => {
    const { addToast } = useToast();
    const { openModal } = useModal();
    const { triggerPrint } = usePrint();
    const [items, setItems] = useState([]);
    const [modeOfPayment, setModeOfPayment] = useState('Cash');
    const [amount, setAmount] = useState('');
    // Per-workflow flat prices fetched once per modal-open. Mirrors Python's
    // `PRICE` class constants (GT=30, GC=50, SC=100, PC=50; ST mirrors GT=30
    // per the locked GT=ST decision). Amount field auto-populates as
    // `price × items.length` when empty — operator override always wins.
    const [rates, setRates] = useState(null);
    const [weightLoss, setWeightLoss] = useState('0');
    const [includeGst, setIncludeGst] = useState(false);
    const [certificateRequired, setCertificateRequired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [photos, setPhotos] = useState({});

    // Centralized safe-close: handles backdrop sweep, body-scroll unlock,
    // focus restore, rapid-click guard, async-after-unmount guard.
    const resetTransientState = () => {
        setLoading(false);
        setError('');
    };
    const { safeClose, mountedRef } = useSafeModalClose({ show, onHide });
    const closeSafely = () => safeClose({ reset: resetTransientState });

    const isSystemReadOnly = CURRENT_SYSTEM !== 'LAB';
    const isModalReadOnly = readOnly || isSystemReadOnly;

    const isPhotoCert  = test?.type === 'photo_cert' || test?.id?.startsWith('PCR');
    const isGoldTest   = test?.type === 'gold'   || test?.id?.startsWith('GT');
    const isSilverTest = test?.type === 'silver' || test?.id?.startsWith('ST');
    const isCertificate = test?.type?.includes('cert') || test?.id?.startsWith('GCR') || test?.id?.startsWith('SCR') || isPhotoCert;

    // Resolve the workflow's per-item flat price from the cached rates.
    // Returns 0 if rates haven't loaded yet (auto-populate then no-ops).
    const getWorkflowPrice = () => {
        if (!rates) return 0;
        if (isGoldTest)                                 return Number(rates.price_gold_test)   || 0;
        if (isSilverTest)                               return Number(rates.price_silver_test) || 0;
        if (test?.type === 'gold_cert'   || test?.id?.startsWith('GCR')) return Number(rates.price_gold_cert)   || 0;
        if (test?.type === 'silver_cert' || test?.id?.startsWith('SCR')) return Number(rates.price_silver_cert) || 0;
        if (isPhotoCert)                                return Number(rates.price_photo_cert)  || 0;
        return 0;
    };

    const currentStatus = test?.status || '';
    const isTodoStage = currentStatus === 'TODO';
    const isDoneStage = currentStatus === 'DONE';

    // Land the cursor on the operator's next field when the modal opens:
    // purity on a TODO test, amount on the Payment & Delivery step.
    const firstPurityRef = useRef(null);
    const amountRef = useRef(null);
    // Spreadsheet-style Enter-to-advance: a ref per row's editable cell so
    // pressing Enter jumps straight down the column (and the last purity hands
    // off to the primary action button), keeping the operator on the keyboard
    // instead of Tabbing past the Returned checkbox + Print button each row.
    const purityRefs = useRef([]);
    const testWeightRefs = useRef([]);
    const submitBtnRef = useRef(null);
    // Gate on items.length so we focus only after the rows (and the purity
    // input) have actually rendered — items populate in an effect on `show`,
    // a frame after the modal mounts.
    useFocusWhen(firstPurityRef, show && isTodoStage && !isModalReadOnly && items.length > 0);
    useFocusWhen(amountRef, show && !isTodoStage && !isDoneStage && !isModalReadOnly && items.length > 0);
    const nextStatus = currentStatus === 'TODO'
        ? 'IN_PROGRESS'
        : currentStatus === 'IN_PROGRESS' ? 'DONE' : null;

    // Fetch per-workflow rates once when the modal opens. Single GET per
    // open; cached for the lifetime of the modal session.
    useEffect(() => {
        if (!show) return;
        let cancelled = false;
        api.get('/analytics/rates')
            .then((r) => { if (!cancelled) setRates(r.data?.data || {}); })
            .catch(() => { if (!cancelled) setRates({}); });
        return () => { cancelled = true; };
    }, [show]);

    // Auto-populate Amount from configured per-workflow price × items.length.
    // Operator override wins: only fires when the field is currently empty.
    // Skipped for DONE records (amount is already sealed) and when no items
    // are present yet (mid-load).
    useEffect(() => {
        if (!show || isDoneStage || !rates || items.length === 0) return;
        if (amount !== '' && amount !== 0 && amount !== '0') return;
        const price = getWorkflowPrice();
        if (price <= 0) return;
        setAmount(String(price * items.length));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, rates, items.length, isDoneStage]);

    useEffect(() => {
        if (!test) return;

        setItems((test.items || []).map((item) => ({
            ...item,
            purity: (item.purity !== undefined && item.purity !== null && item.purity !== 0 && item.purity !== '0') ? item.purity : '',
            returned: item.returned === 1 || item.returned === true,
            show_kt: item.show_kt === 1 || item.show_kt === true,
            certificate_required: item.certificate_required ?? null,
        })));
        const VALID_MODES = ['Cash', 'UPI', 'Balance'];
        setModeOfPayment(VALID_MODES.includes(test.mode_of_payment) ? test.mode_of_payment : 'Cash');
        setAmount(isDoneStage && test.total > 0 ? test.total : '');
        // Reset rates cache; will refetch on show.
        setRates(null);
        setWeightLoss('0');
        setIncludeGst(test.gst === 1);
        setCertificateRequired((test.items || []).some(i => i.certificate_required === 1));
        setPhotos({});
        setError('');
    }, [test, isDoneStage]);

    const handleItemChange = (index, field, value) => {
        if (isModalReadOnly) return;
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Move focus to the next non-disabled input in a column (skips returned /
    // sealed rows). Selects existing text so the operator can overtype a draft.
    const focusNextInColumn = (refs, startIdx) => {
        for (let i = startIdx; i < refs.current.length; i++) {
            const el = refs.current[i];
            if (el && !el.disabled) { el.focus(); if (el.select) el.select(); return true; }
        }
        return false;
    };

    // Enter inside a weight/purity cell advances down that column (these inputs
    // aren't inside a <form>, so Enter is otherwise inert). At the bottom of the
    // purity column it hands off to the primary submit button, making the whole
    // grid keyboard-only. test_weight falls back to the same row's purity.
    const handleGridKeyDown = (e, idx, column) => {
        blockInvalidNumericKeys(e);
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (column === 'purity') {
            if (!focusNextInColumn(purityRefs, idx + 1)) submitBtnRef.current?.focus();
        } else if (!focusNextInColumn(testWeightRefs, idx + 1)) {
            const el = purityRefs.current[idx];
            if (el) { el.focus(); if (el.select) el.select(); }
        }
    };

    const handlePhotoSelect = (itemId, file) => {
        if (isModalReadOnly || !file) return;
        setPhotos((prev) => ({ ...prev, [itemId]: file }));
    };

    const WT_TOLERANCE = 0.005;

    const validate = () => {
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            const lbl  = item.item_number || item.item_no || `#${idx + 1}`;
            const w    = getWeights(item);

            if (w.gross <= 0) return `Item ${lbl}: Gross weight must be greater than 0.`;
            if (w.test > w.gross + WT_TOLERANCE) {
                return `Item ${lbl}: Test weight (${w.test}g) cannot exceed gross weight (${w.gross}g).`;
            }
            if (w.net < -WT_TOLERANCE) {
                return `Item ${lbl}: Net weight is negative (${w.net.toFixed(3)}g) — returned weight exceeds Gross − Test.`;
            }
            if (w.loss < -WT_TOLERANCE) {
                return `Item ${lbl}: Overweight — Test + Returned exceeds intake by ${Math.abs(w.loss).toFixed(3)}g.`;
            }

            if (!item.returned) {
                const purity = parseFloat(item.purity);
                if (isNaN(purity) || purity <= 0 || purity > 100) {
                    return `Item ${lbl}: Purity must be between 0.01 and 100 (got "${item.purity || 'empty'}").`;
                }
            }

            if (isPhotoCert) {
                const hasNewPhoto      = !!photos[item.id];
                const hasExistingPhoto = !!item.media;
                if (!hasNewPhoto && !hasExistingPhoto) {
                    return `Item ${lbl}: A photo is required before submission.`;
                }
            }
        }

        if (!isTodoStage) {
            const parsedAmount = parseFloat(amount);
            if (!Number.isFinite(parsedAmount) || parsedAmount < 0) return 'Amount must be ≥ 0.';
            if (!modeOfPayment) return 'Mode of payment is required.';
        }

        return null;
    };

    const getDraftEndpoint = () => {
        if (isGoldTest)   return `/gold-tests/${test.id}/save-draft`;
        if (isSilverTest) return `/silver-tests/${test.id}/save-draft`;
        if (isCertificate) return `/certificates/${test.id}/results`;
        return null;
    };

    const getEndpoint = () => {
        if (isGoldTest)   return `/gold-tests/${test.id}/save-draft`;
        if (isSilverTest) return `/silver-tests/${test.id}/save-draft`;
        if (isPhotoCert || test?.type?.includes('cert')) return `/certificates/${test.id}/results`;
        return `/gold-tests/${test.id}/save-draft`;
    };

    const buildBaseData = () => ({
        mode_of_payment: modeOfPayment,
        total: amount !== '' ? parseFloat(amount) : 0,
        gst: includeGst ? 1 : 0
    });

    const handleSaveDraft = async () => {
        if (isDoneStage || isModalReadOnly) return;
        const normItems = normalizeItemValues(items);
        const draftEndpoint = getDraftEndpoint();
        if (!draftEndpoint) return;
        setLoading(true);
        setError('');
        try {
            if (isCertificate) {
                await api.post(draftEndpoint, {
                    items: normItems.map(i => ({
                        id: i.id,
                        purity: i.purity !== '' ? Number(i.purity) : 0,
                        returned: !!i.returned,
                        item_number: i.item_number || i.item_no,
                    }))
                });
            } else {
                await api.put(draftEndpoint, {
                    mode_of_payment: modeOfPayment,
                    items: normItems.map(i => ({
                        id: i.id,
                        purity: i.purity !== '' ? Number(i.purity) : 0,
                        returned: !!i.returned,
                        test_weight: i.test_weight !== '' && i.test_weight !== undefined ? Number(i.test_weight) : undefined,
                        net_weight: i.net_weight !== '' && i.net_weight !== undefined ? Number(i.net_weight) : undefined,
                        certificate_required: i.certificate_required,
                    }))
                });
            }
            addToast('Draft saved', 'info');
        } catch (err) {
            if (err.response?.status === 409) { onConflict?.(err); return; }
            setError(err.response?.data?.error || err.message || 'Failed to save draft');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (closeModal = true) => {
        const normItems = normalizeItemValues(items);
        const valError = validate();
        if (valError) { setError(valError); return false; }

        setLoading(true);
        setError('');
        try {
            const endpoint = getEndpoint();

            if (isPhotoCert) {
                const photoItemIds = Object.keys(photos);
                for (const itemId of photoItemIds) {
                    const file = photos[itemId];
                    const formData = new FormData();
                    formData.append('photo', file);
                    formData.append('data', JSON.stringify({
                        type: 'photo',
                        photo_item_id: itemId,
                        items: [{ id: itemId }]
                    }));
                    await api.post(endpoint, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }

                await api.post(endpoint, {
                    type: 'photo',
                    ...buildBaseData(),
                    items: normItems.map((i) => ({
                        id: i.id,
                        show_kt: !!i.show_kt,
                        returned: !!i.returned,
                        purity: i.purity !== '' ? Number(i.purity) : 0,
                        ...(i.media && !photos[i.id] ? { media: i.media } : {}),
                    }))
                });
            } else {
                const method = (isGoldTest || isSilverTest) ? 'put' : 'post';
                await api[method](endpoint, {
                    ...buildBaseData(),
                    items: normItems.map((i) => ({
                        id: i.id,
                        purity: i.purity !== '' ? Number(i.purity) : 0,
                        returned: !!i.returned,
                        item_number: i.item_number || i.item_no
                    }))
                });
            }

            if (!mountedRef.current) return true;
            addToast('Results Saved Successfully', 'success');
            if (closeModal) closeSafely();
            if (onSuccess && closeModal) requestAnimationFrame(() => onSuccess());
            return true;
        } catch (err) {
            if (!mountedRef.current) return false;
            if (err.response?.status === 409) { onConflict?.(err); return false; }
            // Error path: leave modal usable (no close).
            setError(err.response?.data?.error || err.message || 'Failed to save results');
            return false;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const handleSubmitFlow = async () => {
        if (!nextStatus) return;
        const normItems = normalizeItemValues(items);

        if (nextStatus === 'DONE' && (isGoldTest || isSilverTest)) {
            const valError = validate();
            if (valError) { setError(valError); return; }

            setLoading(true);
            try {
                const totalWtLoss = normItems.reduce((acc, it) => acc + getWeights(it).loss, 0);
                const testTypeStr = test.type === 'silver' ? 'silver' : 'gold';
                const explicitLoss = parseFloat(weightLoss);
                const finalLoss = Number.isFinite(explicitLoss) && explicitLoss > 0
                    ? explicitLoss
                    : Math.max(0, totalWtLoss);

                await api.post(`/${testTypeStr}-tests/${test.id}/finalize`, {
                    items: normItems.map(i => ({
                        id                  : i.id,
                        purity              : Number(i.purity),
                        returned            : !!i.returned,
                        item_number         : i.item_number || i.item_no,
                        certificate_required: i.returned ? null : (certificateRequired ? 1 : 0),
                    })),
                    mode_of_payment: modeOfPayment,
                    weight_loss: finalLoss,
                    cert: { gst: includeGst },
                });

                if (!mountedRef.current) return;
                addToast('Moved to Completed ✓', 'success');
                closeSafely();
                if (onSuccess) requestAnimationFrame(() => onSuccess());
            } catch (err) {
                if (!mountedRef.current) return;
                if (err.response?.status === 409) { onConflict?.(err); return; }
                setError(err.response?.data?.error || err.message || 'Failed to complete test');
            } finally {
                if (mountedRef.current) setLoading(false);
            }
            return;
        }

        if (nextStatus === 'DONE' && isCertificate) {
            const valError = validate();
            if (valError) { setError(valError); return; }

            setLoading(true);
            try {
                await api.post('/workflow/finalize', {
                    testId: test.id, type: test.type,
                    mode_of_payment: modeOfPayment, gst: includeGst ? 1 : 0,
                });
                if (!mountedRef.current) return;
                addToast('Moved to Completed ✓', 'success');
                closeSafely();
                if (onSuccess) requestAnimationFrame(() => onSuccess());
            } catch (err) {
                if (!mountedRef.current) return;
                if (err.response?.status === 409) { onConflict?.(err); return; }
                setError(err.response?.data?.error || err.message || 'Failed to complete certificate');
            } finally {
                if (mountedRef.current) setLoading(false);
            }
            return;
        }

        const saved = await handleSave(false);
        if (!saved) return;
        if (!mountedRef.current) return;

        if ((isGoldTest || isSilverTest) && nextStatus === 'IN_PROGRESS') {
            addToast('Moved to Tested', 'success');
            closeSafely();
            if (onSuccess) requestAnimationFrame(() => onSuccess());
            return;
        }

        const targetLabel = nextStatus === 'IN_PROGRESS' ? 'Tested' : 'Completed';
        setLoading(true);
        try {
            await api.patch(`/workflow/${test.type}/${test.id}/status`, { status: nextStatus });
            if (!mountedRef.current) return;
            addToast(`Moved to ${targetLabel}`, 'success');
            closeSafely();
            if (onSuccess) requestAnimationFrame(() => onSuccess());
        } catch (err) {
            if (!mountedRef.current) return;
            if (err.response?.status === 409) { onConflict?.(err); return; }
            addToast(err.response?.data?.error || 'Failed to update workflow status', 'error');
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!test || !items.length) return;
        try {
            const lines = [
                `Customer: ${test.customer_name || '-'}`,
                `Date: ${formatDate(test.created_at || test.createdon)}`,
                `Sample Count: ${items.length}`,
                ''
            ];
            items.forEach((item, idx) => {
                const w = getWeights(item);
                lines.push(
                    `${idx + 1}. ${item.item_no || item.item_number || '-'} | ${test.customer_name || '-'} | ` +
                    `Weight: ${w.net > 0 ? `${w.net}g / ${w.gross}g` : `${w.gross}g`} | Purity: ${item.purity || 0}%`
                );
            });
            const text = lines.join('\n');
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            addToast('Completed details copied', 'success');
        } catch (_err) {
            addToast('Unable to copy completed details', 'error');
        }
    };

    const resolvePrintRoute = () => {
        const t = test?.type;
        if (t === 'gold')        return 'gold-test';
        if (t === 'silver')      return 'silver-test';
        if (t === 'gold_cert')   return 'gold-certificate';
        if (t === 'silver_cert') return 'silver-certificate';
        if (t === 'photo_cert')  return 'photo-certificate';
        const id = test?.id || '';
        if (id.startsWith('GCR')) return 'gold-certificate';
        if (id.startsWith('SCR')) return 'silver-certificate';
        if (id.startsWith('PCR')) return 'photo-certificate';
        if (id.startsWith('GTS')) return 'gold-test';
        if (id.startsWith('STS')) return 'silver-test';
        return null;
    };

    const openItemPrint = async (idx) => {
        const route = resolvePrintRoute();
        if (!route || !test?.id) return;
        const itemId = items[idx]?.id;
        const opts = itemId ? { itemId } : { itemIndex: idx };
        if (isGoldTest || isSilverTest) opts.layout = 'small';
        try {
            await triggerPrint(route, test.id, opts);
        } catch (err) {
            addToast('Print failed. Please try again.', 'error');
        }
    };

    const openFullPrint = async () => {
        const route = resolvePrintRoute();
        if (!route || !test?.id) return;
        const opts = {};
        if (isGoldTest || isSilverTest) { opts.layout = 'small'; opts.itemLevel = true; }
        try {
            await triggerPrint(route, test.id, opts);
        } catch (err) {
            addToast('Print failed. Please try again.', 'error');
        }
    };

    // Python title mapping
    let modalTitle;
    if (isDoneStage)            modalTitle = 'Completed';
    else if (!isTodoStage)      modalTitle = 'Payment & Delivery';
    else if (isGoldTest)        modalTitle = 'Gold Purity Test';
    else if (isSilverTest)      modalTitle = 'Silver Purity Test';
    else if (isPhotoCert)       modalTitle = 'Photo Certificate Test';
    else                        modalTitle = 'Certificate Purity Test';

    const totalWeightLoss = items.reduce((acc, it) => acc + getWeights(it).loss, 0);
    const canPrint = (isDoneStage || currentStatus === 'IN_PROGRESS') && !!resolvePrintRoute();
    const printTip = canPrint ? undefined : 'Submit to Tested to enable printing';

    return (
        <>
        <Modal
            show={show}
            onHide={closeSafely}
            backdrop="static"
            keyboard={false}
            centered
            dialogClassName="modal-xxl"
        >
            <Modal.Header closeButton>
                <Modal.Title as="h3" className="modal-title d-flex align-items-center gap-2">
                    {modalTitle}
                    {isDoneStage ? (
                        <Badge
                            bg="dark"
                            className="sealed-badge d-inline-flex align-items-center gap-1"
                            aria-label="Sealed — finalized record"
                            title="Sealed — finalized record"
                        >
                            <FaLock aria-hidden="true" /> Sealed
                        </Badge>
                    ) : (
                        isModalReadOnly && <Badge bg="secondary">View Only</Badge>
                    )}
                    {isPhotoCert && <Badge bg="info">Photo Cert</Badge>}
                </Modal.Title>
                {isDoneStage && (
                    <div className="d-flex gap-2 ms-auto me-3">
                        <Button variant="outline-primary" size="sm" onClick={handleCopy}>
                            <FaCopy className="me-1" /> Copy
                        </Button>
                        {(isCertificate || isGoldTest || isSilverTest) && resolvePrintRoute() && (
                            <Button variant="outline-success" size="sm" onClick={openFullPrint}>
                                <FaFileAlt className="me-1" /> Print All
                            </Button>
                        )}
                    </div>
                )}
            </Modal.Header>

            <Modal.Body className="m-3 mb-0">
                {/* Sealed ribbon — explains WHY DONE records are immutable.
                    Muted slate, not alarm; institutional finality, not panic.
                    The single-sentence "why" converts the operator's read of
                    "system blocked me" into "system is protecting institutional
                    truth." Only shown when the record is actually DONE — not
                    for transient readOnly states like isSystemReadOnly. */}
                {isDoneStage && (
                    <div
                        className="sealed-ribbon d-flex align-items-start gap-3 mb-3"
                        role="status"
                        aria-label="This record is sealed"
                    >
                        <FaLock className="sealed-ribbon__icon" aria-hidden="true" />
                        <div className="sealed-ribbon__body">
                            <div className="sealed-ribbon__title">Finalized · Sealed</div>
                            <div className="sealed-ribbon__why">
                                Finalized records are sealed to preserve audit, print, and ledger consistency.
                                Use the Correction Flow for changes.
                            </div>
                        </div>
                    </div>
                )}
                {isSystemReadOnly && (
                    <Alert variant="warning" className="mb-3">
                        Testing actions are available on Lab system only.
                    </Alert>
                )}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Python-style 3-col header strip */}
                <div className="row mb-0">
                    <div className="col-4">
                        <h4 className="fw-light text-center">Bill No</h4>
                        <p id="purityModalInvoiceNumber" className="fw-bold fs-3 text-center">
                            {test?.bill_no || test?.auto_number || '-'}
                        </p>
                    </div>
                    <div className="col-4">
                        <h4 className="fw-light text-center">Customer Name</h4>
                        <p id="purityModalCustomerName" className="fw-bold fs-3 text-center">
                            {test?.customer_name || '-'}
                        </p>
                    </div>
                    <div className="col-4">
                        <h4 className="fw-light text-center">Balance</h4>
                        <p id="purityModalCustomerBalance" className="fw-bold fs-3 text-center">
                            {test?.customer_balance ?? '-'}
                        </p>
                    </div>
                </div>
                <hr />

                {/* Python-style striped table */}
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                            <tr>
                                {isCertificate && <th>Certificate Number</th>}
                                <th>Name</th>
                                <th>Item Type</th>
                                <th>Total Weight (g)</th>
                                <th>Sample Weight (g)</th>
                                <th>Purity (%)</th>
                                {isPhotoCert && <th>Photo</th>}
                                {isPhotoCert && <th className="text-center">KT</th>}
                                <th className="text-center">Sample Returned?</th>
                                {(isGoldTest || isSilverTest) && !isTodoStage && <th className="text-center">Cert Req</th>}
                                <th className="text-center">Print</th>
                            </tr>
                        </thead>
                        <tbody id="purityModalTableBody">
                            {items.map((item, idx) => {
                                const w = getWeights(item);
                                return (
                                    <tr key={item.id || idx} className="sampleDetails">
                                        {isCertificate && (
                                            <td>
                                                <div className="input-group w-100">
                                                    <Form.Control
                                                        type="text"
                                                        name="certificate_number"
                                                        value={item.certificate_number || item.item_number || item.item_no || ''}
                                                        disabled
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <div className="input-group w-100">
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    placeholder="Name"
                                                    maxLength={32}
                                                    value={item.item_type || ''}
                                                    onChange={(e) => handleItemChange(idx, 'item_type', e.target.value)}
                                                    disabled={isModalReadOnly}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="input-group w-100">
                                                <Form.Control
                                                    type="text"
                                                    name="item"
                                                    placeholder="Item type"
                                                    maxLength={32}
                                                    value={item.item_no || item.item_number || ''}
                                                    disabled
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="input-group w-100">
                                                <Form.Control
                                                    type="number"
                                                    name="total_weight"
                                                    placeholder="Total weight"
                                                    min="0"
                                                    step="0.01"
                                                    value={w.gross}
                                                    disabled
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="input-group w-100">
                                                <Form.Control
                                                    ref={(el) => { testWeightRefs.current[idx] = el; }}
                                                    size="sm"
                                                    type="number"
                                                    name="test_weight"
                                                    placeholder="Test weight"
                                                    min="0"
                                                    step="0.001"
                                                    data-testid="item-test-weight"
                                                    inputMode="decimal"
                                                    value={item.test_weight ?? ''}
                                                    onChange={(e) => handleItemChange(idx, 'test_weight', e.target.value)}
                                                    onBlur={(e) => handleItemChange(idx, 'test_weight', clampDecimals(e.target.value, 3))}
                                                    onKeyDown={(e) => handleGridKeyDown(e, idx, 'test_weight')}
                                                    onPaste={(e) => { e.preventDefault(); handleItemChange(idx, 'test_weight', sanitizeNumericString(e.clipboardData.getData('text'), 3)); }}
                                                    disabled={isModalReadOnly}
                                                />
                                            </div>
                                        </td>
                                        {/* Returned Wt (net_weight) is computed in the backend
                                            (gross − test) and stored there; not shown/edited here. */}
                                        <td style={{ minWidth: 110 }}>
                                            <div className="input-group w-100">
                                                <Form.Control
                                                    ref={(el) => { purityRefs.current[idx] = el; if (idx === 0) firstPurityRef.current = el; }}
                                                    size="sm"
                                                    type="number"
                                                    name="purity"
                                                    placeholder="Purity"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    data-testid="item-purity"
                                                    inputMode="decimal"
                                                    value={item.purity}
                                                    onChange={(e) => handleItemChange(idx, 'purity', e.target.value)}
                                                    onBlur={(e) => handleItemChange(idx, 'purity', clampDecimals(e.target.value, 2))}
                                                    onKeyDown={(e) => handleGridKeyDown(e, idx, 'purity')}
                                                    onPaste={(e) => { e.preventDefault(); handleItemChange(idx, 'purity', sanitizeNumericString(e.clipboardData.getData('text'), 2)); }}
                                                    disabled={isModalReadOnly}
                                                />
                                                <span className="input-group-text">%</span>
                                            </div>
                                        </td>
                                        {isPhotoCert && (
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {(photos[item.id] || item.media) && (
                                                        <div style={{ width: 40, height: 40, overflow: 'hidden', borderRadius: 4, border: '1px solid #ddd' }}>
                                                            <img
                                                                src={photos[item.id] ? URL.createObjectURL(photos[item.id]) : `${api.defaults.baseURL.replace(/\/api$/, '')}/${item.media}`}
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    )}
                                                    {!isModalReadOnly && (
                                                        <label className="btn btn-sm btn-outline-secondary p-1 mb-0">
                                                            <FaCamera />
                                                            <input
                                                                type="file" accept="image/*" hidden
                                                                onChange={(e) => handlePhotoSelect(item.id, e.target.files?.[0])}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        {isPhotoCert && (
                                            <td className="text-center">
                                                <Form.Check
                                                    checked={!!item.show_kt}
                                                    onChange={(e) => handleItemChange(idx, 'show_kt', e.target.checked)}
                                                    disabled={isModalReadOnly}
                                                />
                                            </td>
                                        )}
                                        <td className="text-center">
                                            <div className="input-group d-flex justify-content-center w-100">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="returned"
                                                    className="form-check-input"
                                                    checked={!!item.returned}
                                                    onChange={(e) => handleItemChange(idx, 'returned', e.target.checked)}
                                                    disabled={isModalReadOnly || isDoneStage}
                                                />
                                            </div>
                                        </td>
                                        {(isGoldTest || isSilverTest) && !isTodoStage && (
                                            <td className="text-center">
                                                <Badge bg={item.certificate_required === 1 ? 'success' : item.certificate_required === 0 ? 'secondary' : 'warning'}>
                                                    {item.certificate_required === 1 ? 'Cert' : item.certificate_required === 0 ? 'No Cert' : 'Auto'}
                                                </Badge>
                                            </td>
                                        )}
                                        <td className="text-center">
                                            <Button
                                                variant="link"
                                                className="p-0 certificateBtn"
                                                disabled={!canPrint}
                                                title={printTip ?? 'Print certificate for this item'}
                                                onClick={() => openItemPrint(idx)}
                                                aria-label="Print certificate for item"
                                            >
                                                <FaFileInvoice />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={20} className="text-center text-muted py-4">
                                        No sample items found for this card.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Python-style payment/finalize row (only when not TODO) */}
                {!isTodoStage && (
                    <div className="d-flex justify-content-end">
                        <div id="paymentDetails" className="input-group input-group-lg mb-3 w-auto flex-wrap">
                            {(isGoldTest || isSilverTest) && !isDoneStage && (
                                <>
                                    <span className="input-group-text">Weight Loss</span>
                                    <span className="input-group-text">₹</span>
                                    <Form.Control
                                        type="number" name="weight_loss"
                                        min="0" step="any"
                                        value={weightLoss}
                                        onChange={(e) => setWeightLoss(e.target.value)}
                                        onBlur={(e) => setWeightLoss(e.target.value !== '' ? clampDecimals(e.target.value, 3) : '0')}
                                        disabled={isModalReadOnly}
                                        style={{ maxWidth: 140 }}
                                        required
                                    />
                                </>
                            )}
                            <span className="input-group-text">Amount</span>
                            <span className="input-group-text">₹</span>
                            <Form.Control
                                ref={amountRef}
                                type="number"
                                min="0" step="0.01"
                                placeholder="0.00"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onBlur={(e) => setAmount(e.target.value !== '' ? clampDecimals(e.target.value, 2) : '')}
                                onKeyDown={(e) => { blockInvalidNumericKeys(e); if (e.key === 'Enter') { e.preventDefault(); submitBtnRef.current?.focus(); } }}
                                onPaste={(e) => { e.preventDefault(); setAmount(sanitizeNumericString(e.clipboardData.getData('text'), 2)); }}
                                disabled={isModalReadOnly}
                                style={{ maxWidth: 160 }}
                            />
                            <span className="input-group-text">Mode of Payment</span>
                            <Form.Select
                                className="flex-grow-1"
                                style={{ maxWidth: 160 }}
                                value={modeOfPayment}
                                onChange={(e) => setModeOfPayment(e.target.value)}
                                disabled={isModalReadOnly}
                                required
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Balance">Balance</option>
                            </Form.Select>
                            {isCertificate && (
                                <span className="input-group-text">
                                    <Form.Check
                                        type="checkbox"
                                        id="gst-switch-phase2"
                                        checked={includeGst}
                                        onChange={(e) => setIncludeGst(e.target.checked)}
                                        disabled={isModalReadOnly}
                                        className="mt-0"
                                        label={<span className="ms-2 fw-bold">GST</span>}
                                    />
                                </span>
                            )}
                            {(isGoldTest || isSilverTest) && !isDoneStage && (
                                <span className="input-group-text">
                                    <Form.Check
                                        type="checkbox"
                                        id="cert-required-phase2"
                                        data-testid="certificate-required-checkbox"
                                        checked={certificateRequired}
                                        onChange={(e) => setCertificateRequired(e.target.checked)}
                                        disabled={isModalReadOnly}
                                        className="mt-0"
                                        label={<span className="ms-2 fw-bold">Cert Required</span>}
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {!isTodoStage && parseFloat(amount) > 0 && (
                    <div className="mb-3">
                        <PriceCalculationTable
                            total={amount}
                            includeGst={includeGst}
                            modeOfPayment={modeOfPayment}
                        />
                    </div>
                )}

                {totalWeightLoss > 0.001 && (
                    <Alert variant="warning" className="d-flex align-items-center justify-content-between p-2 border-warning shadow-sm">
                        <div className="d-flex align-items-center gap-2">
                            <FaExclamationTriangle className="text-warning" />
                            <span>Weight Loss Detected: <strong>{totalWeightLoss.toFixed(3)}g</strong></span>
                        </div>
                        <Button
                            size="sm"
                            variant="warning"
                            onClick={() => openModal('weightLossHistory', {
                                customerId: test?.customer_id,
                                initialAmount: totalWeightLoss.toFixed(3),
                                initialReason: `Discrepancy in ${test?.auto_number}`,
                                reload: () => { addToast('Loss categorized successfully', 'success'); }
                            })}
                        >
                            Categorize Loss
                        </Button>
                    </Alert>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={closeSafely}>Close</Button>
                {!isDoneStage && !isModalReadOnly && (
                    <>
                        {(isGoldTest || isSilverTest || isTodoStage) && (
                            <Button
                                id="puritySaveBtn"
                                variant="primary"
                                onClick={handleSaveDraft}
                                disabled={loading}
                                title="Save purity/weights as draft (no status change)"
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Save'}
                            </Button>
                        )}
                        {nextStatus && (
                            <Button
                                ref={submitBtnRef}
                                id={nextStatus === 'DONE' ? 'paymentSubmitBtn' : 'puritySubmitBtn'}
                                variant="danger"
                                onClick={handleSubmitFlow}
                                disabled={loading}
                            >
                                {nextStatus === 'IN_PROGRESS' ? 'Submit' : 'Delivered'}
                            </Button>
                        )}
                    </>
                )}
                {isDoneStage && (
                    <Badge bg="success" className="px-3 py-2">✓ DONE — Record is Immutable</Badge>
                )}
            </Modal.Footer>
        </Modal>
        {/* Style mounted outside the Modal portal so CSS rules outlive the
            close-transition unmount — prevents stuck-backdrop / frozen-UI
            on modal close. */}
        <style>{`
            .modal-xxl { max-width: 90vw; }
            @media (min-width: 1400px) { .modal-xxl { max-width: 1320px; } }
            .modal-xxl .modal-body { max-height: 75vh; overflow-y: auto; }
        `}</style>
        </>
    );
};

export default Phase2Modal;
