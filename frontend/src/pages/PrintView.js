import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import PrintManager from '../components/print/PrintManager';
import './PrintView.css';

const resolveSnapshotRequest = (type, id, itemIndex) => {
    switch (type) {
        case 'gold-test':
            return {
                endpoint: itemIndex !== null ? `/print/test/gold/${id}/item/${itemIndex}` : `/print/test/gold/${id}`,
                printType: 'gold-test'
            };
        case 'silver-test':
            return {
                endpoint: itemIndex !== null ? `/print/test/silver/${id}/item/${itemIndex}` : `/print/test/silver/${id}`,
                printType: 'silver-test'
            };
        case 'gold-certificate':
            return {
                endpoint: itemIndex !== null ? `/print/certificate/gold/${id}/item/${itemIndex}` : `/print/certificate/gold/${id}`,
                printType: 'certificate'
            };
        case 'silver-certificate':
            return {
                endpoint: itemIndex !== null ? `/print/certificate/silver/${id}/item/${itemIndex}` : `/print/certificate/silver/${id}`,
                printType: 'silver'
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

const PrintView = () => {
    const { type, id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const itemIndex = queryParams.get('itemIndex'); // Support printing specific items from a set

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
                const snapshotRequest = resolveSnapshotRequest(type, id, itemIndex);
                const response = snapshotRequest
                    ? await api.get(snapshotRequest.endpoint)
                    : await api.get(resolveLegacyRequest(type, id));
                const result = response.data.success ? response.data.data : response.data;

                if (snapshotRequest?.printType) {
                    setResolvedType(snapshotRequest.printType);
                }
                setData(result);

                // Handle item-level precision for batch records
                if (itemIndex !== null && result && result.data?.items) {
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
    }, [type, id, itemIndex]);

    useEffect(() => {
        if (!loading && data) {
            let frameOne = null;
            let frameTwo = null;

            frameOne = window.requestAnimationFrame(() => {
                frameTwo = window.requestAnimationFrame(() => {
                    window.print();
                });
            });

            return () => {
                if (frameOne) {
                    window.cancelAnimationFrame(frameOne);
                }
                if (frameTwo) {
                    window.cancelAnimationFrame(frameTwo);
                }
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
                {selectedItem ? (
                    <PrintManager
                        type={resolvedType}
                        data={printPayload}
                        item={selectedItem}
                        photos={printPayload?.photos || []}
                    />
                ) : (
                    (queryParams.get('itemLevel') === 'true' || resolvedType.includes('certificate') || resolvedType.includes('cert') || resolvedType === 'gold' || resolvedType === 'silver' || resolvedType === 'photo') && printPayload?.items && printPayload.items.length > 0 ? (
                        printPayload.items.map((it, idx) => (
                            <div key={it.id || it.item_no || it.item_number || idx} style={{ pageBreakAfter: idx < printPayload.items.length - 1 ? 'always' : 'auto' }}>
                                <PrintManager
                                    type={resolvedType}
                                    data={printPayload}
                                    item={it}
                                    photos={printPayload?.photos || []}
                                />
                            </div>
                        ))
                    ) : (
                        <PrintManager
                            type={resolvedType}
                            data={printPayload}
                            item={null}
                            photos={printPayload?.photos || []}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default PrintView;
