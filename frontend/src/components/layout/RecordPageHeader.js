import React from 'react';
import { Badge, Button, Row, Col, Breadcrumb } from 'react-bootstrap';
import { FaArrowLeft, FaCheckCircle, FaPrint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * Standard Header Grouping for Record Pages (e.g., individual Gold Test view)
 */
const RecordPageHeader = ({
    typeLabel,
    id,
    autoNumber,
    status,
    isFinalized,
    onFinalize,
    onPrint,
    parentRoute = -1
}) => {
    const navigate = useNavigate();

    // Fallback if component hasn't been passed
    const displayId = autoNumber || id || 'New Record';

    return (
        <div className="swastik-record-header bg-white border-bottom py-3 px-4 sticky-top shadow-sm z-index-1000">
            <Breadcrumb className="m-0 mb-2 p-0" style={{ fontSize: '0.8rem', background: 'transparent' }}>
                <Breadcrumb.Item onClick={() => navigate(parentRoute)} className="text-primary fw-medium">
                    {typeLabel}s
                </Breadcrumb.Item>
                <Breadcrumb.Item active className="fw-600 text-dark">
                    {displayId}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Row className="align-items-center mb-1">
                <Col>
                    <div className="d-flex align-items-center">
                        <Button
                            variant="link"
                            className="text-dark p-0 me-3 border-0 rounded-circle back-btn d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', background: '#f4f6f9', transition: '0.2s' }}
                            onClick={() => navigate(parentRoute)}
                        >
                            <FaArrowLeft size={16} />
                        </Button>
                        <div>
                            <h4 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                {displayId}
                            </h4>
                            <small className="text-muted fw-semibold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                                {typeLabel}
                            </small>
                        </div>
                    </div>
                </Col>

                <Col xs="auto" className="d-flex gap-2 align-items-center">
                    {status && (
                        <Badge
                            bg={isFinalized ? 'success' : 'warning'}
                            text={isFinalized ? 'white' : 'dark'}
                            className="px-3 py-2 border rounded-pill fw-bold shadow-sm"
                            style={{ letterSpacing: '0.5px' }}
                        >
                            {status}
                        </Badge>
                    )}

                    {!isFinalized && onFinalize && (
                        <Button
                            variant="outline-success"
                            size="sm"
                            className="fw-bold rounded-pill px-3 shadow-sm d-flex align-items-center gap-2"
                            onClick={onFinalize}
                        >
                            <FaCheckCircle /> Finalize
                        </Button>
                    )}

                    {onPrint && (
                        <Button
                            variant="primary"
                            size="sm"
                            className="fw-bold rounded-pill px-4 shadow-sm d-flex align-items-center gap-2 border-0"
                            style={{ background: '#0176d3' }}
                            onClick={onPrint}
                        >
                            <FaPrint /> Print
                        </Button>
                    )}
                </Col>
            </Row>

            <style>{`
                .back-btn:hover {
                    background: #e2e6ea !important;
                    color: #0176d3 !important;
                }
            `}</style>
        </div>
    );
};

export default RecordPageHeader;
