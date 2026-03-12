import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaGem, FaUser, FaLock, FaFlask, FaSpinner } from 'react-icons/fa';
import './LoginPage.css';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIMEOUT = 30000;

const getLandingPathByRole = (role) => {
    if (role === 'admin' || role === 'manager') return '/';
    if (role === 'technician' || role === 'front_desk' || role === 'user' || role === 'staff') return '/workflow';
    return '/workflow';
};

const LoginPage = () => {
    const { addToast } = useToast();
    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        let interval;
        if (isLockedOut && cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        } else if (isLockedOut && cooldown === 0) {
            setIsLockedOut(false);
            setFailedAttempts(0);
        }
        return () => clearInterval(interval);
    }, [isLockedOut, cooldown]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (isLockedOut) {
            addToast(`Too many attempts. Please wait ${cooldown} seconds.`, 'error');
            return;
        }

        const errors = {};
        if (!username) errors.username = 'Username is required';
        if (!password) errors.password = 'Password is required';

        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            setLoading(true);
            const data = await login(username, password, true);
            addToast(`Welcome back, ${data.user.username}`, 'success');
            navigate(getLandingPathByRole(data.user.role));
        } catch (err) {
            const currentFails = failedAttempts + 1;
            setFailedAttempts(currentFails);

            if (currentFails >= MAX_FAILED_ATTEMPTS) {
                setIsLockedOut(true);
                setCooldown(LOCKOUT_TIMEOUT / 1000);
                addToast(`Account locked. Try again in 30 seconds.`, 'error');
            } else {
                addToast(err.response?.data?.error || 'Authentication failed. Invalid username or password.', 'error');
                setFieldErrors({ login: 'Invalid credentials. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-auth-container">
            <div className="login-card">
                <div className="login-header text-center">
                    <FaGem size={64} className="lab-icon-glow" />
                    <h2>SWASTIK LAB</h2>
                    <p>SwastikCore v2.0 Enterprise</p>
                </div>

                <form onSubmit={handleLogin} noValidate>
                    {fieldErrors.login && (
                        <div className="slds-notify slds-notify_alert slds-theme_error mb-4" style={{ borderRadius: '12px' }}>
                            {fieldErrors.login}
                        </div>
                    )}

                    <div className="form-group mb-4">
                        <label className="form-label">USERNAME</label>
                        <div className="input-group-custom">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                className={`form-input ${fieldErrors.username ? 'is-invalid' : ''}`}
                                placeholder="Enter laboratory ID"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLockedOut || loading}
                            />
                            {fieldErrors.username && <span className="error-hint">{fieldErrors.username}</span>}
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">PASSWORD</label>
                        <div className="input-group-custom">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                className={`form-input ${fieldErrors.password ? 'is-invalid' : ''}`}
                                placeholder="Enter secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLockedOut || loading}
                            />
                            {fieldErrors.password && <span className="error-hint">{fieldErrors.password}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={isLockedOut || loading}
                    >
                        {loading ? (
                            <FaSpinner className="animate-spin" />
                        ) : isLockedOut ? (
                            `LOCKED (${cooldown}s)`
                        ) : (
                            <><FaFlask /> ACCESS SYSTEM</>
                        )}
                    </button>

                    {failedAttempts > 0 && !isLockedOut && (
                        <div className="text-center mt-3">
                            <span className="failed-attempt-badge">
                                Attempts: {failedAttempts} / {MAX_FAILED_ATTEMPTS}
                            </span>
                        </div>
                    )}
                </form>

                <div className="login-footer">
                    <span>© 2026 Swastik Lab & Testing Center</span>
                    <span style={{ fontSize: '10px', opacity: 0.6 }}>PRIVATE LABORATORY ACCESS ONLY</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

