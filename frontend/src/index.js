import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
// Salesforce Lightning Design System — primary visual layer. Loaded AFTER
// Bootstrap so SLDS utility classes win in specificity ties where the two
// libraries overlap (rare, since SLDS is `slds-*` namespaced).
import '@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css';
import './styles/ModalContainer.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// StrictMode double-invokes mount/unmount in DEV only, which trips a known
// React-Bootstrap modal `removeChild` crash on the workflow board. Production
// never double-invokes, so this is dev-only. We disable StrictMode ONLY for the
// e2e dev-server (REACT_APP_E2E) so tests match production behavior; normal
// `npm start` and the production build keep StrictMode fully active.
const appTree = <App />;
root.render(
    process.env.REACT_APP_E2E === 'true'
        ? appTree
        : <React.StrictMode>{appTree}</React.StrictMode>
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

