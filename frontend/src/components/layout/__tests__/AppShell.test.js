import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppShell from '../AppShell';

jest.mock('../Header', () => (props) => (
    <button
        type="button"
        data-testid="mock-header-toggle"
        onClick={() => props.setSidebarCollapsed(!props.sidebarCollapsed)}
    >
        Header Toggle
    </button>
));

jest.mock('../Sidebar', () => (props) => (
    <div data-testid="mock-sidebar">{props.sidebarCollapsed ? 'collapsed' : 'expanded'}</div>
));

describe('AppShell component automation', () => {
    test('renders layout shell and child content', () => {
        render(
            <AppShell>
                <div>Child Page Content</div>
            </AppShell>
        );

        expect(screen.getByTestId('mock-header-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('mock-sidebar')).toHaveTextContent('expanded');
        expect(screen.getByText('Child Page Content')).toBeInTheDocument();
    });

    test('updates shell class when sidebar collapse state changes', () => {
        const { container } = render(
            <AppShell>
                <div>Child Page Content</div>
            </AppShell>
        );

        fireEvent.click(screen.getByTestId('mock-header-toggle'));
        expect(container.querySelector('.app-shell')).toHaveClass('sidebar-collapsed');
        expect(screen.getByTestId('mock-sidebar')).toHaveTextContent('collapsed');
    });
});
