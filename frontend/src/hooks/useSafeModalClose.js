import { useCallback, useEffect, useRef } from 'react';
import { register as registerLifecycle } from '../services/modalLifecycle';

/**
 * useSafeModalClose — centralized modal-close orchestration.
 *
 * Single chokepoint for closing a modal so the UI never gets stuck in a
 * partially-blocked state. Every successful (or failed) modal action that
 * wants to close the dialog should route through `safeClose()` rather than
 * calling the parent's `onHide` directly.
 *
 * Spec coverage (Modal Stability + Auto-Close Prompt):
 *   1. safeCloseModal()             — single shared close path
 *   2. close → reset → onHide → sweep backdrop → restore focus, in order
 *   3. mountedRef                   — async safety (post-unmount setState)
 *   4. closingRef                   — atomic rapid-click guard
 *   5. backdrop sweep + body.modal-open + overflow + padding-right restore
 *   6. focus restoration to the element that triggered the modal
 *   7. workflow-switch safe close   — reset runs BEFORE onHide
 *   8. error-path safe              — caller decides when to call safeClose
 *   9. RB transition hygiene        — sweep runs AFTER React-Bootstrap's fade
 *
 * Usage:
 *
 *     const { safeClose, mountedRef, ifMounted } = useSafeModalClose({
 *         show, onHide,
 *     });
 *
 *     const resetForm = () => { setLoading(false); setErrors({}); };
 *
 *     // close from inside any handler (success, cancel, X, Escape):
 *     safeClose({ reset: resetForm });
 *
 *     // wrap async state updates so they no-op after unmount:
 *     const setItemsSafe = ifMounted(setItems);
 *
 *     // or guard inline:
 *     const res = await api.post('/x');
 *     if (!mountedRef.current) return;
 *     setItems(res.data);
 */

// React-Bootstrap's default fade is 300ms. We sweep a tick after that so the
// portal has fully unmounted (and RB's own teardown has run).
const RB_TRANSITION_MS = 350;

export default function useSafeModalClose({ show, onHide, lifecycleKey = null }) {
    const mountedRef   = useRef(true);
    const closingRef   = useRef(false);
    const triggerRef   = useRef(null);
    const cleanupTimer = useRef(null);
    const lifecycleHandleRef = useRef(null);

    // Keep the latest onHide in a ref so the singleton's escape callback
    // — captured once at register time — always invokes the current handler
    // even if the consumer re-creates onHide every render.
    const onHideRef = useRef(onHide);
    onHideRef.current = onHide;

    // Lifecycle: track mount status; cancel pending sweep on unmount.
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (cleanupTimer.current) {
                clearTimeout(cleanupTimer.current);
                cleanupTimer.current = null;
            }
            // Cleanup of modal backdrops and body locks on unmount. When a modal
            // unmounts abruptly (e.g. parent re-renders onSuccess), the transition
            // timer is cancelled, so we sweep orphans here to prevent stuck
            // backdrops / UI freezes.
            if (typeof document !== 'undefined') {
                // Body unlock is safe synchronously — it touches no React-owned
                // nodes. Do it immediately so scroll lock never lingers.
                if (document.querySelectorAll('.modal.show').length === 0) {
                    document.body.classList.remove('modal-open');
                    document.body.style.removeProperty('overflow');
                    document.body.style.removeProperty('padding-right');
                }
                // Backdrop NODE removal is deferred to a macrotask so React's own
                // portal/backdrop teardown — running in THIS same commit — removes
                // its nodes first. Removing a backdrop React still owns mid-commit
                // throws "removeChild: node is not a child of this node". A
                // standalone timeout fires regardless of this component unmounting.
                setTimeout(() => {
                    if (typeof document === 'undefined') return;
                    if (document.querySelectorAll('.modal.show').length > 0) return;
                    document.querySelectorAll('.modal-backdrop').forEach(b => { try { b.remove(); } catch (_e) {} });
                    document.body.classList.remove('modal-open');
                    document.body.style.removeProperty('overflow');
                    document.body.style.removeProperty('padding-right');
                }, 0);
            }
            // Belt-and-braces: if the consumer unmounted without ever
            // toggling show=false, release our stack entry here too.
            if (lifecycleHandleRef.current) {
                lifecycleHandleRef.current.release();
                lifecycleHandleRef.current = null;
            }
        };
    }, []);

    // Refresh trigger + reset closing flag on every fresh open.
    // Also register / release the lifecycle entry so the modal participates
    // in cross-modal arbitration (escape routing, body lock ownership,
    // duplicate suppression). React-Bootstrap still does its own focus trap
    // and fade; the singleton coordinates only the inter-modal concerns.
    useEffect(() => {
        if (show) {
            triggerRef.current = (typeof document !== 'undefined') ? document.activeElement : null;
            closingRef.current = false;
            // Only register once per show=true edge. The singleton's dedup
            // (when lifecycleKey is set) protects against double-open races.
            if (!lifecycleHandleRef.current) {
                lifecycleHandleRef.current = registerLifecycle({
                    key: lifecycleKey,
                    triggerEl: triggerRef.current,
                    // Escape on RB modals is normally handled by RB itself, but
                    // when multiple RB modals are open RB doesn't know stacking
                    // order. The singleton routes Escape to the topmost entry
                    // so only one modal closes per press.
                    onEscape: () => {
                        const fn = onHideRef.current;
                        if (typeof fn === 'function') {
                            try { fn(); } catch (_e) {}
                        }
                    },
                });
            }
        } else if (lifecycleHandleRef.current) {
            lifecycleHandleRef.current.release();
            lifecycleHandleRef.current = null;
        }
        // We intentionally exclude onHide from the dep list — the handler
        // identity changes on every render in many consumers and would
        // cause register/release churn. The ref captures the latest call
        // path indirectly via closingRef + onHide on safeClose.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, lifecycleKey]);

    // Orphan sweep — runs AFTER React-Bootstrap's own fade-out completes.
    // Targets only the cases where RB itself failed to clean up: orphan
    // backdrops with no visible modal, accumulated duplicate backdrops, and
    // body classes/styles that weren't restored.
    const sweepOrphans = useCallback(() => {
        if (typeof document === 'undefined') return;
        if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
        cleanupTimer.current = setTimeout(() => {
            cleanupTimer.current = null;

            const backdrops     = document.querySelectorAll('.modal-backdrop');
            const visibleModals = document.querySelectorAll('.modal.show');

            // Case A: orphan backdrops (no visible modal) — nuke all + restore body
            if (visibleModals.length === 0 && backdrops.length > 0) {
                backdrops.forEach(b => { try { b.remove(); } catch (_e) {} });
                document.body.classList.remove('modal-open');
                // `removeProperty` is more reliable than `= ''` across browsers + jsdom.
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('padding-right');
            }
            // Case B: too many backdrops for visible modals — trim oldest first
            else if (backdrops.length > visibleModals.length) {
                const excess = backdrops.length - visibleModals.length;
                for (let i = 0; i < excess; i++) {
                    try { backdrops[i].remove(); } catch (_e) {}
                }
            }
            // Case C: no modals shown but body still locked
            else if (visibleModals.length === 0) {
                if (document.body.classList.contains('modal-open')) {
                    document.body.classList.remove('modal-open');
                }
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('padding-right');
            }

            // Focus restoration — best-effort, never throw.
            const trigger = triggerRef.current;
            if (trigger && typeof trigger.focus === 'function' && document.contains(trigger)) {
                try { trigger.focus({ preventScroll: true }); } catch (_e) {}
            }
        }, RB_TRANSITION_MS);
    }, []);

    // safeClose — the single close chokepoint.
    //
    // Order is intentional:
    //   1. closingRef set (atomic guard against re-entry)
    //   2. reset() — caller's transient-state cleanup runs FIRST so loading
    //                / error flags are gone before the parent re-renders
    //   3. onHide() — parent flips show=false, RB starts fade-out
    //   4. sweepOrphans() — schedules post-transition DOM cleanup + focus
    const safeClose = useCallback((opts) => {
        if (closingRef.current) return;          // rapid-click safety
        closingRef.current = true;

        const reset = opts && opts.reset;
        if (typeof reset === 'function') {
            try { reset(); } catch (_e) { /* never throw from close path */ }
        }
        if (typeof onHide === 'function') {
            try { onHide(); } catch (_e) {}
        }
        sweepOrphans();
    }, [onHide, sweepOrphans]);

    // ifMounted(fn) — wraps a callback so it no-ops after unmount. Handy for
    // setState calls that resolve after an awaited API but before the user
    // closed the modal.
    const ifMounted = useCallback((fn) => (...args) => {
        if (!mountedRef.current) return;
        return fn(...args);
    }, []);

    return {
        safeClose,
        mountedRef,
        ifMounted,
        isClosing: () => closingRef.current,
    };
}
