import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

/**
 * Fetches the customer list when the modal opens and filters it as the user
 * types. Covers the repeated fetch + filter pattern in NewGoldTestModal and
 * NewSilverTestModal.
 *
 * @param {object} opts
 * @param {boolean}  opts.show        - modal open flag; triggers fetch when it becomes true
 * @param {string}   opts.searchTerm  - current typeahead input
 * @param {function} opts.addToast    - toast callback for fetch errors
 * @param {number}   [opts.limit=6]   - max suggestions returned
 *
 * @returns {{ customers: Array, filteredCustomers: Array, reload: function }}
 */
export function useCustomerSearch({ show, searchTerm, addToast, limit = 6 }) {
    const [customers, setCustomers] = useState([]);

    const reload = useCallback(async () => {
        try {
            const res  = await api.get('/customers');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setCustomers(data);
        } catch {
            addToast('Unable to load customers', 'error');
        }
    }, [addToast]);

    useEffect(() => {
        if (show) reload();
    }, [show, reload]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return customers
            .filter(c => c.name?.toLowerCase().includes(term) || c.phone?.includes(term))
            .slice(0, limit);
    }, [searchTerm, customers, limit]);

    return { customers, filteredCustomers, reload };
}
