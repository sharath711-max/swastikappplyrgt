import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge, Button, Card, Col, Form, InputGroup, Row, Spinner, Table
} from 'react-bootstrap';
import { FaFlask, FaInbox, FaSave, FaSearch, FaSync } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const createRequestId = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const STATUS_COLORS = { TODO: 'secondary', IN_PROGRESS: 'warning', DONE: 'success' };
const fmtW = (v) => (v == null || v === '' ? '—' : parseFloat(v).toFixed(3));

export default function ItemMasterPage() {
  const { addToast } = useToast();

  const [metal, setMetal] = useState('gold');

  const [tests, setTests] = useState([]);
  const [testPage, setTestPage] = useState(1);
  const [testPages, setTestPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('IN_PROGRESS');
  const [search, setSearch] = useState('');
  const [loadingTests, setLoadingTests] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState(new Set());
  const [calculating, setCalculating] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const saveReqIdRef = useRef(createRequestId());

  const fetchTests = useCallback(async (pg, m, sf, s) => {
    setLoadingTests(true);
    try {
      const params = { page: pg, limit: 20 };
      if (sf) params.status = sf;
      if (s && s.trim()) params.search = s.trim();
      const res = await api.get(`/${m}-tests`, { params });
      setTests(res.data.data || []);
      setTestPages(res.data.pagination?.pages ?? 1);
    } catch {
      addToast('Failed to load tests', 'error');
    } finally {
      setLoadingTests(false);
    }
  }, [addToast]);

  useEffect(() => {
    setSelectedTest(null);
    setRows([]);
    setDirty(new Set());
    setTestPage(1);
    fetchTests(1, metal, statusFilter, search);
  }, [metal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setTestPage(1);
    fetchTests(1, metal, statusFilter, search);
  };

  const handleStatusFilterChange = (sf) => {
    setStatusFilter(sf);
    setTestPage(1);
    fetchTests(1, metal, sf, search);
  };

  const handleTestPageChange = (pg) => {
    setTestPage(pg);
    fetchTests(pg, metal, statusFilter, search);
  };

  const handleSelectTest = async (test) => {
    if (selectedTest?.id === test.id) return;
    setLoadingTest(true);
    setSelectedTest(null);
    setRows([]);
    setDirty(new Set());
    saveReqIdRef.current = createRequestId();
    try {
      const res = await api.get(`/${metal}-tests/${test.id}`);
      const full = res.data.data || res.data;
      setSelectedTest(full);
      setRows((full.items || []).map(it => ({ ...it, _preview: {} })));
    } catch {
      addToast('Failed to load test detail', 'error');
    } finally {
      setLoadingTest(false);
    }
  };

  const handleFieldChange = (itemId, field, value) => {
    setRows(prev => prev.map(r => r.id === itemId ? { ...r, [field]: value } : r));
    setDirty(prev => new Set(prev).add(itemId));
  };

  const handleCalcBlur = async (itemId) => {
    const row = rows.find(r => r.id === itemId);
    if (!row) return;

    const gross = parseFloat(row.gross_weight);
    const testW = parseFloat(row.test_weight);
    const purity = parseFloat(row.purity);
    if (isNaN(gross) || isNaN(testW) || isNaN(purity)) return;

    setCalculating(prev => new Set(prev).add(itemId));
    try {
      const res = await api.post(`/${metal}-tests/calculate-item`, {
        gross_weight: gross,
        test_weight: testW,
        purity,
        rate_per_gram: 0,
        returned: row.returned ? 1 : 0,
        is_returned: row.returned === 1,
      });
      const calc = res.data.data;
      setRows(prev => prev.map(r =>
        r.id === itemId
          ? { ...r, _preview: { net_weight: calc.net_weight, fine_weight: calc.fine_weight } }
          : r
      ));
    } catch {
      // preview failure is non-blocking
    } finally {
      setCalculating(prev => { const s = new Set(prev); s.delete(itemId); return s; });
    }
  };

  const handleSave = async () => {
    if (!selectedTest || dirty.size === 0 || saving) return;
    setSaving(true);
    const items = rows
      .filter(r => dirty.has(r.id))
      .map(r => ({
        id: r.id,
        test_weight: parseFloat(r.test_weight) || 0,
        purity: parseFloat(r.purity) || 0,
        returned: r.returned ? 1 : 0,
      }));
    try {
      await api.put(`/${metal}-tests/${selectedTest.id}/save-draft`, { items }, {
        headers: { 'X-Request-Id': saveReqIdRef.current }
      });
      addToast('Draft saved', 'success');
      saveReqIdRef.current = createRequestId();
      setDirty(new Set());
      const res = await api.get(`/${metal}-tests/${selectedTest.id}`);
      const full = res.data.data || res.data;
      setSelectedTest(full);
      setRows((full.items || []).map(it => ({ ...it, _preview: {} })));
    } catch (err) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = selectedTest?.status === 'DONE';

  return (
    <Row className="g-3">
      <Col xs={12} className="d-flex align-items-center gap-2">
        <FaFlask className="text-muted" />
        <span className="fw-semibold">Metal:</span>
        <div className="btn-group btn-group-sm">
          <button
            className={`btn ${metal === 'gold' ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setMetal('gold')}
          >Gold</button>
          <button
            className={`btn ${metal === 'silver' ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={() => setMetal('silver')}
          >Silver</button>
        </div>
      </Col>

      <Col lg={4}>
        <Card>
          <Card.Header className="p-2">
            <Form onSubmit={handleSearch} className="d-flex gap-1 mb-2">
              <InputGroup size="sm">
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Auto number / customer"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </InputGroup>
              <Button type="submit" size="sm" variant="outline-secondary" title="Search">
                <FaSync />
              </Button>
            </Form>
            <Form.Select
              size="sm"
              value={statusFilter}
              onChange={e => handleStatusFilterChange(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Form.Select>
          </Card.Header>

          <Card.Body className="p-0" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            {loadingTests ? (
              <div className="d-flex justify-content-center py-4">
                <Spinner size="sm" animation="border" />
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center text-muted py-4 small">
                <FaInbox className="mb-1" /><br />No tests found
              </div>
            ) : tests.map(t => (
              <div
                key={t.id}
                className={`p-2 border-bottom ${selectedTest?.id === t.id ? 'bg-primary text-white' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectTest(t)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <span className="fw-semibold small">{t.auto_number}</span>
                  <Badge bg={STATUS_COLORS[t.status] || 'secondary'} className="small">
                    {t.status}
                  </Badge>
                </div>
                <div className={`small ${selectedTest?.id === t.id ? 'text-white-50' : 'text-muted'}`}>
                  {t.customer_name}
                </div>
              </div>
            ))}
          </Card.Body>

          {testPages > 1 && (
            <Card.Footer className="d-flex justify-content-between align-items-center py-1 small">
              <Button
                size="sm" variant="link" className="p-0"
                disabled={testPage <= 1}
                onClick={() => handleTestPageChange(testPage - 1)}
              >Prev</Button>
              <span className="text-muted">{testPage} / {testPages}</span>
              <Button
                size="sm" variant="link" className="p-0"
                disabled={testPage >= testPages}
                onClick={() => handleTestPageChange(testPage + 1)}
              >Next</Button>
            </Card.Footer>
          )}
        </Card>
      </Col>

      <Col lg={8}>
        {!selectedTest && !loadingTest && (
          <Card>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: 300 }}>
              <FaInbox size={36} className="mb-3 opacity-50" />
              <p className="mb-0">Select a test to view and edit its items</p>
            </Card.Body>
          </Card>
        )}

        {loadingTest && (
          <Card>
            <Card.Body className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </Card.Body>
          </Card>
        )}

        {selectedTest && !loadingTest && (
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="fw-bold">{selectedTest.auto_number}</span>
                <span className="text-muted small">{selectedTest.customer_name}</span>
                <Badge bg={STATUS_COLORS[selectedTest.status] || 'secondary'}>
                  {selectedTest.status}
                </Badge>
                {isReadOnly && <Badge bg="dark">Read-Only</Badge>}
              </div>
              {!isReadOnly && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving || dirty.size === 0}
                >
                  {saving
                    ? <Spinner size="sm" animation="border" className="me-1" />
                    : <FaSave className="me-1" />}
                  Save Draft{dirty.size > 0 ? ` (${dirty.size})` : ''}
                </Button>
              )}
            </Card.Header>

            <Card.Body className="p-0">
              {rows.length === 0 ? (
                <div className="text-center text-muted py-4 small">No items on this test</div>
              ) : (
                <Table responsive hover size="sm" className="mb-0 align-middle small">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 32 }}>#</th>
                      <th>Type</th>
                      <th>Gross (g)</th>
                      <th>Test Wt (g)</th>
                      <th>Purity %</th>
                      <th>Net Wt (g)</th>
                      <th>Fine Wt (g)</th>
                      <th className="text-center">Ret.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isCalc = calculating.has(row.id);
                      const isDirty = dirty.has(row.id);
                      const preview = row._preview || {};
                      const netDisplay = preview.net_weight != null ? fmtW(preview.net_weight) : fmtW(row.net_weight);
                      const fineDisplay = preview.fine_weight != null ? fmtW(preview.fine_weight) : fmtW(row.fine_weight);
                      const hasPreview = preview.net_weight != null;

                      return (
                        <tr key={row.id} className={isDirty ? 'table-warning' : ''}>
                          <td className="text-muted">{idx + 1}</td>
                          <td>
                            <div className="fw-semibold">{row.item_type || '—'}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{row.item_number}</div>
                          </td>
                          <td className="fw-semibold">{fmtW(row.gross_weight)}</td>
                          <td>
                            {isReadOnly ? fmtW(row.test_weight) : (
                              <Form.Control
                                size="sm" type="number" min="0" step="0.001" style={{ width: 80 }}
                                value={row.test_weight ?? ''}
                                onChange={e => handleFieldChange(row.id, 'test_weight', e.target.value)}
                                onBlur={() => handleCalcBlur(row.id)}
                              />
                            )}
                          </td>
                          <td>
                            {isReadOnly ? fmtW(row.purity) : (
                              <Form.Control
                                size="sm" type="number" min="0" max="100" step="0.001" style={{ width: 80 }}
                                value={row.purity ?? ''}
                                onChange={e => handleFieldChange(row.id, 'purity', e.target.value)}
                                onBlur={() => handleCalcBlur(row.id)}
                              />
                            )}
                          </td>
                          <td className={hasPreview ? 'text-primary fw-semibold' : ''}>
                            {isCalc ? <Spinner style={{ width: 12, height: 12 }} animation="border" /> : netDisplay}
                          </td>
                          <td className={hasPreview ? 'text-success fw-semibold' : ''}>
                            {isCalc ? '…' : fineDisplay}
                          </td>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={row.returned === 1}
                              disabled={isReadOnly}
                              onChange={e => handleFieldChange(row.id, 'returned', e.target.checked ? 1 : 0)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
}
