import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

console.log("REACT APP EXPERIMENT START");
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);


// PWA Service Worker — unregister stale, then re-register fresh
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // 1. Unregister ALL existing service workers so stale ones can't intercept
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));

            // 2. Register the fresh service worker
            await navigator.serviceWorker.register('/sw.js');
            console.log('[SW] Service Worker registered successfully');
        } catch (err) {
            console.warn('[SW] Service Worker setup failed:', err.message);
        }
    });
}

