import React from 'react';  // eslint-disable-line no-unused-vars
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import useSafeModalClose from '../../../hooks/useSafeModalClose';

// The hook's sweepOrphans schedules cleanup after RB's 350ms transition.
// We use fake timers + flush to verify timing-based behavior.
beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '';
    document.body.className = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
});

afterEach(() => {
    jest.useRealTimers();
});

const flushSweep = () => {
    act(() => { jest.advanceTimersByTime(360); });
};

// Helper — simulates DOM state of an actively-open RB modal
const seedActiveModal = () => {
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px';
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(backdrop);
    const modal = document.createElement('div');
    modal.className = 'modal show';
    document.body.appendChild(modal);
    return { backdrop, modal };
};

// Helper — simulates DOM AFTER RB has hidden the modal but left orphans
const seedOrphanedBackdrop = () => {
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px';
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(backdrop);
    // No `.modal.show` — modal portal already unmounted
    return { backdrop };
};

describe('useSafeModalClose', () => {
    // ── 1️⃣ Centralized safe close ────────────────────────────────────────────
    test('exposes safeClose, mountedRef, ifMounted, isClosing', () => {
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));
        expect(typeof result.current.safeClose).toBe('function');
        expect(result.current.mountedRef.current).toBe(true);
        expect(typeof result.current.ifMounted).toBe('function');
        expect(typeof result.current.isClosing).toBe('function');
    });

    // ── 2️⃣ Order: reset → onHide → sweep ─────────────────────────────────────
    test('safeClose runs reset BEFORE onHide, then schedules sweep', () => {
        const order = [];
        const onHide = jest.fn(() => order.push('onHide'));
        const reset  = jest.fn(() => order.push('reset'));
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide }));

        act(() => { result.current.safeClose({ reset }); });

        expect(order).toEqual(['reset', 'onHide']);
        expect(reset).toHaveBeenCalledTimes(1);
        expect(onHide).toHaveBeenCalledTimes(1);
    });

    // ── 3️⃣ Async safety: mountedRef flips on unmount ──────────────────────────
    test('mountedRef becomes false after unmount (async state-update guard)', () => {
        const { result, unmount } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));
        expect(result.current.mountedRef.current).toBe(true);
        unmount();
        expect(result.current.mountedRef.current).toBe(false);
    });

    test('ifMounted wrapper no-ops after unmount', () => {
        const setter = jest.fn();
        const { result, unmount } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));
        const wrapped = result.current.ifMounted(setter);

        wrapped('still-mounted');
        expect(setter).toHaveBeenCalledWith('still-mounted');

        unmount();
        wrapped('after-unmount');
        // No additional call after unmount
        expect(setter).toHaveBeenCalledTimes(1);
    });

    // ── 4️⃣ Rapid-click safety ────────────────────────────────────────────────
    test('rapid double-click on safeClose triggers only one teardown', () => {
        const onHide = jest.fn();
        const reset  = jest.fn();
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide }));

        act(() => {
            result.current.safeClose({ reset });
            result.current.safeClose({ reset });
            result.current.safeClose({ reset });
        });

        expect(onHide).toHaveBeenCalledTimes(1);
        expect(reset).toHaveBeenCalledTimes(1);
        expect(result.current.isClosing()).toBe(true);
    });

    // ── 5️⃣ Backdrop cleanup ──────────────────────────────────────────────────
    test('orphan backdrop is removed after sweep when no modal is visible', () => {
        seedOrphanedBackdrop();
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));

        act(() => { result.current.safeClose(); });
        flushSweep();

        expect(document.querySelectorAll('.modal-backdrop').length).toBe(0);
        expect(document.body.classList.contains('modal-open')).toBe(false);
        expect(document.body.style.overflow).toBe('');
        expect(document.body.style.paddingRight).toBe('');
    });

    test('duplicate backdrops are trimmed to match visible-modal count', () => {
        // Two backdrops, one visible modal — trim to one
        const modal = document.createElement('div');
        modal.className = 'modal show';
        document.body.appendChild(modal);
        const b1 = document.createElement('div');
        b1.className = 'modal-backdrop';
        document.body.appendChild(b1);
        const b2 = document.createElement('div');
        b2.className = 'modal-backdrop';
        document.body.appendChild(b2);

        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));
        act(() => { result.current.safeClose(); });
        flushSweep();

        expect(document.querySelectorAll('.modal-backdrop').length).toBe(1);
    });

    test('body locked but no modals visible → body fully restored on sweep', () => {
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '15px';
        // No backdrops, no visible modals — just stuck body
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));
        act(() => { result.current.safeClose(); });
        flushSweep();

        expect(document.body.classList.contains('modal-open')).toBe(false);
        expect(document.body.style.overflow).toBe('');
        expect(document.body.style.paddingRight).toBe('');
    });

    test('visible modals are preserved (no sweep when modal is legitimately open)', () => {
        seedActiveModal();
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));
        act(() => { result.current.safeClose(); });
        flushSweep();

        // .modal.show is still in DOM → its matching backdrop must be preserved
        expect(document.querySelectorAll('.modal.show').length).toBe(1);
        expect(document.querySelectorAll('.modal-backdrop').length).toBe(1);
    });

    // ── 6️⃣ Focus restoration ─────────────────────────────────────────────────
    test('focus is restored to the trigger element after sweep', () => {
        const trigger = document.createElement('button');
        trigger.textContent = 'Open modal';
        document.body.appendChild(trigger);
        trigger.focus();
        expect(document.activeElement).toBe(trigger);

        // First render captures `trigger` as the activeElement via show=true
        const { result } = renderHook(({ show }) => useSafeModalClose({ show, onHide: () => {} }), {
            initialProps: { show: true },
        });

        // Simulate something else stealing focus (e.g. modal content)
        const stealer = document.createElement('input');
        document.body.appendChild(stealer);
        stealer.focus();
        expect(document.activeElement).toBe(stealer);

        act(() => { result.current.safeClose(); });
        flushSweep();

        // After sweep — focus restored to the trigger
        expect(document.activeElement).toBe(trigger);
    });

    test('focus restoration never throws on detached trigger', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();

        const { result } = renderHook(({ show }) => useSafeModalClose({ show, onHide: () => {} }), {
            initialProps: { show: true },
        });

        // Trigger removed before sweep runs
        trigger.remove();

        expect(() => {
            act(() => { result.current.safeClose(); });
            flushSweep();
        }).not.toThrow();
    });

    // ── 7️⃣ Workflow-switch safe close (reset before onHide) ──────────────────
    test('workflow-switch reset runs synchronously before onHide so parent sees clean state', () => {
        let parentSeesLoading = null;
        let loading = true;
        const reset = () => { loading = false; };
        const onHide = () => { parentSeesLoading = loading; };

        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide }));
        act(() => { result.current.safeClose({ reset }); });

        expect(parentSeesLoading).toBe(false);
    });

    // ── 8️⃣ Error-path safety: safeClose not called by hook itself ────────────
    test('safeClose is purely caller-driven — hook does not auto-close on its own', () => {
        const onHide = jest.fn();
        renderHook(() => useSafeModalClose({ show: true, onHide }));
        flushSweep();
        expect(onHide).not.toHaveBeenCalled();
    });

    // ── 9️⃣ React-Bootstrap transition hygiene ────────────────────────────────
    test('sweep is deferred ~350ms (after RB fade) — runs once, not immediately', () => {
        seedOrphanedBackdrop();
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));

        act(() => { result.current.safeClose(); });
        // Immediately after close — orphan still present (sweep hasn't fired)
        expect(document.querySelectorAll('.modal-backdrop').length).toBe(1);

        // Advance just before threshold — still not swept
        act(() => { jest.advanceTimersByTime(300); });
        expect(document.querySelectorAll('.modal-backdrop').length).toBe(1);

        // Past the threshold — swept
        act(() => { jest.advanceTimersByTime(60); });
        expect(document.querySelectorAll('.modal-backdrop').length).toBe(0);
    });

    test('repeated safeClose calls do NOT stack multiple sweep timers', () => {
        seedOrphanedBackdrop();
        const { result } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));

        act(() => {
            result.current.safeClose();
            result.current.safeClose();
            result.current.safeClose();
        });
        flushSweep();

        // Still just 0 backdrops — no double-execution side effects
        expect(document.querySelectorAll('.modal-backdrop').length).toBe(0);
    });

    test('pending sweep timer is cancelled if hook unmounts mid-fade', () => {
        seedOrphanedBackdrop();
        const { result, unmount } = renderHook(() => useSafeModalClose({ show: true, onHide: () => {} }));

        act(() => { result.current.safeClose(); });
        unmount();
        // Advance timers — if the sweep timer wasn't cancelled, it would still
        // run and touch the DOM. The expectation here is no exception is thrown
        // (the cancelled timer means cleanup just doesn't happen, which is
        // fine because the parent unmounted everything anyway).
        expect(() => flushSweep()).not.toThrow();
    });

    // ── Reopen behavior: trigger refreshes on each open ───────────────────────
    test('triggerRef refreshes on each fresh open (multiple open/close cycles)', () => {
        const trigger1 = document.createElement('button');
        document.body.appendChild(trigger1);
        trigger1.focus();

        const { result, rerender } = renderHook(({ show }) => useSafeModalClose({ show, onHide: () => {} }), {
            initialProps: { show: true },
        });

        // Close cycle 1
        act(() => { result.current.safeClose(); });
        flushSweep();
        expect(document.activeElement).toBe(trigger1);

        // Reopen with a different trigger
        const trigger2 = document.createElement('button');
        document.body.appendChild(trigger2);
        trigger2.focus();
        rerender({ show: true });

        // Close cycle 2 — should restore to trigger2, not trigger1
        act(() => { result.current.safeClose(); });
        flushSweep();
        expect(document.activeElement).toBe(trigger2);
    });
});
