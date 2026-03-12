import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                try {
                    // Temporarily set header manually if api interceptor relies on one specific storage
                    // Ideally API interceptor should check both or we handle it here.
                    // Assuming api interceptor reads from localStorage, we might need to sync or update interceptor.
                    // For now, let's assume api interceptor logic needs update or we ensure consistency.
                    // Actually, best to just read where it is.
                    const res = await api.get('/auth/profile');
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password, remember = true) => {
        const res = await api.post('/auth/login', { username, password });
        const token = res.data.token;

        if (remember) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }

        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
