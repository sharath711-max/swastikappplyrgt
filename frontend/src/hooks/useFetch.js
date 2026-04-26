import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useFetch — stable data-fetching with:
 *   - request versioning: last request wins; stale responses are silently discarded
 *   - unmount guard: no setState after component is gone
 *   - normalised state: error cleared before every fetch, loading tied to the active request
 *   - optional onError callback (held in a ref — callers do NOT need to memoize it)
 *
 * Usage:
 *   const fetchFn = useCallback(() => api.get('/x').then(r => r.data), [dep]);
 *   const { data, loading, error, reload } = useFetch(fetchFn);
 *
 * @param {() => Promise<any>} fetchFn  Must be stable (wrap in useCallback at call site).
 *                                      The hook re-fetches whenever fetchFn changes.
 * @param {{ onError?: (msg: string) => void }} opts
 */
export function useFetch(fetchFn, { onError } = {}) {
    // Sequence counter — incremented on every fetch attempt.
    // Only the response matching the latest seq is applied; older ones are discarded.
    const seqRef = useRef(0);

    // Keep onError fresh without listing it as a dep (avoids infinite-loop risk
    // if the caller passes an inline arrow function). Safe because we only read
    // onErrorRef inside async callbacks, which always run after the render that
    // set it.
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    // Manual reload — call this from event handlers or polling intervals.
    const reload = useCallback(async () => {
        const seq = ++seqRef.current;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            if (seq !== seqRef.current) return;     // stale — discard
            setData(result);
        } catch (err) {
            if (seq !== seqRef.current) return;
            const msg = err?.message || 'Request failed';
            setError(msg);
            onErrorRef.current?.(msg);
        } finally {
            if (seq === seqRef.current) setLoading(false);
        }
    }, [fetchFn]);

    // Auto-fetch on mount and whenever fetchFn changes (e.g., dep like `type` changed).
    useEffect(() => {
        let mounted = true;
        const seq = ++seqRef.current;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const result = await fetchFn();
                if (!mounted || seq !== seqRef.current) return;
                setData(result);
                setLoading(false);
            } catch (err) {
                if (!mounted || seq !== seqRef.current) return;
                const msg = err?.message || 'Request failed';
                setError(msg);
                onErrorRef.current?.(msg);
                setLoading(false);
            }
        })();

        // Unmount: mark dead so no setState runs on this instance
        return () => { mounted = false; };
    }, [fetchFn]);

    return { data, loading, error, reload, setData };
}
