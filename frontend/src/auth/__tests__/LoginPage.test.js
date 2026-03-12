import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

const mockLogin = jest.fn();
const mockAddToast = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({ login: mockLogin })
}));

jest.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: mockAddToast })
}));

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

const renderLogin = () => render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LoginPage />
    </MemoryRouter>
);

describe('LoginPage component automation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('shows field validation errors when submit is empty', async () => {
        const { container } = renderLogin();

        fireEvent.click(container.querySelector('button[type="submit"]'));

        expect(await screen.findByText('Username is required')).toBeInTheDocument();
        expect(await screen.findByText('Password is required')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    test('navigates admin/manager users to dashboard on successful login', async () => {
        mockLogin.mockResolvedValueOnce({
            user: { username: 'admin', role: 'admin' }
        });

        const { container } = renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter laboratory ID'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('Enter secure password'), { target: { value: 'admin123' } });
        fireEvent.click(container.querySelector('button[type="submit"]'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123', true);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
        expect(mockAddToast).toHaveBeenCalledWith('Welcome back, admin', 'success');
    });

    test('navigates non-admin roles to workflow on successful login', async () => {
        mockLogin.mockResolvedValueOnce({
            user: { username: 'tech', role: 'technician' }
        });

        const { container } = renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter laboratory ID'), { target: { value: 'tech' } });
        fireEvent.change(screen.getByPlaceholderText('Enter secure password'), { target: { value: 'secret' } });
        fireEvent.click(container.querySelector('button[type="submit"]'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/workflow');
        });
    });

    test('locks account after 5 consecutive failed login attempts', async () => {
        mockLogin.mockRejectedValue({
            response: { data: { error: 'Invalid username or password' } }
        });

        const { container } = renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter laboratory ID'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText('Enter secure password'), { target: { value: 'badpass' } });

        const submitButton = container.querySelector('button[type="submit"]');

        for (let i = 0; i < 5; i += 1) {
            await waitFor(() => {
                expect(submitButton).not.toBeDisabled();
            });
            fireEvent.click(submitButton);
            // Wait for one async attempt to settle before next click.
            // Without this, the button is temporarily disabled while loading.
            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledTimes(i + 1);
            });
        }

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /locked/i })).toBeDisabled();
        });
        expect(mockAddToast).toHaveBeenCalledWith('Account locked. Try again in 30 seconds.', 'error');
    });
});
