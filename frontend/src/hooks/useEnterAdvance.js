import { useCallback } from 'react';

// Enter-to-next-focusable helper. Restores the Python-era operator rhythm
// where Enter advances through the form fields without submitting.
//
// Usage:
//   const onEnter = useEnterAdvance();
//   <input onKeyDown={onEnter} ... />
//
// Behavior:
//   - Plain Enter:    focus advances to the next focusable element in DOM
//                     order within the same modal/form. Submission is
//                     prevented so the form does not auto-submit when the
//                     operator overshoots the last field.
//   - Shift+Enter:    no interception. Lets multi-line textareas accept
//                     newlines normally.
//   - Modifier keys (Ctrl/Alt/Meta + Enter): no interception.
//
// Search scope:
//   The hook walks up to the nearest ancestor with role="dialog" (i.e. the
//   modal body) or falls back to the closest <form>. Outside a modal/form
//   it advances within document.body. This keeps focus inside the operator's
//   current context — Enter in NewGoldTestModal won't accidentally jump to
//   the sidebar.
//
// Skipped elements:
//   Disabled, hidden, type=hidden, tabIndex < 0. Mirrors the browser's
//   own native Tab traversal.

const FOCUSABLE_SELECTOR = [
    'input:not([type=hidden]):not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

function isVisible(el) {
    if (!el || !el.getClientRects) return false;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
    return el.getClientRects().length > 0;
}

function findContext(el) {
    return el.closest?.('[role="dialog"]') || el.closest?.('form') || document.body;
}

export default function useEnterAdvance() {
    return useCallback((event) => {
        if (event.key !== 'Enter') return;
        if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
        const src = event.target;
        if (!src) return;
        // Buttons handle Enter as click — leave them alone so submit / cancel
        // continue to work the way the user expects.
        if (src.tagName === 'BUTTON' || src.getAttribute?.('role') === 'button') return;
        // Allow textareas to take real newlines.
        if (src.tagName === 'TEXTAREA') return;

        const ctx = findContext(src);
        const candidates = Array.from(ctx.querySelectorAll(FOCUSABLE_SELECTOR))
            .filter(isVisible);
        const idx = candidates.indexOf(src);
        if (idx === -1) return;
        const next = candidates[idx + 1];
        if (!next) {
            // At end of the form — prevent default submission, leave focus put.
            event.preventDefault();
            return;
        }
        event.preventDefault();
        try { next.focus({ preventScroll: false }); } catch (_e) { /* never throw from key handler */ }
        // If the next element is a text input, select its contents so the
        // operator can type-over the existing value — matches the legacy
        // Python flow where Enter advanced and Tab+selected.
        if (next.select && (next.type === 'text' || next.type === 'number' || next.type === 'search' || next.type === 'tel')) {
            try { next.select(); } catch (_e) {}
        }
    }, []);
}
