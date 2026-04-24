import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    // Only add a correlation ID if the caller hasn't supplied a stable one.
    // Callers that need idempotency must provide their own X-Request-Id via request config.
    if (!config.headers['X-Request-Id']) {
        config.headers['X-Request-Id'] = window.crypto?.randomUUID?.() || Date.now().toString();
    }
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!['get', 'head', 'options', 'trace'].includes(config.method?.toLowerCase())) {
        const match = document.cookie.match(/(?:^|; )csrf_access_token=([^;]*)/);
        if (match) config.headers['X-CSRF-TOKEN'] = match[1];
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/login';
        }
        const data = error.response?.data;
        return Promise.reject({
            message: data?.error || 'System error occurred',
            type: data?.type || (error.response?.status >= 500 ? 'SYSTEM' : 'BUSINESS'),
            idempotent: !!data?.idempotent,
            status: error.response?.status
        });
    }
);

export default api;
