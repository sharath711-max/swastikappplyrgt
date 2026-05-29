import { useEffect, useRef, useState } from 'react';
import { register as registerLifecycle } from '../services/modalLifecycle';

/**
 * useModalLifecycle — React adapter for the modal lifecycle singleton.
 *
 * Pairs an `isOpen` boolean with the singleton stack so the modal
 * participates in cross-modal arbitration (body lock, escape routing,
 * focus restoration, duplicate suppression) without owning any of that
 * state itself.
 *
 * Returns `{ isActive, isTop, rejectedAsDuplicate }`:
 *   - isActive    — true while this modal holds a stack entry.
 *   - isTop       — true when this modal is the topmost in the stack
 *                   (so the consumer can render its own UI affordances
 *                   only when it's actually the active modal).
 *   - rejectedAsDuplicate — true if a modal with the same `key` was
 *                   already in the stack at register time. The consumer
 *                   should typically no-op rather than render a second
 *                   copy.
 *
 * The hook does NOT close the modal on Escape or on duplicate detection
 * — that decision belongs to the caller. The hook only routes the event
 * (via `onEscape`) and reports the outcome.
 *
 * @param {Object}   opts
 * @param {boolean}  opts.isOpen      Whether the modal should participate in the stack.
 * @param {string=}  opts.key         Identity for duplicate suppression. Optional.
 * @param {Function=} opts.onEscape   Called when Escape is pressed AND this modal is top of stack.
 */
export default function useModalLifecycle({ isOpen, key = null, onEscape } = {}) {
    const handleRef = useRef(null);
    const onEscapeRef = useRef(onEscape);
    onEscapeRef.current = onEscape;

    const [state, setState] = useState({
        isActive: false,
        isTop: false,
        rejectedAsDuplicate: false,
    });

    useEffect(() => {
        if (!isOpen) return undefined;

        const handle = registerLifecycle({
            key,
            onEscape: (e) => {
                if (typeof onEscapeRef.current === 'function') onEscapeRef.current(e);
            },
        });
        handleRef.current = handle;

        if (handle.rejectedAsDuplicate) {
            setState({ isActive: false, isTop: false, rejectedAsDuplicate: true });
            // No release scheduled — the singleton didn't actually register
            // a stack entry for a duplicate.
            return undefined;
        }

        setState({
            isActive: true,
            isTop: handle.isTop(),
            rejectedAsDuplicate: false,
        });

        return () => {
            handle.release();
            handleRef.current = null;
            setState({ isActive: false, isTop: false, rejectedAsDuplicate: false });
        };
    }, [isOpen, key]);

    // When the stack mutates (another modal opens on top) the consumer may
    // want to know that this modal is no longer top. The singleton doesn't
    // notify subscribers — instead we re-evaluate on each render.
    const currentIsTop = handleRef.current ? handleRef.current.isTop() : false;
    if (state.isActive && currentIsTop !== state.isTop) {
        // Defer to next tick so React doesn't complain about setState in render.
        Promise.resolve().then(() => {
            if (handleRef.current) {
                setState((s) => ({ ...s, isTop: handleRef.current.isTop() }));
            }
        });
    }

    return state;
}
