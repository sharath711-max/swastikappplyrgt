import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './auth/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import ModalManager from './components/core/ModalManager';
import AppShell from './components/layout/AppShell';

import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import CertificatePage from './pages/CertificatePage';
import WorkflowBoard from './pages/WorkflowBoard';
import ListViewsPage from './pages/ListViewsPage';
import PrintView from './pages/PrintView';
import TestPage from './pages/TestPage';
import WeightLoss from './pages/WeightLoss';
import CashInHand from './pages/CashInHand';
import UserManagement from './pages/UserManagement';
import RecordPage from './pages/RecordPage';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import './index.css';
import './styles/GlobalStyles.css';
import './styles/theme.css';

import Dashboard from './pages/Dashboard';
import Verify from './pages/public/Verify';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <ModalProvider>
                    <ToastContainer />
                    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/verify/:autoNumber" element={<Verify />} />

                            {/* Protected Routes wrapped in AppShell */}
                            <Route path="/" element={
                                <ProtectedRoute roles={['admin', 'manager', 'technician', 'front_desk']}>
                                    <AppShell>
                                        <Dashboard />
                                    </AppShell>
                                </ProtectedRoute>
                            } />

                            <Route path="/customers" element={
                                <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                                    <AppShell>
                                        <Customers />
                                    </AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/customers/:id" element={
                                <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                                    <AppShell>
                                        <CustomerProfile />
                                    </AppShell>
                                </ProtectedRoute>
                            } />

                            <Route path="/gold-certificates" element={
                                <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                                    <AppShell><CertificatePage type="gold" /></AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/silver-certificates" element={
                                <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                                    <AppShell><CertificatePage type="silver" /></AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/photo-certificates" element={
                                <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                                    <AppShell><CertificatePage type="photo" /></AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/list-views" element={
                                <ProtectedRoute roles={['admin', 'manager']}>
                                    <AppShell>
                                        <ListViewsPage />
                                    </AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/workflow" element={
                                <ProtectedRoute roles={['admin', 'manager', 'technician', 'front_desk', 'user']}>
                                    <AppShell>
                                        <WorkflowBoard />
                                    </AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/gold-test" element={
                                <ProtectedRoute roles={['admin', 'manager', 'technician', 'front_desk', 'user']}>
                                    <AppShell>
                                        <TestPage title="Gold Tests" endpoint="gold-tests" print="gold-certificate" modalType="gold" />
                                    </AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/silver-test" element={
                                <ProtectedRoute roles={['admin', 'manager', 'technician', 'front_desk', 'user']}>
                                    <AppShell>
                                        <TestPage title="Silver Tests" endpoint="silver-tests" print="silver-certificate" modalType="silver" />
                                    </AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/weight-loss" element={
                                <ProtectedRoute roles={['admin', 'manager']}>
                                    <AppShell>
                                        <WeightLoss />
                                    </AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/cash-in-hand" element={
                                <ProtectedRoute roles={['admin']}>
                                    <AppShell>
                                        <CashInHand />
                                    </AppShell>
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/users" element={
                                <ProtectedRoute roles={['admin']}>
                                    <AppShell>
                                        <UserManagement />
                                    </AppShell>
                                </ProtectedRoute>
                            } />

                            <Route path="/record/:type/:id" element={
                                <ProtectedRoute>
                                    <AppShell>
                                        <RecordPage />
                                    </AppShell>
                                </ProtectedRoute>
                            } />

                            {/* Print View (No AppShell) */}
                            <Route path="/print/:type/:id" element={
                                <ProtectedRoute>
                                    <PrintView />
                                </ProtectedRoute>
                            } />

                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                        <ModalManager />
                    </Router>
                </ModalProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
