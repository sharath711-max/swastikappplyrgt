import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import WorkflowPage from './pages/WorkflowPage';
import CustomersPage from './pages/CustomersPage';
import BillsPage from './pages/BillsPage';
import ItemsPage from './pages/ItemsPage';
import PrintPage from './pages/PrintPage';
import ReceiptPage from './pages/Print/ReceiptPage';
import CertificatePage from './pages/Print/CertificatePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/print" element={<PrintPage />} />
          <Route path="/print/receipt" element={<ReceiptPage />} />
          <Route path="/print/certificate" element={<CertificatePage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
