import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// Single source of truth for workflow identity — codes, labels, and ordering.
// Both Sidebar (operational queue rows) and WorkflowBoard (section header
// echo) read from this list. Adding a workflow happens in exactly one place.
const WORKFLOWS = [
    { key: 'gold',        code: 'GT', label: 'Gold Test' },
    { key: 'gold_cert',   code: 'GC', label: 'Gold Certificate' },
    { key: 'silver',      code: 'ST', label: 'Silver Test' },
    { key: 'silver_cert', code: 'SC', label: 'Silver Certificate' },
    { key: 'photo_cert',  code: 'PC', label: 'Photo Certificate' },
];

const WORKFLOW_KEYS = WORKFLOWS.map((w) => w.key);
const WORKFLOW_BY_KEY = Object.fromEntries(WORKFLOWS.map((w) => [w.key, w]));
const DEFAULT_KEY = 'gold';

const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
    const [selectedWorkflow, setSelectedState] = useState(DEFAULT_KEY);
    // `newRequest` state exists ONLY to trigger subscriber re-renders.
    // The authoritative token lives in `pendingRef` so consumption is atomic
    // and immune to React Strict Mode double-invoke / replay races.
    const [newRequest, setNewRequest] = useState(null);
    const pendingRef = useRef(null);
    const consumeWarningRef = useRef({ count: 0, scheduled: false });
    // Which new-* modal is currently open, reported by WorkflowBoard.
    // Used by tryWorkflowSwitch to guard against silent context abandonment.
    const [openModalKey, setOpenModalKeyState] = useState(null);
    const modalCloserRef = useRef(null);

    const setSelectedWorkflow = useCallback((key) => {
        if (WORKFLOW_KEYS.includes(key)) setSelectedState(key);
    }, []);

    const requestNewWorkflow = useCallback((key) => {
        if (!WORKFLOW_KEYS.includes(key)) return;
        const token = { key, nonce: Date.now() + Math.random() };
        pendingRef.current = token;
        setSelectedState(key);
        setNewRequest(token);
    }, []);

    // Atomic: return the pending token AND clear it in one call. Calling
    // again immediately returns null — eliminates split read/clear races.
    const consumeNewRequest = useCallback(() => {
        if (process.env.NODE_ENV !== 'production') {
            const w = consumeWarningRef.current;
            w.count += 1;
            if (!w.scheduled) {
                w.scheduled = true;
                queueMicrotask(() => {
                    if (w.count > 1) {
                        // Multiple subscribers (or a single subscriber wired
                        // to the wrong deps) draining the same token — bug.
                        // eslint-disable-next-line no-console
                        console.warn(
                            `[WorkflowContext] consumeNewRequest() called ${w.count}× in one microtask. ` +
                            'Only one subscriber should drain workflow tokens.'
                        );
                    }
                    w.count = 0;
                    w.scheduled = false;
                });
            }
        }
        const token = pendingRef.current;
        if (!token) return null;
        pendingRef.current = null;
        setNewRequest(null);
        return token;
    }, []);

    const setOpenModalKey = useCallback((key) => {
        setOpenModalKeyState(key && WORKFLOW_KEYS.includes(key) ? key : null);
    }, []);

    const registerModalCloser = useCallback((closer) => {
        modalCloserRef.current = closer;
        return () => {
            if (modalCloserRef.current === closer) modalCloserRef.current = null;
        };
    }, []);

    // Switch-guard. Returns true if the switch may proceed, false if the
    // operator cancelled. Sequence on confirm: close current modal → clear
    // openModalKey → caller mutates selectedWorkflow. Modal teardown
    // happens BEFORE workflow mutation to avoid stale-render flashes.
    const tryWorkflowSwitch = useCallback((nextKey) => {
        if (!openModalKey || openModalKey === nextKey) return true;
        const meta = WORKFLOW_BY_KEY[openModalKey];
        const label = meta ? meta.label : openModalKey;
        // window.confirm is intentional — defensive line, no dirty tracking.
        // eslint-disable-next-line no-alert
        const ok = window.confirm(`Discard new ${label} entry in progress?`);
        if (!ok) return false;
        if (modalCloserRef.current) modalCloserRef.current();
        setOpenModalKeyState(null);
        return true;
    }, [openModalKey]);

    return (
        <WorkflowContext.Provider
            value={{
                selectedWorkflow,
                setSelectedWorkflow,
                requestNewWorkflow,
                newRequest,
                consumeNewRequest,
                openModalKey,
                setOpenModalKey,
                registerModalCloser,
                tryWorkflowSwitch,
            }}
        >
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflow() {
    const ctx = useContext(WorkflowContext);
    if (!ctx) throw new Error('useWorkflow must be used within a WorkflowProvider');
    return ctx;
}

export { WORKFLOWS, WORKFLOW_KEYS, WORKFLOW_BY_KEY };
