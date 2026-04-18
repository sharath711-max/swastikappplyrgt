import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

export default function BillsPage() {
  return (
    <Row>
      <Col lg={8}>
        <Card className="p-4">
          <h2 className="mb-2">Bills</h2>
          <p className="text-muted mb-0">
            Billing UI will be connected here once the dedicated bills API response
            and screen contract are finalized.
          </p>
        </Card>
      </Col>
    </Row>
  );
}
