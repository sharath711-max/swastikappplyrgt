import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Alert, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { FaCamera, FaCopy, FaPrint, FaFileAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';
import PriceCalculationTable from './core/PriceCalculationTable';
import api from '../services/api';
import { buildPrintUrl } from '../utils/print';
import { usePrint } from '../contexts/PrintContext';

const CURRENT_SYSTEM = 'LAB';

const getWeights = (item) => {
    const gross = Number(item.gross_weight || 0);
    const test  = Number(item.test_weight  || 0);
    const net   = Number(item.net_weight   || (gross - test));
    const loss  = Number((gross - (test + net)).toFixed(3));
    return { gross, test, net, loss };
};

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const Phase2Modal = ({ show, onHide, test, onSuccess, onConflict, readOnly = false }) => {
    const { addToast } = useToast();
    const { openModal } = useModal();
    const { triggerPrint } = usePrint();
    const [items, setItems] = useState([]);
    const [modeOfPayment, setModeOfPayment] = useState('Cash');
    const [amount, setAmount] = useState('');
    const [includeGst, setIncludeGst] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [photos, setPhotos] = useState({});

    const isSystemReadOnly = CURRENT_SYSTEM !== 'LAB';
    const isModalReadOnly = readOnly || isSystemReadOnly;

    const isPhotoCert = test?.type === 'photo_cert' || test?.id?.startsWith('PCR');
    const isGoldTest = test?.type === 'gold' || test?.id?.startsWith('GT');
    const isSilverTest = test?.type === 'silver' || test?.id?.startsWith('ST');
    const isCertificate = test?.type?.includes('cert') || test?.id?.startsWith('GCR') || test?.id?.startsWith('SCR') || isPhotoCert;

    const currentStatus = test?.status || '';
    const isTodoStage = currentStatus === 'TODO';
    const isDoneStage = currentStatus === 'DONE';
    const nextStatus = currentStatus === 'TODO'
        ? 'IN_PROGRESS'
        : currentStatus === 'IN_PROGRESS'
            ? 'DONE'
            : null;

    useEffect(() => {
        if (!test) return;

        setItems((test.items || []).map((item) => ({
            ...item,
            purity: (item.purity !== undefined && item.purity !== null && item.purity !== 0 && item.purity !== '0') ? item.purity : '',
            returned: item.returned === 1 || item.returned === true,
            show_kt: item.show_kt === 1 || item.show_kt === true,
            // Operator override: null = use auto-rule; 1 = force cert; 0 = force non-cert
            certificate_required: item.certificate_required ?? null,
        })));
        setModeOfPayment(test.mode_of_payment || 'Cash');
        setAmount(isDoneStage && test.total > 0 ? test.total : '');
        setIncludeGst(test.gst === 1);
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

    const handlePhotoSelect = (itemId, file) => {
        if (isModalReadOnly || !file) return;
        setPhotos((prev) => ({ ...prev, [itemId]: file }));
    };

    // Small tolerance to absorb Decimal → float rounding when comparing weights
    const WT_TOLERANCE = 0.005;

    const validate = () => {
        for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            const lbl  = item.item_number || item.item_no || `#${idx + 1}`;
            const w    = getWeights(item);

            // ── Weight checks (fundamental data integrity — run first) ──────
            if (w.gross <= 0) {
                return `Item ${lbl}: Gross weight must be greater than 0.`;
            }
            if (w.test > w.gross + WT_TOLERANCE) {
                return `Item ${lbl}: Test weight (${w.test}g) cannot exceed gross weight (${w.gross}g).`;
            }
            if (w.net < -WT_TOLERANCE) {
                return `Item ${lbl}: Net weight is negative (${w.net.toFixed(3)}g) — returned weight exceeds Gross − Test.`;
            }
            if (w.loss < -WT_TOLERANCE) {
                return `Item ${lbl}: Overweight — Test + Returned exceeds intake by ${Math.abs(w.loss).toFixed(3)}g.`;
            }

            // ── Purity (skip for returned items) ────────────────────────────
            if (!item.returned) {
                const purity = parseFloat(item.purity);
                if (isNaN(purity) || purity <= 0 || purity > 100) {
                    return `Item ${lbl}: Purity must be between 0.01 and 100 (got "${item.purity || 'empty'}").`;
                }
            }

            // ── Photo cert: photo required ───────────────────────────────────
            if (isPhotoCert) {
                const hasNewPhoto      = !!photos[item.id];
                const hasExistingPhoto = !!item.media;
                if (!hasNewPhoto && !hasExistingPhoto) {
                    return `Item ${lbl}: A photo is required before submission.`;
                }
            }
        }

        // ── Payment-stage fields ─────────────────────────────────────────────
        if (!isTodoStage) {
            const parsedAmount = parseFloat(amount);
            if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
                return 'Amount must be ≥ 0.';
            }
            if (!modeOfPayment) {
                return 'Mode of payment is required.';
            }
        }

        return null;
    };

    const getDraftEndpoint = () => {
        if (isGoldTest) return `/gold-tests/${test.id}/save-draft`;
        if (isSilverTest) return `/silver-tests/${test.id}/save-draft`;
        if (isCertificate) return `/certificates/${test.id}/results`;
        return null;
    };

    const getEndpoint = () => {
        if (isGoldTest) return `/gold-tests/${test.id}/save-draft`;
        if (isSilverTest) return `/silver-tests/${test.id}/save-draft`;
        if (isPhotoCert || test?.type?.includes('cert')) return `/certificates/${test.id}/results`;
        return `/gold-tests/${test.id}/save-draft`;
    };

    const buildBaseData = () => ({
        mode_of_payment: modeOfPayment,
        total: parseFloat(amount || 0),
        gst: includeGst ? 1 : 0
    });

    const handleSaveDraft = async () => {
        if (isDoneStage || isModalReadOnly) return;
        const draftEndpoint = getDraftEndpoint();
        if (!draftEndpoint) return;
        setLoading(true);
        setError('');
        try {
            if (isCertificate) {
                // Certificates: draft saved via POST /certificates/:id/results
                // Status is NOT changed — stays TODO until "Submit to Tested" is clicked
                await api.post(draftEndpoint, {
                    items: items.map(i => ({
                        id: i.id,
                        purity: Number(i.purity) || 0,
                        returned: !!i.returned,
                        item_number: i.item_number || i.item_no,
                    }))
                });
            } else {
                // Tests: draft saved via PUT /:type-tests/:id/save-draft
                await api.put(draftEndpoint, {
                    mode_of_payment: modeOfPayment,
                    items: items.map(i => ({
                        id: i.id,
                        purity: Number(i.purity) || 0,
                        returned: !!i.returned,
                        test_weight: i.test_weight !== undefined ? Number(i.test_weight) : undefined,
                        net_weight: i.net_weight !== undefined ? Number(i.net_weight) : undefined,
                        // Operator override: send null to reset to auto-rule
                        certificate_required: i.certificate_required,
                    }))
                });
            }
            addToast('Draft saved', 'info');
            // Do NOT call onSuccess — status must remain unchanged
        } catch (err) {
            if (err.response?.status === 409) { onConflict?.(err); return; }
            setError(err.response?.data?.error || err.message || 'Failed to save draft');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (closeModal = true) => {
        const valError = validate();
        if (valError) {
            setError(valError);
            return false;
        }

        setLoading(true);
        setError('');
        try {
            const endpoint = getEndpoint();
            const baseData = buildBaseData();

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
                    ...baseData,
                    items: items.map((i) => ({
                        id: i.id,
                        show_kt: !!i.show_kt,
                        returned: !!i.returned,
                        purity: Number(i.purity),
                        // Omit media: the upload loop already persisted it; sending null here
                        // would overwrite the just-saved path for newly-uploaded photos.
                        ...(i.media && !photos[i.id] ? { media: i.media } : {}),
                    }))
                });
            } else {
                const method = (isGoldTest || isSilverTest) ? 'put' : 'post';
                await api[method](endpoint, {
                    ...baseData,
                    items: items.map((i) => ({
                        id: i.id,
                        purity: Number(i.purity),
                        returned: !!i.returned,
                        item_number: i.item_number || i.item_no
                    }))
                });
            }

            addToast('Results Saved Successfully', 'success');
            if (onSuccess && closeModal) {
                onSuccess();
            }
            if (closeModal) {
                onHide();
            }

            return true;
        } catch (err) {
            if (err.response?.status === 409) { onConflict?.(err); return false; }
            setError(err.response?.data?.error || err.message || 'Failed to save results');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFlow = async () => {
        if (!nextStatus) return;

        if (nextStatus === 'DONE' && (isGoldTest || isSilverTest)) {
            const valError = validate();
            if (valError) {
                setError(valError);
                return;
            }

            setLoading(true);
            try {
                const totalWtLoss = items.reduce((acc, it) => acc + getWeights(it).loss, 0);
                const testTypeStr = test.type === 'silver' ? 'silver' : 'gold';

                await api.post(`/${testTypeStr}-tests/${test.id}/finalize`, {
                    items: items.map(i => ({
                        id                  : i.id,
                        purity              : Number(i.purity),
                        returned            : !!i.returned,
                        item_number         : i.item_number || i.item_no,
                        certificate_required: i.certificate_required ?? null,
                    })),
                    mode_of_payment: modeOfPayment,
                    weight_loss: Math.max(0, totalWtLoss),
                    cert: { gst: includeGst },
                });

                addToast('Moved to Completed ✓', 'success');
                if (onSuccess) onSuccess();
                onHide();
            } catch (err) {
                if (err.response?.status === 409) { onConflict?.(err); return; }
                setError(err.response?.data?.error || err.message || 'Failed to complete test');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (nextStatus === 'DONE' && isCertificate) {
            const valError = validate();
            if (valError) { setError(valError); return; }

            setLoading(true);
            try {
                await api.post('/workflow/finalize', {
                    testId: test.id,
                    type: test.type,
                    mode_of_payment: modeOfPayment,
                    gst: includeGst ? 1 : 0,
                });
                addToast('Moved to Completed ✓', 'success');
                if (onSuccess) onSuccess();
                onHide();
            } catch (err) {
                if (err.response?.status === 409) { onConflict?.(err); return; }
                setError(err.response?.data?.error || err.message || 'Failed to complete certificate');
            } finally {
                setLoading(false);
            }
            return;
        }

        // Skip closemodal on handlesave to manage it here
        const saved = await handleSave(false);
        if (!saved) return;

        // For gold/silver tests going TODO → IN_PROGRESS, saveTestDraft already
        // auto-advances the status. Skip the redundant PATCH and close directly.
        if ((isGoldTest || isSilverTest) && nextStatus === 'IN_PROGRESS') {
            addToast('Moved to Tested', 'success');
            onSuccess?.();
            onHide();
            return;
        }

        const targetLabel = nextStatus === 'IN_PROGRESS' ? 'Tested' : 'Completed';
        setLoading(true);
        try {
            await api.patch(`/workflow/${test.type}/${test.id}/status`, { status: nextStatus });
            addToast(`Moved to ${targetLabel}`, 'success');
            onSuccess?.();
            onHide();
        } catch (err) {
            if (err.response?.status === 409) { onConflict?.(err); return; }
            addToast(err.response?.data?.error || 'Failed to update workflow status', 'error');
        } finally {
            setLoading(false);
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

    // Derive the frontend print-route type from test.type / test.id prefix.
    // Returns the segment used in /print/:type/:id — or null if unknown.
    const resolvePrintRoute = () => {
        const t = test?.type;
        if (t === 'gold')       return 'gold-test';
        if (t === 'silver')     return 'silver-test';
        if (t === 'gold_cert')  return 'gold-certificate';
        if (t === 'silver_cert') return 'silver-certificate';
        if (t === 'photo_cert') return 'photo-certificate';
        // Fallback: infer from ID prefix written by the sequence generator
        const id = test?.id || '';
        if (id.startsWith('GCR')) return 'gold-certificate';
        if (id.startsWith('SCR')) return 'silver-certificate';
        if (id.startsWith('PCR')) return 'photo-certificate';
        if (id.startsWith('GTS')) return 'gold-test';
        if (id.startsWith('STS')) return 'silver-test';
        return null;
    };

    // Open snapshot-based per-item certificate print (small cert equivalent).
    // Uses the PrintView route which fetches HMAC-verified immutable snapshot from backend.
    const openItemPrint = async (idx) => {
        const route = resolvePrintRoute();
        if (!route || !test?.id) return;
        const itemId = items[idx]?.id;
        try {
            await triggerPrint(route, test.id, itemId ? { itemId } : { itemIndex: idx });
        } catch (err) {
            addToast('Print failed. Please try again.', 'error');
        }
    };

    // Open snapshot-based full certificate print (all items, paginated).
    const openFullPrint = async () => {
        const route = resolvePrintRoute();
        if (!route || !test?.id) return;
        try {
            await triggerPrint(route, test.id);
        } catch (err) {
            addToast('Print failed. Please try again.', 'error');
        }
    };

    const modalTitle = isTodoStage
        ? (isCertificate ? 'Add Certificate Results' : 'Add Test Results')
        : isDoneStage ? 'Completed Details' : 'Payment Details';
    const totalWeightLoss = items.reduce((acc, it) => acc + getWeights(it).loss, 0);

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false} className="new-test-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        {modalTitle}
                        {isModalReadOnly && <Badge bg="secondary">View Only</Badge>}
                        {isPhotoCert && <Badge bg="info">Photo Cert</Badge>}
                    </Modal.Title>
                    {isDoneStage && (
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={handleCopy}>
                                <FaCopy className="me-1" /> Copy
                            </Button>
                            {isCertificate && resolvePrintRoute() && (
                                <Button variant="outline-success" size="sm" onClick={openFullPrint}>
                                    <FaFileAlt className="me-1" /> Print All
                                </Button>
                            )}
                        </div>
                    )}
                </Modal.Header>

                <Modal.Body className="pt-3">
                    {isSystemReadOnly && (
                        <Alert variant="warning" className="mb-3">
                            Testing actions are available on Lab system only.
                        </Alert>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="p-3 border rounded mb-3" style={{ background: '#eef9f4' }}>
                        <Row className="g-2">
                            <Col md={6}><strong>Customer:</strong> {test?.customer_name || '-'}</Col>
                            <Col md={6} className="text-md-end"><strong>Date:</strong> {formatDate(test?.created_at || test?.createdon)}</Col>
                            <Col md={12}><strong>Sample Count:</strong> {items.length}</Col>
                        </Row>
                    </div>

                    <div className="table-container">
                        <Table responsive bordered hover size="sm" className="mb-0 align-middle">
                            <thead className="table-light">
                            <tr>
                                <th>Seq</th>
                                <th>Item Name</th>
                                <th>Gross Wt</th>
                                <th>Test Wt</th>
                                <th>Returned Wt</th>
                                <th>Purity (%)</th>
                                {isPhotoCert && <th>Photo</th>}
                                {isPhotoCert && <th>KT</th>}
                                <th>Returned</th>
                                <th>Print</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const w = getWeights(item);
                                return (
                                    <tr key={item.id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div>{item.item_type || '-'}</div>
                                            <small className="text-muted">{item.item_no || item.item_number || '-'}</small>
                                        </td>
                                        <td className="fw-bold fs-7">{w.gross}g</td>
                                        <td>
                                            <Form.Control
                                                size="sm"
                                                type="number"
                                                data-testid="item-test-weight"
                                                value={item.test_weight}
                                                onChange={(e) => handleItemChange(idx, 'test_weight', e.target.value)}
                                                disabled={isModalReadOnly}
                                                style={{ width: 80 }}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                size="sm"
                                                type="number"
                                                data-testid="item-net-weight"
                                                value={item.net_weight !== undefined ? item.net_weight : w.net}
                                                onChange={(e) => handleItemChange(idx, 'net_weight', e.target.value)}
                                                disabled={isModalReadOnly}
                                                style={{ width: 80 }}
                                            />
                                        </td>
                                        <td style={{ minWidth: 120 }}>
                                            <Form.Control
                                                size="sm"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max="100"
                                                placeholder="0.00"
                                                data-testid="item-purity"
                                                value={item.purity}
                                                onChange={(e) => handleItemChange(idx, 'purity', e.target.value)}
                                                disabled={isModalReadOnly}
                                            />
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
                                                                type="file"
                                                                accept="image/*"
                                                                hidden
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
                                            <Form.Check
                                                type="switch"
                                                checked={!!item.returned}
                                                onChange={(e) => handleItemChange(idx, 'returned', e.target.checked)}
                                                disabled={isModalReadOnly || isDoneStage}
                                            />
                                        </td>
                                        {(isGoldTest || isSilverTest) && (
                                            <td className="text-center">
                                                {!isTodoStage ? (
                                                    <Badge bg={item.certificate_required === 1 ? 'success' : item.certificate_required === 0 ? 'secondary' : 'warning'} className="small">
                                                        {item.certificate_required === 1 ? 'Cert' : item.certificate_required === 0 ? 'No Cert' : 'Auto'}
                                                    </Badge>
                                                ) : (
                                                    <Form.Select
                                                        size="sm"
                                                        style={{ width: 80 }}
                                                        value={item.certificate_required === null || item.certificate_required === undefined ? '' : item.certificate_required}
                                                        onChange={(e) => {
                                                            const val = e.target.value === '' ? null : Number(e.target.value);
                                                            handleItemChange(idx, 'certificate_required', val);
                                                        }}
                                                    >
                                                        <option value="">Auto</option>
                                                        <option value="1">Cert ✓</option>
                                                        <option value="0">No Cert ✗</option>
                                                    </Form.Select>
                                                )}
                                            </td>
                                        )}
                                        <td>
                                            {(() => {
                                                const printRoute = resolvePrintRoute();
                                                const canPrint  = (isDoneStage || currentStatus === 'IN_PROGRESS') && !!printRoute;
                                                const tip       = canPrint ? undefined : 'Submit to Tested to enable printing';
                                                return (
                                                    <div className="d-flex gap-1 flex-nowrap">
                                                        {/* Per-item certificate (small cert equivalent) */}
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            disabled={!canPrint}
                                                            title={tip ?? 'Print certificate for this item'}
                                                            onClick={() => openItemPrint(idx)}
                                                        >
                                                            <FaPrint />
                                                            <span className="ms-1 d-none d-md-inline">Cert</span>
                                                        </Button>
                                                        {/* Full certificate (all items) — only meaningful for cert records */}
                                                        {isCertificate && (
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                disabled={!canPrint}
                                                                title={tip ?? 'Print full certificate (all items)'}
                                                                onClick={openFullPrint}
                                                            >
                                                                <FaFileAlt />
                                                                <span className="ms-1 d-none d-md-inline">All</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={isPhotoCert ? 10 : 8} className="text-center text-muted py-4">
                                        No sample items found for this card.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    </div>

                    {!isTodoStage && (
                        <div className="p-3 border rounded bg-white shadow-sm">
                            <Row className="g-3 align-items-end">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted">Amount</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            disabled={isModalReadOnly}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-muted">Mode</Form.Label>
                                        <Form.Select
                                            size="sm"
                                            value={modeOfPayment}
                                            onChange={(e) => setModeOfPayment(e.target.value)}
                                            disabled={isModalReadOnly}
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Balance">Balance</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {isCertificate && (
                                    <Col md={4}>
                                        <Form.Check
                                            type="switch"
                                            id="gst-switch-phase2"
                                            label="Include GST"
                                            checked={includeGst}
                                            onChange={(e) => setIncludeGst(e.target.checked)}
                                            disabled={isModalReadOnly}
                                            className="fw-bold mb-2 mt-4"
                                        />
                                    </Col>
                                )}
                            </Row>
                            {parseFloat(amount) > 0 && (
                                <div className="mt-3">
                                    <PriceCalculationTable
                                        total={amount}
                                        includeGst={includeGst}
                                        modeOfPayment={modeOfPayment}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {totalWeightLoss > 0.001 && (
                        <Alert variant="warning" className="d-flex align-items-center justify-content-between p-2 mt-2 border-warning shadow-sm">
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
                                    reload: () => {
                                        addToast('Loss categorized successfully', 'success');
                                    }
                                })}
                            >
                                Categorize Loss
                            </Button>
                        </Alert>
                    )}
                </Modal.Body>

                
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={onHide}>Close</Button>
                    {!isDoneStage && !isModalReadOnly && (
                        <>
                            {(isGoldTest || isSilverTest || isTodoStage) && (
                                <Button
                                    variant="outline-primary"
                                    onClick={handleSaveDraft}
                                    disabled={loading}
                                    title="Save purity/weights as draft (no status change)"
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : '💾 Save Draft'}
                                </Button>
                            )}
                            {nextStatus && (
                                <Button
                                    variant={nextStatus === 'DONE' ? 'success' : 'primary'}
                                    onClick={handleSubmitFlow}
                                    disabled={loading}
                                >
                                    {nextStatus === 'IN_PROGRESS' ? 'Submit to Tested' : '🔒 Finalize & Commit'}
                                </Button>
                            )}
                        </>
                    )}
                    {isDoneStage && (
                        <Badge bg="success" className="px-3 py-2">✓ DONE — Record is Immutable</Badge>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Phase2Modal;
