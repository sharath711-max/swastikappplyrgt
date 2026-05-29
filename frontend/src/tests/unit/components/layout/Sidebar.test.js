import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../../../../components/layout/Sidebar';
import { WorkflowProvider } from '../../../../contexts/WorkflowContext';
import { renderWithRouter } from '../../../../test-utils/renderWithRouter';

let mockAuthState = { user: { role: 'admin' } };

jest.mock('../../../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthState
}));

const renderSidebar = (props = {}, options = {}) =>
    renderWithRouter(
        <WorkflowProvider>
            <Sidebar sidebarCollapsed={false} {...props} />
        </WorkflowProvider>,
        options,
    );

describe('Sidebar component automation', () => {
    beforeEach(() => {
        mockAuthState = { user: { role: 'admin' } };
    });

    test('shows flat nav items and all workflow rows for admin users', () => {
        renderSidebar({}, { route: '/customers' });

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Customers')).toBeInTheDocument();
        expect(screen.getByText('Bills')).toBeInTheDocument();
        expect(screen.getByText('Reports')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();

        // Workflow rows — primary operational navigation
        expect(screen.getByText('Gold Test')).toBeInTheDocument();
        expect(screen.getByText('Gold Certificate')).toBeInTheDocument();
        expect(screen.getByText('Silver Test')).toBeInTheDocument();
        expect(screen.getByText('Silver Certificate')).toBeInTheDocument();
        expect(screen.getByText('Photo Certificate')).toBeInTheDocument();

        // Each workflow row exposes a "New <Label>" action
        expect(screen.getByLabelText('New Gold Test')).toBeInTheDocument();
        expect(screen.getByLabelText('New Photo Certificate')).toBeInTheDocument();
    });

    test('shows only role-allowed items for technician users', () => {
        mockAuthState = { user: { role: 'technician' } };
        renderSidebar({}, { route: '/workflow' });

        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.queryByText('Customers')).not.toBeInTheDocument();
        expect(screen.queryByText('Bills')).not.toBeInTheDocument();
        expect(screen.queryByText('Reports')).not.toBeInTheDocument();
        expect(screen.queryByText('Admin')).not.toBeInTheDocument();

        // Technicians keep access to workflow queues
        expect(screen.getByText('Gold Test')).toBeInTheDocument();
        expect(screen.getByText('Silver Test')).toBeInTheDocument();
    });

    test('hides labels and + buttons when sidebar is collapsed', () => {
        renderWithRouter(
            <WorkflowProvider>
                <Sidebar sidebarCollapsed />
            </WorkflowProvider>,
            { route: '/' },
        );

        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.queryByText('Customers')).not.toBeInTheDocument();
        expect(screen.queryByText('Gold Test')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('New Gold Test')).not.toBeInTheDocument();
    });

    test('applies active class to current route nav item', () => {
        const { container } = renderSidebar({}, { route: '/customers' });
        const customerLink = container.querySelector('a[href="/customers"]');
        expect(customerLink).toHaveClass('active');
    });
});
