import React, { useEffect, useMemo } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ThermalReceipt from '../components/print/ThermalReceipt';
import '../components/print/CertificatePrint.css';

const SNAPSHOT_STORAGE_KEY = 'swastik.print.snapshot';

const fallbackSnapshot = {
  lab: {
    name: 'SWASTIK GOLD LAB',
    tagline: 'Thermal Receipt Preview',
    address: 'Snapshot mode',
  },
  receipt: {
    number: 'PREVIEW-001',
    createdAt: new Date().toISOString(),
    type: 'THERMAL',
    status: 'READY',
  },
  customer: {
    name: 'Walk-in Customer',
    phone: '',
  },
  items: [
    {
      id: 'sample-1',
      name: 'Sample Item',
      label: 'Gold Test',
      weight: 1.25,
      amount: 250,
      purity: '91.6',
    },
  ],
  totals: {
    subtotal: 250,
    tax: 0,
    total: 250,
    paid: 250,
    balance: 0,
  },
  footer: {
    message: 'Preview snapshot only',
  },
};

const readStoredSnapshot = () => {
  try {
    const rawValue = sessionStorage.getItem(SNAPSHOT_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    return null;
  }
};

export default function PrintPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const snapshot = useMemo(() => {
    if (location.state?.snapshot) {
      return location.state.snapshot;
    }

    const storedSnapshot = readStoredSnapshot();
    if (storedSnapshot) {
      return storedSnapshot;
    }

    return fallbackSnapshot;
  }, [location.state]);

  const autoPrint = searchParams.get('autoprint') === 'true';

  useEffect(() => {
    if (location.state?.snapshot) {
      sessionStorage.setItem(
        SNAPSHOT_STORAGE_KEY,
        JSON.stringify(location.state.snapshot)
      );
    }
  }, [location.state]);

  useEffect(() => {
    if (!autoPrint) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [autoPrint, snapshot]);

  return (
    <div className="print-page-shell">
      <div className="print-toolbar no-print">
        <div className="toolbar-info">
          <span className="badge bg-dark">Receipt Preview</span>
          <span>Snapshot data only</span>
        </div>
        <div className="toolbar-actions">
          <Button variant="dark" onClick={() => window.print()}>
            Print Receipt
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      {!location.state?.snapshot && !readStoredSnapshot() ? (
        <Card className="p-3 m-3 no-print">
          <Alert variant="warning" className="mb-0">
            No snapshot was passed into this route, so a preview receipt is shown.
          </Alert>
        </Card>
      ) : null}

      <div className="print-content receipt-print-content">
        <ThermalReceipt snapshot={snapshot} />
      </div>
    </div>
  );
}
