import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import './Verify.css'; // Optional minimal CSS

const Verify = () => {
    const { autoNumber } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVerification = async () => {
            try {
                // Determine API URL (using relative if deployed, or localhost for dev)
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/public/verify/${autoNumber}`);

                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    setError(response.data.error || 'Verification failed.');
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Verification failed: Certificate not found.');
            } finally {
                setLoading(false);
            }
        };

        if (autoNumber) {
            fetchVerification();
        }
    }, [autoNumber]);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <FaLock size={20} color="#10B981" />
                    <h2>Swastik Digital Ledger</h2>
                </div>

                {loading ? (
                    <div style={styles.stateCenter}>
                        <div className="slds-spinner slds-spinner_medium"></div>
                        <p>Verifying secure ledger for <b>{autoNumber}</b>...</p>
                    </div>
                ) : error ? (
                    <div style={styles.stateCenter}>
                        <FaExclamationTriangle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: '#EF4444' }}>Verification Failed</h3>
                        <p>{error}</p>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '12px' }}>
                            Please contact Swastik Lab front desk if you believe this is an error.
                        </p>
                    </div>
                ) : (
                    <div style={styles.successState}>
                        <div style={styles.badge}>
                            <FaCheckCircle size={40} color="#10B981" />
                        </div>
                        <h3 style={{ marginTop: '16px', marginBottom: '4px', color: '#059669' }}>Authentic Record Found</h3>
                        <p style={{ color: '#6B7280', marginBottom: '24px' }}>This digital certificate prevents forgery and guarantees laboratory metrics.</p>

                        <div style={styles.dataGrid}>
                            <div style={styles.dataRow}>
                                <span>Certificate Number:</span>
                                <strong>{data.autoNumber}</strong>
                            </div>
                            <div style={styles.dataRow}>
                                <span>Analysis Type:</span>
                                <strong>{data.type}</strong>
                            </div>
                            <div style={styles.dataRow}>
                                <span>Issue Date:</span>
                                <strong>{new Date(data.date).toLocaleDateString()}</strong>
                            </div>
                            <div style={styles.dataRow}>
                                <span>Authorized Client:</span>
                                <strong>{data.customer}</strong>
                            </div>
                            {data.purity !== 'N/A' && (
                                <div style={styles.dataRowHighlight}>
                                    <span>Certified Purity:</span>
                                    <strong style={{ fontSize: '18px', color: '#B45309' }}>{data.purity}%</strong>
                                </div>
                            )}
                            {data.weight !== 'N/A' && (
                                <div style={styles.dataRow}>
                                    <span>Gross Weight tested:</span>
                                    <strong>{data.weight} gm</strong>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '32px', textAlign: 'center' }}>
                            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Secured by SwastikCore Enterprise Architecture Phase 4</p>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                    Admin Login &rarr;
                </Link>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F3F4F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '500px',
        overflow: 'hidden'
    },
    header: {
        backgroundColor: '#1F2937',
        color: '#FFFFFF',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    stateCenter: {
        padding: '64px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    },
    successState: {
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    badge: {
        backgroundColor: '#D1FAE5',
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 4px #A7F3D0'
    },
    dataGrid: {
        width: '100%',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    dataRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        color: '#374151',
        fontSize: '14px'
    },
    dataRowHighlight: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        fontSize: '15px'
    }
};

export default Verify;
