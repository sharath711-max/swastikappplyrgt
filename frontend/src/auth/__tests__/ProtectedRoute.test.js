import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

let mockAuthState = { user: null, loading: false };

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthState
}));

const renderRoute = ({ route = '/secure', roles = ['admin'] } = {}) => {
    return render(
        <MemoryRouter
            initialEntries={[route]}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
            <Routes>
                <Route path="/login" element={<div>Login Page</div>} />
                <Route path="/" element={<div>Home Page</div>} />
                <Route path="/workflow" element={<div>Workflow Page</div>} />
                <Route
                    path="/secure"
                    element={(
                        <ProtectedRoute roles={roles}>
                            <div>Secure Content</div>
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/workflow-guarded"
                    element={(
                        <ProtectedRoute roles={roles}>
                            <div>Workflow Guarded Content</div>
                        </ProtectedRoute>
                    )}
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('ProtectedRoute component automation', () => {
    beforeEach(() => {
        mockAuthState = { user: null, loading: false };
    });

    test('renders loading skeleton while auth state is loading', () => {
        mockAuthState = { user: null, loading: true };
        renderRoute();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('redirects unauthenticated users to login page', () => {
        renderRoute();

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('renders protected content for authorized role', () => {
        mockAuthState = { user: { role: 'admin' }, loading: false };
        renderRoute({ roles: ['admin', 'manager'] });

        expect(screen.getByText('Secure Content')).toBeInTheDocument();
    });

    test('redirects unauthorized non-admin users to workflow', () => {
        mockAuthState = { user: { role: 'technician' }, loading: false };
        renderRoute({ route: '/secure', roles: ['admin'] });

        expect(screen.getByText('Workflow Page')).toBeInTheDocument();
    });

    test('redirects admin users without required role to dashboard fallback', () => {
        mockAuthState = { user: { role: 'admin' }, loading: false };
        renderRoute({ route: '/secure', roles: ['manager'] });

        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
});
