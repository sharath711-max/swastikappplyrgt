import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import PrintManager from '../components/print/PrintManager';
import './PrintView.css';

const PrintView = () => {
    const { type, id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const itemIndex = queryParams.get('itemIndex'); // Support printing specific items from a set

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let endpoint = '';
                if (type === 'gold-test' || type === 'silver-test') {
                    endpoint = `/${type}s/${id}`;
                } else if (type === 'certificate' || type === 'small-certificate') {
                    endpoint = `/certificates/${id}`;
                } else if (type === 'payment') {
                    endpoint = `/ledger/transaction/${id}`;
                } else {
                    // Generic fallback for list view record pages
                    endpoint = `/list/${type}/${id}`;
                }

                const response = await api.get(endpoint);
                const result = response.data.success ? response.data.data : response.data;
                setData(result);

                // Handle item-level precision for batch records
                if (itemIndex !== null && result && result.items) {
                    setSelectedItem(result.items[parseInt(itemIndex, 10)]);
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
            const timer = setTimeout(() => {
                window.print();
            }, 800); // Slightly longer delay for high-fidelity asset loading
            return () => clearTimeout(timer);
        }
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
                        type={type}
                        data={data}
                        item={selectedItem}
                        photos={data.photos || []}
                    />
                ) : (
                    (queryParams.get('itemLevel') === 'true' || type.includes('certificate') || type.includes('cert') || type === 'gold' || type === 'silver' || type === 'photo') && data.items && data.items.length > 0 ? (
                        data.items.map((it, idx) => (
                            <div key={idx} style={{ pageBreakAfter: idx < data.items.length - 1 ? 'always' : 'auto' }}>
                                <PrintManager
                                    type={type}
                                    data={data}
                                    item={it}
                                    photos={data.photos || []}
                                />
                            </div>
                        ))
                    ) : (
                        <PrintManager
                            type={type}
                            data={data}
                            item={null}
                            photos={data.photos || []}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default PrintView;
