import React, { useState } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaDatabase, FaCloudUploadAlt, FaHistory } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const BackupPage = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);

    const handleTriggerBackup = async () => {
        setLoading(true);
        try {
            // Placeholder endpoint — we might need to add this to backend
            await api.post('/audit/backup'); 
            setLastBackup(new Date().toLocaleString());
            addToast('Backup initiated successfully. Check server logs for S3 upload status.', 'success');
        } catch (error) {
            addToast(error.response?.data?.error || 'Failed to trigger backup', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-4">
            <div className="mb-4">
                <h2>Database Backups</h2>
                <p className="text-muted">Manage system snapshots and offsite storage.</p>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="p-4 d-flex flex-column">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                    <FaDatabase className="text-primary fs-4" />
                                </div>
                                <div>
                                    <h5 className="mb-0">Manual Snapshot</h5>
                                    <small className="text-muted">Create an immediate backup of the lab database.</small>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <Alert variant="info" className="mb-4">
                                    <small>
                                        Each snapshot is stored locally in the <code>/backups</code> directory 
                                        and automatically uploaded to AWS S3 if configured.
                                    </small>
                                </Alert>

                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    className="w-100" 
                                    onClick={handleTriggerBackup}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><Spinner animation="border" size="sm" className="me-2" /> Creating Snapshot...</>
                                    ) : (
                                        <><FaCloudUploadAlt className="me-2" /> Trigger Backup Now</>
                                    )}
                                </Button>

                                {lastBackup && (
                                    <div className="text-center mt-3 text-success small fw-bold">
                                        Last backup triggered at: {lastBackup}
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-6">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
                                    <FaHistory className="text-secondary fs-4" />
                                </div>
                                <div>
                                    <h5 className="mb-0">Backup Policy</h5>
                                    <small className="text-muted">Automated retention and storage settings.</small>
                                </div>
                            </div>

                            <ul className="list-unstyled mb-0">
                                <li className="mb-3 d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-muted">Retention Period</span>
                                    <span className="fw-bold text-dark">7 Days</span>
                                </li>
                                <li className="mb-3 d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-muted">Storage Engine</span>
                                    <span className="fw-bold text-dark">Local + AWS S3</span>
                                </li>
                                <li className="mb-3 d-flex justify-content-between border-bottom pb-2">
                                    <span className="text-muted">Auto-Cleanup</span>
                                    <span className="fw-bold text-success">Enabled</span>
                                </li>
                                <li className="d-flex justify-content-between">
                                    <span className="text-muted">Last System Check</span>
                                    <span className="fw-bold text-dark">Healthy</span>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
};

export default BackupPage;
