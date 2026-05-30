import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table
} from 'react-bootstrap';
import {
  FaArrowDown, FaArrowUp, FaDownload, FaFilter, FaInbox,
  FaPlus, FaSearch, FaSync, FaUser
} from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const PAGE_SIZE = 20;          // ledger entries per page
const CUSTOMER_PAGE_SIZE = 20; // customer rail rows per page
const DEBOUNCE_MS = 250;       // customer-search debounce

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// Default filter: current calendar month
const thisMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FILTERS = { type: '', start_date: thisMonthStart(), end_date: today(), min_amount: '', max_amount: '' };

const CustomerRow = ({ c, active, onClick }) => (
  <div
    className={`p-2 rounded mb-1 ${active ? 'bg-primary text-white' : 'bg-light'}`}
    style={{ cursor: 'pointer' }}
    onClick={onClick}
  >
    <div className="fw-semibold small">{c.name}</div>
    <div className="small opacity-75">{c.phone || '—'}</div>
  </div>
);

export default function BillsPage() {
  const { addToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [custPage, setCustPage] = useState(1);
  const [custPages, setCustPages] = useState(1);
  const [custLoading, setCustLoading] = useState(false);
  const custSeqRef = useRef(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [ledger, setLedger] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, current_page: 1 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  // Request ID is generated the moment the modal opens — not on submit
  const requestIdRef = useRef(null);
  const [form, setForm] = useState({ type: 'DEBIT', amount: '', mode_of_payment: 'Cash', description: '' });
  const [saving, setSaving] = useState(false);

  // Server-paged customer rail (A1 endpoint). Empty query browses page 1;
  // a query filters server-side. seqRef cancels out-of-order responses so a
  // fast typer never sees a stale page land after a newer one.
  const fetchCustomers = useCallback(async (search, pg) => {
    const seq = ++custSeqRef.current;
    setCustLoading(true);
    try {
      const params = { page: pg, pageSize: CUSTOMER_PAGE_SIZE, sortBy: 'name', sortOrder: 'asc' };
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/customers', { params });
      if (seq !== custSeqRef.current) return;
      const rows = Array.isArray(res.data?.data) ? res.data.data
        : (Array.isArray(res.data) ? res.data : []);
      setCustomers(rows);
      setCustPages(res.data?.pagination?.totalPages || 1);
    } catch {
      if (seq === custSeqRef.current) addToast('Failed to load customers', 'error');
    } finally {
      if (seq === custSeqRef.current) setCustLoading(false);
    }
  }, [addToast]);

  // Debounced reload whenever the search term changes; always resets to page 1.
  useEffect(() => {
    const id = setTimeout(() => {
      setCustPage(1);
      fetchCustomers(customerSearch, 1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [customerSearch, fetchCustomers]);

  const handleCustPageChange = (pg) => {
    setCustPage(pg);
    fetchCustomers(customerSearch, pg);
  };

  const fetchLedger = useCallback(async (customerId, pg, activeFilters) => {
    if (!customerId) return;
    setLoading(true);
    try {
      const params = { customer_id: customerId, page: pg, limit: PAGE_SIZE };
      if (activeFilters.type) params.type = activeFilters.type;
      if (activeFilters.start_date) params.start_date = activeFilters.start_date;
      if (activeFilters.end_date) params.end_date = activeFilters.end_date;
      if (activeFilters.min_amount !== '') params.min_amount = activeFilters.min_amount;
      if (activeFilters.max_amount !== '') params.max_amount = activeFilters.max_amount;

      const res = await api.get('/credit-history', { params });
      const data = res.data.data || [];
      setLedger(data);
      setPagination(res.data.pagination || { total: data.length, pages: 1, current_page: 1 });
    } catch {
      addToast('Failed to load ledger', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c);
    setPage(1);
    fetchLedger(c.id, 1, filters);
  };

  const handleApplyFilters = () => {
    if (!selectedCustomer) return;
    setPage(1);
    fetchLedger(selectedCustomer.id, 1, filters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const reset = EMPTY_FILTERS;
    setFilters(reset);
    if (selectedCustomer) {
      setPage(1);
      fetchLedger(selectedCustomer.id, 1, reset);
    }
    setShowFilters(false);
  };

  const handlePageChange = (pg) => {
    setPage(pg);
    fetchLedger(selectedCustomer.id, pg, filters);
  };

  const handleExport = async () => {
    if (!selectedCustomer) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({ customer_id: selectedCustomer.id });
      if (filters.type) params.set('type', filters.type);
      if (filters.start_date) params.set('start_date', filters.start_date);
      if (filters.end_date) params.set('end_date', filters.end_date);
      if (filters.min_amount !== '') params.set('min_amount', filters.min_amount);
      if (filters.max_amount !== '') params.set('max_amount', filters.max_amount);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const base = process.env.REACT_APP_API_URL || 'http://localhost:6001/api';
      const res = await fetch(`${base}/credit-history/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1]
        || `statement_${selectedCustomer.name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenAdd = () => {
    // Idempotency: lock in request ID at modal open time, not submit time
    requestIdRef.current = crypto.randomUUID();
    setForm({ type: 'DEBIT', amount: '', mode_of_payment: 'Cash', description: '' });
    setShowAdd(true);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      addToast('Enter a valid positive amount', 'error');
      return;
    }
    if (!form.description.trim()) {
      addToast('Description is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/credit-history', {
        customer_id: selectedCustomer.id,
        amount: amt,
        type: form.type,
        mode_of_payment: form.mode_of_payment,
        description: form.description.trim()
      }, {
        headers: { 'X-Request-Id': requestIdRef.current }
      });
      addToast('Entry recorded', 'success');
      setShowAdd(false);
      setPage(1);
      fetchLedger(selectedCustomer.id, 1, filters);
      api.get(`/customers/${selectedCustomer.id}`)
        .then(r => setSelectedCustomer(r.data.data || r.data))
        .catch(() => {});
    } catch (err) {
      addToast(err.message || 'Failed to save entry', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Pin the active customer above the list when they're not on the current
  // page/search, so switching pages never hides who's selected.
  const selectedOnPage = selectedCustomer && customers.some(c => c.id === selectedCustomer.id);

  const balance = selectedCustomer?.balance ?? 0;
  const activeFilterCount = [filters.type, filters.min_amount, filters.max_amount].filter(Boolean).length;

  return (
    <Row className="g-3">
      {/* Customer picker */}
      <Col lg={3}>
        <Card className="h-100">
          <Card.Header className="d-flex align-items-center gap-2 fw-semibold">
            <FaUser /> Customers
          </Card.Header>
          <Card.Body className="p-2">
            <InputGroup size="sm" className="mb-2">
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Name / phone"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
              />
            </InputGroup>
            <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Pinned active customer when off the current page/search */}
              {selectedCustomer && !selectedOnPage && (
                <>
                  <CustomerRow c={selectedCustomer} active onClick={() => handleSelectCustomer(selectedCustomer)} />
                  <div className="border-bottom mb-2" />
                </>
              )}
              {custLoading ? (
                <div className="d-flex justify-content-center py-4">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : customers.length === 0 ? (
                <p className="text-muted text-center small mt-3">No customers</p>
              ) : (
                customers.map(c => (
                  <CustomerRow
                    key={c.id}
                    c={c}
                    active={selectedCustomer?.id === c.id}
                    onClick={() => handleSelectCustomer(c)}
                  />
                ))
              )}
            </div>
            {custPages > 1 && (
              <div className="d-flex align-items-center justify-content-between mt-2 small">
                <Button size="sm" variant="outline-secondary" disabled={custPage <= 1 || custLoading}
                  onClick={() => handleCustPageChange(custPage - 1)}>Prev</Button>
                <span className="text-muted">{custPage} / {custPages}</span>
                <Button size="sm" variant="outline-secondary" disabled={custPage >= custPages || custLoading}
                  onClick={() => handleCustPageChange(custPage + 1)}>Next</Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Ledger */}
      <Col lg={9}>
        {!selectedCustomer ? (
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: 300 }}>
              <FaInbox size={40} className="mb-3 opacity-50" />
              <p className="mb-0">Select a customer to view their ledger</p>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <span className="fw-bold">{selectedCustomer.name}</span>
                <span className="text-muted ms-2 small">{selectedCustomer.phone}</span>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className={`fw-bold ${balance < 0 ? 'text-danger' : 'text-success'}`}>
                  Balance: {fmt(balance)}
                </span>
                <Button size="sm" variant="outline-secondary" onClick={() => setShowFilters(v => !v)}>
                  <FaFilter className="me-1" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge bg="primary" pill className="ms-1">{activeFilterCount}</Badge>
                  )}
                </Button>
                <Button size="sm" variant="outline-secondary" onClick={() => fetchLedger(selectedCustomer.id, page, filters)} disabled={loading}>
                  <FaSync className={loading ? 'fa-spin' : ''} />
                </Button>
                <Button size="sm" variant="outline-success" onClick={handleExport} disabled={exporting}>
                  {exporting ? <Spinner size="sm" animation="border" className="me-1" /> : <FaDownload className="me-1" />}
                  CSV
                </Button>
                <Button size="sm" variant="primary" onClick={handleOpenAdd}>
                  <FaPlus className="me-1" /> Add Entry
                </Button>
              </div>
            </Card.Header>

            {/* Filter bar */}
            {showFilters && (
              <div className="px-3 py-2 border-bottom bg-light">
                <Row className="g-2 align-items-end small">
                  <Col xs={6} sm={3}>
                    <Form.Label className="mb-1 fw-semibold">From</Form.Label>
                    <Form.Control size="sm" type="date" value={filters.start_date}
                      onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} />
                  </Col>
                  <Col xs={6} sm={3}>
                    <Form.Label className="mb-1 fw-semibold">To</Form.Label>
                    <Form.Control size="sm" type="date" value={filters.end_date}
                      onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} />
                  </Col>
                  <Col xs={4} sm={2}>
                    <Form.Label className="mb-1 fw-semibold">Type</Form.Label>
                    <Form.Select size="sm" value={filters.type}
                      onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                      <option value="">All</option>
                      <option value="DEBIT">Debit</option>
                      <option value="CREDIT">Credit</option>
                    </Form.Select>
                  </Col>
                  <Col xs={4} sm={2}>
                    <Form.Label className="mb-1 fw-semibold">Min ₹</Form.Label>
                    <Form.Control size="sm" type="number" min="0" placeholder="0"
                      value={filters.min_amount}
                      onChange={e => setFilters(f => ({ ...f, min_amount: e.target.value }))} />
                  </Col>
                  <Col xs={4} sm={2}>
                    <Form.Label className="mb-1 fw-semibold">Max ₹</Form.Label>
                    <Form.Control size="sm" type="number" min="0" placeholder="∞"
                      value={filters.max_amount}
                      onChange={e => setFilters(f => ({ ...f, max_amount: e.target.value }))} />
                  </Col>
                  <Col xs={12} className="d-flex gap-2 mt-1">
                    <Button size="sm" variant="primary" onClick={handleApplyFilters}>Apply</Button>
                    <Button size="sm" variant="outline-secondary" onClick={handleResetFilters}>Reset</Button>
                  </Col>
                </Row>
              </div>
            )}

            <Card.Body className="p-0">
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : ledger.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <FaInbox size={32} className="mb-2 opacity-50" />
                  <p className="mb-0">No transactions match the current filters</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 155 }}>Date</th>
                      <th>Description</th>
                      <th>Mode</th>
                      <th className="text-end">Amount</th>
                      <th className="text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map(row => (
                      <tr key={row.id}>
                        <td className="text-muted">{fmtDate(row.createdon || row.created)}</td>
                        <td>{row.description}</td>
                        <td>{row.mode_of_payment || '—'}</td>
                        <td className={`text-end fw-semibold ${row.type === 'debit' ? 'text-danger' : 'text-success'}`}>
                          {row.type === 'debit' ? <FaArrowDown className="me-1" /> : <FaArrowUp className="me-1" />}
                          {fmt(row.amount)}
                        </td>
                        <td className="text-center">
                          <Badge bg={row.type === 'debit' ? 'danger' : 'success'} className="text-uppercase">
                            {row.type}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>

            {pagination.pages > 1 && (
              <Card.Footer className="d-flex align-items-center justify-content-between small">
                <span className="text-muted">{pagination.total} entries</span>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                    Prev
                  </Button>
                  <span className="px-2 align-self-center">{page} / {pagination.pages}</span>
                  <Button size="sm" variant="outline-secondary" disabled={page >= pagination.pages} onClick={() => handlePageChange(page + 1)}>
                    Next
                  </Button>
                </div>
              </Card.Footer>
            )}
          </Card>
        )}
      </Col>

      {/* Add entry modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Form onSubmit={handleAddEntry}>
          <Modal.Header closeButton>
            <Modal.Title className="fs-6">Add Ledger Entry — {selectedCustomer?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={6}>
                <Form.Label className="small fw-semibold">Type</Form.Label>
                <Form.Select size="sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="DEBIT">Debit (charge)</option>
                  <option value="CREDIT">Credit (payment)</option>
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label className="small fw-semibold">Payment Mode</Form.Label>
                <Form.Select size="sm" value={form.mode_of_payment} onChange={e => setForm(f => ({ ...f, mode_of_payment: e.target.value }))}>
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </Form.Select>
              </Col>
              <Col xs={12}>
                <Form.Label className="small fw-semibold">Amount (₹)</Form.Label>
                <Form.Control
                  size="sm" type="number" min="0.01" step="0.01" placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  required
                />
              </Col>
              <Col xs={12}>
                <Form.Label className="small fw-semibold">Description</Form.Label>
                <Form.Control
                  size="sm" as="textarea" rows={2}
                  placeholder="Reason for this entry"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving && <Spinner size="sm" animation="border" className="me-1" />}
              Save Entry
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Row>
  );
}
