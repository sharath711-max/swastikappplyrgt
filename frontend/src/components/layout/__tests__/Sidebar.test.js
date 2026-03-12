import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../Sidebar';
import { renderWithRouter } from '../../../test-utils/renderWithRouter';

let mockAuthState = { user: { role: 'admin' } };

jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthState
}));

describe('Sidebar component automation', () => {
    beforeEach(() => {
        mockAuthState = { user: { role: 'admin' } };
    });

    test('shows all nav items for admin users', () => {
        renderWithRouter(<Sidebar sidebarCollapsed={false} />, { route: '/customers' });

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Customers')).toBeInTheDocument();
        expect(screen.getByText('Workflow Board')).toBeInTheDocument();
        expect(screen.getByText('List Views')).toBeInTheDocument();
    });

    test('shows only role-allowed nav items for technician users', () => {
        mockAuthState = { user: { role: 'technician' } };
        renderWithRouter(<Sidebar sidebarCollapsed={false} />, { route: '/workflow' });

        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.queryByText('Customers')).not.toBeInTheDocument();
        expect(screen.getByText('Workflow Board')).toBeInTheDocument();
        expect(screen.queryByText('List Views')).not.toBeInTheDocument();
    });

    test('hides labels when sidebar is collapsed', () => {
        renderWithRouter(<Sidebar sidebarCollapsed />, { route: '/' });

        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.queryByText('Customers')).not.toBeInTheDocument();
        expect(screen.queryByText('Workflow Board')).not.toBeInTheDocument();
    });

    test('applies active class to current route nav item', () => {
        const { container } = renderWithRouter(<Sidebar sidebarCollapsed={false} />, { route: '/customers' });
        const customerLink = container.querySelector('a[href="/customers"]');
        expect(customerLink).toHaveClass('active');
    });
});
