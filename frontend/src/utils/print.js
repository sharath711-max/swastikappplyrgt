'use strict';

// Module-level throttle — survives re-renders, one slot per tab
let _lastPrintTs = 0;

/**
 * Open a print URL in a new tab with:
 *   - 500ms throttle (prevents duplicate tabs on rapid clicks)
 *   - noopener,noreferrer (no opener reference leakage)
 *   - optional toast notification
 *
 * @param {string}   url
 * @param {Function} [addToast]
 */
export function safeOpen(url, addToast) {
    const now = Date.now();
    if (now - _lastPrintTs < 500) return;
    _lastPrintTs = now;
    if (addToast) addToast('Opening print…', 'info');
    window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Derive the frontend print-route segment from a workflow/modal record.
 * Checks test.type first (authoritative), falls back to ID prefix (defensive).
 *
 * Supported type values (from workflowService UNION ALL):
 *   'gold', 'silver', 'gold_cert', 'silver_cert', 'photo_cert'
 *
 * @param {{ type?: string, id?: string }|null} test
 * @returns {string|null}  e.g. 'gold-certificate', 'silver-test', or null
 */
export function resolvePrintRoute(test) {
    if (!test) return null;

    switch (test.type) {
        // Workflow board values
        case 'gold':        return 'gold-test';
        case 'silver':      return 'silver-test';
        case 'gold_cert':   return 'gold-certificate';
        case 'silver_cert': return 'silver-certificate';
        case 'photo_cert':  return 'photo-certificate';
        // Normalised enum variants (future-proof)
        case 'GOLD_TEST':          return 'gold-test';
        case 'SILVER_TEST':        return 'silver-test';
        case 'GOLD_CERTIFICATE':   return 'gold-certificate';
        case 'SILVER_CERTIFICATE': return 'silver-certificate';
        case 'PHOTO_CERTIFICATE':  return 'photo-certificate';
        default: {
            // Last-resort: infer from ID prefix written by sequence generator
            const id = String(test.id || '');
            if (id.startsWith('GCR')) return 'gold-certificate';
            if (id.startsWith('SCR')) return 'silver-certificate';
            if (id.startsWith('PCR')) return 'photo-certificate';
            if (id.startsWith('GTS')) return 'gold-test';
            if (id.startsWith('STS')) return 'silver-test';
            return null;
        }
    }
}

export function resolveCertificatePrintRoute(typeOrRecord, record = null) {
    const explicitType = typeof typeOrRecord === 'string' ? typeOrRecord : null;
    const target = record || (typeof typeOrRecord === 'object' ? typeOrRecord : null);
    const type = explicitType || target?.type || target?.certificate_type;

    if (type === 'gold' || type === 'gold_cert' || type === 'GOLD_CERTIFICATE') return 'gold-certificate';
    if (type === 'silver' || type === 'silver_cert' || type === 'SILVER_CERTIFICATE') return 'silver-certificate';
    if (type === 'photo' || type === 'photo_cert' || type === 'PHOTO_CERTIFICATE') return 'photo-certificate';

    return resolvePrintRoute(target);
}

export function buildPrintUrl(route, id, { itemId = null, itemIndex = null, itemLevel = false, layout = null } = {}) {
    const params = new URLSearchParams();
    if (itemId) params.set('itemId', itemId);
    else if (itemIndex !== null && itemIndex !== undefined) params.set('itemIndex', itemIndex);
    if (itemLevel) params.set('itemLevel', 'true');
    if (layout) params.set('layout', layout);

    const query = params.toString();
    return `/print/${route}/${id}${query ? `?${query}` : ''}`;
}

export function isFinalizedForPrint(status) {
    return String(status || '').toUpperCase() === 'DONE';
}
