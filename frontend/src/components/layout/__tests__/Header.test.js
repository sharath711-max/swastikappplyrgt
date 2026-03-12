import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

const mockLogout = jest.fn();
const mockNavigate = jest.fn();
let mockUser = { username: 'admin', role: 'admin' };

jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({ user: mockUser, logout: mockLogout })
}));

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

jest.mock('../ChangePasswordModal', () => (props) => (
    props.show ? <div>Change Password Modal</div> : null
));

describe('Header component automation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUser = { username: 'admin', role: 'admin' };
    });

    test('renders brand and logged-in username', () => {
        render(<Header sidebarCollapsed={false} setSidebarCollapsed={jest.fn()} />);

        expect(screen.getByText('Swastik Gold & Silver Lab')).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
    });

    test('toggles sidebar using sidebar button', () => {
        const setSidebarCollapsed = jest.fn();
        const { container } = render(<Header sidebarCollapsed={false} setSidebarCollapsed={setSidebarCollapsed} />);

        fireEvent.click(container.querySelector('.sidebar-toggle'));
        expect(setSidebarCollapsed).toHaveBeenCalledWith(true);
    });

    test('shows admin actions and navigates to user management', () => {
        render(<Header sidebarCollapsed={false} setSidebarCollapsed={jest.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: /admin/i }));
        fireEvent.click(screen.getByRole('button', { name: /user management/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });

    test('opens password modal and supports logout', () => {
        render(<Header sidebarCollapsed={false} setSidebarCollapsed={jest.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: /admin/i }));
        fireEvent.click(screen.getByRole('button', { name: /change password/i }));
        expect(screen.getByText('Change Password Modal')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /admin/i }));
        fireEvent.click(screen.getByRole('button', { name: /logout/i }));
        expect(mockLogout).toHaveBeenCalled();
    });

    test('hides admin-only menu for non-admin users', () => {
        mockUser = { username: 'tech', role: 'technician' };
        render(<Header sidebarCollapsed={false} setSidebarCollapsed={jest.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: /tech/i }));
        expect(screen.queryByRole('button', { name: /user management/i })).not.toBeInTheDocument();
    });
});
