import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './auth/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';

import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Certificates from './pages/Certificates';
import WorkflowBoard from './pages/WorkflowBoard';
import ListViewsPage from './pages/ListViewsPage';
import PrintView from './pages/PrintView';
import GoldTest from './pages/GoldTest';
import SilverTest from './pages/SilverTest';
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
                <ToastContainer />
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/verify/:autoNumber" element={<Verify />} />

                        {/* Protected Routes wrapped in AppShell */}
                        <Route path="/" element={
                            <ProtectedRoute roles={['admin', 'manager']}>
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

                        <Route path="/certificates" element={
                            <ProtectedRoute roles={['admin', 'manager', 'front_desk', 'user']}>
                                <AppShell>
                                    <Certificates />
                                </AppShell>
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
                                    <GoldTest />
                                </AppShell>
                            </ProtectedRoute>
                        } />
                        <Route path="/silver-test" element={
                            <ProtectedRoute roles={['admin', 'manager', 'technician', 'front_desk', 'user']}>
                                <AppShell>
                                    <SilverTest />
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
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
