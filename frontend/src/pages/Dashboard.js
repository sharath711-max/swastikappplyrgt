import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Alert } from 'react-bootstrap';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const formatINR = (val) => Number(val || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const getVariant = (s) => ({ DONE: 'success', IN_PROGRESS: 'info', PENDING: 'warning', FAILED: 'danger', TODO: 'secondary' }[s] || 'primary');

const StatCard = ({ title, value, color }) => (
    <Card className="shadow-sm border-0 mb-4" style={{ borderLeft: `4px solid var(--bs-${color})` }}>
        <Card.Body>
            <h6 className="text-muted text-uppercase mb-2 fw-bold">{title}</h6>
            <h3 className={`fw-bold text-${color} mb-0`}>{value}</h3>
        </Card.Body>
    </Card>
);

const RecentTable = ({ title, data, columns }) => (
    <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-0 pt-4 pb-0"><h5 className="fw-bold">{title}</h5></Card.Header>
        <Card.Body>
            <Table responsive hover className="mb-0">
                <thead className="text-muted small">
                    <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
                </thead>
                <tbody>
                    {!data?.length ? <tr><td colSpan={columns.length} className="text-center text-muted">No recent data</td></tr> : data.map((r, i) => (
                        <tr key={r.id || i}>
                            {columns.map(c => (
                                <td key={c.key}>
                                    {c.isDate ? formatDate(r[c.key]) 
                                    : c.isCurr ? formatINR(r[c.key])
                                    : c.key === 'status' ? <Badge bg={getVariant(r[c.key])}>{r[c.key]}</Badge> 
                                    : r[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card.Body>
    </Card>
);

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = () => {
        api.get('/dashboard/summary')
            .then(res => { setData(res.data?.data ?? res.data); setError(null); })
            .catch(e => setError(e.message || 'Failed to load dashboard'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

    const testCols = [
        { key: 'created_at', label: 'Date', isDate: true }, { key: 'auto_number', label: 'ID' },
        { key: 'customer_name', label: 'Customer' }, { key: 'status', label: 'Status' }, 
        { key: 'total', label: 'Amount', isCurr: true }
    ];

    const certCols = [
        { key: 'issue_date', label: 'Date', isDate: true }, { key: 'certificate_no', label: 'Cert No' }, 
        { key: 'customer_name', label: 'Customer' }, { key: 'total_amount', label: 'Amount', isCurr: true }
    ];

    const stats = [
        { title: 'Today Revenue', value: formatINR(data?.todayRevenue), color: 'success' },
        { title: 'Today Expense', value: formatINR(data?.todayExpense), color: 'danger' },
        { title: 'Cash In Hand', value: formatINR(data?.cashInHand), color: 'info' },
        { title: 'Customer Balance', value: formatINR(data?.customerBalance), color: 'warning' },
        { title: 'Active Tests', value: data?.activeTests || 0, color: 'primary' },
        { title: 'Completed Today', value: data?.completedToday || 0, color: 'success' }
    ];

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4 fw-bold">Dashboard</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {!error && data && (
                <>
                    <Row>{stats.map(s => <Col md={4} sm={6} key={s.title}><StatCard {...s} /></Col>)}</Row>
                    <Row>
                        <Col lg={6}><RecentTable title="Recent Tests" data={data.recentTests} columns={testCols} /></Col>
                        <Col lg={6}><RecentTable title="Recent Certificates" data={data.recentCertificates} columns={certCols} /></Col>
                    </Row>
                </>
            )}
        </Container>
    );
}
