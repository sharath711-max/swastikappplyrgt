import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import PrintManager from '../components/print/PrintManager';
import ThermalReceipt from '../components/print/ThermalReceipt';
import './PrintView.css';

const resolveSnapshotRequest = (type, id, itemIndex, itemId) => {
    const itemQuery = itemId ? `?itemId=${encodeURIComponent(itemId)}` : '';

    switch (type) {
        case 'gold-test':
            return {
                endpoint: itemId ? `/print/test/gold/${id}/item${itemQuery}` : itemIndex !== null ? `/print/test/gold/${id}/item/${itemIndex}` : `/print/test/gold/${id}`,
                printType: 'gold-test'
            };
        case 'silver-test':
            return {
                endpoint: itemId ? `/print/test/silver/${id}/item${itemQuery}` : itemIndex !== null ? `/print/test/silver/${id}/item/${itemIndex}` : `/print/test/silver/${id}`,
                printType: 'silver-test'
            };
        case 'gold-certificate':
            return {
                endpoint: itemId ? `/print/certificate/gold/${id}/item${itemQuery}` : itemIndex !== null ? `/print/certificate/gold/${id}/item/${itemIndex}` : `/print/certificate/gold/${id}`,
                printType: 'certificate'
            };
        case 'silver-certificate':
            return {
                endpoint: itemId ? `/print/certificate/silver/${id}/item${itemQuery}` : itemIndex !== null ? `/print/certificate/silver/${id}/item/${itemIndex}` : `/print/certificate/silver/${id}`,
                printType: 'silver'
            };
        case 'photo-certificate':
            return {
                endpoint: itemId ? `/print/certificate/photo/${id}/item${itemQuery}` : itemIndex !== null ? `/print/certificate/photo/${id}/item/${itemIndex}` : `/print/certificate/photo/${id}`,
                printType: 'photo'
            };
        case 'certificate':
        case 'small-certificate':
            return null;
        default:
            return null;
    }
};

const resolveLegacyRequest = (type, id) => {
    if (type === 'gold-test' || type === 'silver-test') {
        return `/${type}s/${id}`;
    }
    if (type === 'certificate' || type === 'small-certificate') {
        return `/certificates/${id}`;
    }
    if (type === 'payment') {
        return `/ledger/transaction/${id}`;
    }
    return `/list/${type}/${id}`;
};

const buildReceiptSnapshot = (payload, routeType) => ({
    lab: {
        name: 'Swastik Assayers',
        tagline: 'Testing & Certification',
        address: payload?.customer?.address || '',
    },
    receipt: {
        number: payload?.header?.auto_number || payload?.bill_number || '-',
        createdAt: payload?.header?.created_at || payload?.created_at || payload?.createdon,
        type: (payload?.header?.metal_type && payload?.header?.entity_type)
            ? `${payload.header.metal_type}-${payload.header.entity_type}`
            : (routeType || payload?.header?.entity_type || 'document'),
        status: payload?.status || payload?.header?.status || 'DONE',
    },
    customer: {
        name: payload?.customer?.name || payload?.customer_name || '-',
        phone: payload?.customer?.phone || payload?.customer_phone || '',
    },
    items: (payload?.items || []).map((item) => {
        // Coerce backend-formatted strings to numbers so the truthy-string
        // problem doesn't make a zero net_weight win over a real gross_weight.
        const gross  = Number(item.gross_weight) || 0;
        const sample = Number(item.test_weight) || 0;
        const net    = Number(item.net_weight) || 0;
        return {
            id: item.id || item.item_number,
            name: item.item_type || item.item_name || item.name || 'Item',
            label: item.item_number || item.certificate_number || '',
            weight: gross > 0 ? gross : net,
            grossWeight:  gross > 0 ? gross : undefined,
            sampleWeight: sample > 0 ? sample : undefined,
            amount: Number(item.item_total || item.total || 0),
            purity: item.purity,
        };
    }),
    totals: {
        subtotal: Number(payload?.totals?.base || payload?.base || 0),
        tax: Number(payload?.totals?.tax || payload?.tax || 0),
        total: Number(payload?.totals?.total || payload?.total || payload?.grand_total || 0),
        paid: Number(payload?.totals?.total || payload?.total || payload?.grand_total || 0),
        balance: 0,
    },
    footer: {
        message: 'Snapshot receipt copy',
    },
});

const PrintView = () => {
    const { type, id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const itemIndex = queryParams.get('itemIndex'); // Support printing specific items from a set
    const itemId = queryParams.get('itemId'); // Preferred stable item selector
    const layout = queryParams.get('layout');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [resolvedType, setResolvedType] = useState(type);
    const printPayload = data?.data || data;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setData(null);
            setSelectedItem(null);
            setResolvedType(type);

            try {
                const snapshotRequest = resolveSnapshotRequest(type, id, itemIndex, itemId);
                const response = snapshotRequest
                    ? await api.get(snapshotRequest.endpoint)
                    : await api.get(resolveLegacyRequest(type, id));
                const result = response.data.success ? response.data.data : response.data;

                if (snapshotRequest?.printType) {
                    setResolvedType(snapshotRequest.printType);
                }
                setData(result);

                // Handle item-level precision for batch records
                if ((itemIndex !== null || itemId) && result && result.data?.items) {
                    setSelectedItem(result.data.items[0] || null);
                } else if (itemIndex !== null && result && result.items) {
                    setSelectedItem(result.items[parseInt(itemIndex, 10)]);
                } else {
                    setSelectedItem(null);
                }
            } catch (error) {
                console.error('Error fetching print data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id, itemIndex, itemId]);

    useEffect(() => {
        if (!loading && data) {
            // Match Python: auto-print then close the tab when print dialog finishes
            const afterPrint = () => window.close();
            window.onafterprint = afterPrint;
            if (window.matchMedia) {
                const mql = window.matchMedia('print');
                const listener = (e) => { if (!e.matches) afterPrint(); };
                mql.addEventListener('change', listener);
            }

            let f1 = window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => window.print());
            });

            return () => {
                window.cancelAnimationFrame(f1);
                window.onafterprint = null;
            };
        }
        return undefined;
    }, [loading, data]);

    if (loading) return (
        <div className="print-loading-screen">
            <div className="spinner-border text-primary"></div>
            <h3>Generating Digital Master...</h3>
        </div>
    );

    if (!data) return (
        <div className="print-error-screen">
            <h3>Record Not Found</h3>
            <p>The requested document could not be synchronized with the master database.</p>
            <button className="btn btn-primary" onClick={() => window.history.back()}>Return to Lab</button>
        </div>
    );

    return (
        <div className="print-container">
            <div className="no-print print-toolbar">
                <div className="toolbar-info">
                    <span className="badge bg-primary">Digital Preview</span>
                    <span>Document: <strong>{type.toUpperCase()} / {id}</strong></span>
                </div>
                <div className="toolbar-actions">
                    <button className="btn btn-dark" onClick={() => window.print()}>Execute Print</button>
                    <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>Cancel</button>
                </div>
            </div>

            <div className="print-content">
                {layout === 'receipt' ? (
                    <ThermalReceipt snapshot={buildReceiptSnapshot(printPayload, type)} />
                ) : selectedItem ? (
                    <PrintManager
                        type={resolvedType}
                        data={printPayload}
                        item={selectedItem}
                        photos={printPayload?.photos || []}
                        layout={layout || 'full'}
                    />
                ) : (
                    queryParams.get('itemLevel') === 'true' && printPayload?.items && printPayload.items.length > 0 ? (
                        printPayload.items.map((it, idx) => (
                            <div key={it.id || it.item_no || it.item_number || idx} style={{ pageBreakAfter: idx < printPayload.items.length - 1 ? 'always' : 'auto' }}>
                                <PrintManager
                                    type={resolvedType}
                                    data={printPayload}
                                    item={it}
                                    photos={printPayload?.photos || []}
                                    layout={layout || 'full'}
                                />
                            </div>
                        ))
                    ) : (
                        <PrintManager
                            type={resolvedType}
                            data={printPayload}
                            item={null}
                            photos={printPayload?.photos || []}
                            layout={layout || 'full'}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default PrintView;
