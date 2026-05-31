import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './auth/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import ModalManager from './components/core/ModalManager';
import AppShell from './components/layout/AppShell';

import { PrintProvider } from './contexts/PrintContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { RecordModalProvider } from './contexts/RecordModalContext';
import PrintPortal from './components/print/PrintPortal';
import Dashboard from './pages/Dashboard';
import Verify from './pages/public/Verify';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import WorkflowBoard from './pages/WorkflowBoard';
import ListViewsPage from './pages/ListViewsPage';
import PrintView from './pages/PrintView';
import WeightLoss from './pages/WeightLoss';
import CashInHand from './pages/CashInHand';
import UserManagement from './pages/UserManagement';
import RecordPage from './pages/RecordPage';
import BillsReportPage from './pages/BillsReportPage';
import ModuleBillsPage from './pages/ModuleBillsPage';
import ItemMasterPage from './pages/ItemMasterPage';

import './index.css';
import './styles/GlobalStyles.css';
import './styles/theme.css';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PrintProvider>
        <ModalProvider>
          <ToastContainer />
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <RecordModalProvider>
            <WorkflowProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify/:autoNumber" element={<Verify />} />

              <Route path="/" element={
                <ProtectedRoute roles={['admin', 'manager', 'technician', 'front_desk']}>
                  <AppShell><Dashboard /></AppShell>
                </ProtectedRoute>
              } />

              <Route path="/customers" element={
                <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                  <AppShell><Customers /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/customers/:id" element={
                <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                  <AppShell><CustomerProfile /></AppShell>
                </ProtectedRoute>
              } />

              {/* Legacy routes — redirect to unified Workflow Board with correct tab */}
              <Route path="/gold-test" element={<Navigate to="/workflow?tab=gold" replace />} />
              <Route path="/silver-test" element={<Navigate to="/workflow?tab=silver" replace />} />
              <Route path="/gold-certificates" element={<Navigate to="/workflow?tab=gold_cert" replace />} />
              <Route path="/silver-certificates" element={<Navigate to="/workflow?tab=silver_cert" replace />} />
              <Route path="/photo-certificates" element={<Navigate to="/workflow?tab=photo_cert" replace />} />

              <Route path="/bills" element={
                <ProtectedRoute roles={['admin', 'manager', 'front_desk']}>
                  <AppShell><BillsReportPage /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute roles={['admin', 'manager', 'front_desk']}>
                  <AppShell><ModuleBillsPage /></AppShell>
                </ProtectedRoute>
              } />
              {/* Legacy path — Bills page is now Reports */}
              <Route path="/module-bills" element={<Navigate to="/reports" replace />} />
              <Route path="/items" element={
                <ProtectedRoute roles={['admin', 'manager', 'technician']}>
                  <AppShell><ItemMasterPage /></AppShell>
                </ProtectedRoute>
              } />

              <Route path="/workflow" element={
                <ProtectedRoute roles={['admin', 'manager', 'technician', 'front_desk', 'user']}>
                  <AppShell><WorkflowBoard /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/list-views" element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <AppShell><ListViewsPage /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/weight-loss" element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <AppShell><WeightLoss /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/cash-in-hand" element={
                <ProtectedRoute roles={['admin']}>
                  <AppShell><CashInHand /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute roles={['admin']}>
                  <AppShell><UserManagement /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/record/:type/:id" element={
                <ProtectedRoute>
                  <AppShell><RecordPage /></AppShell>
                </ProtectedRoute>
              } />
              <Route path="/print/:type/:id" element={
                <ProtectedRoute><PrintView /></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <ModalManager />
            <PrintPortal />
            </WorkflowProvider>
            </RecordModalProvider>
          </Router>
        </ModalProvider>
        </PrintProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
