// Modal lifecycle service — single authoritative owner of cross-modal DOM
// concerns. Per-modal hooks (useSafeModalClose, useModalLifecycle) register
// here; the singleton arbitrates between them.
//
// Owns:
//   - the open-modal stack (top of stack = active modal for escape + focus)
//   - body lock (modal-open class, overflow, padding-right) — locked while
//     stack non-empty, released exactly when it empties
//   - global escape-key listener — one listener, routed to stack top
//   - focus restoration stack — saves activeElement at register, restores
//     at release, never crosses streams
//   - duplicate-open suppression by key
//   - orphan-backdrop sweep — single scheduled timer, idempotent
//
// Does NOT own:
//   - modal content
//   - modal form fields
//   - workflow draft state
//   - business validation
//
// Per the architectural directive: this centralizes lifecycle orchestration,
// not business state.

let _idCounter = 0;
const _stack = [];                    // [{ id, key, triggerEl, onEscape, onDuplicateRejected }]
let _bodyLockOwner = null;            // id of whoever first claimed the lock
let _escListenerAttached = false;
let _sweepTimer = null;

// React-Bootstrap's default fade is 300ms; sweep just after so RB's own
// teardown wins the race against ours.
const SWEEP_DELAY_MS = 350;

function _hasDom() {
    return typeof document !== 'undefined' && typeof document.body !== 'undefined';
}

function _lockBody(ownerId) {
    if (!_hasDom()) return;
    if (_bodyLockOwner !== null) return;
    _bodyLockOwner = ownerId;
    document.body.classList.add('modal-open');
}

function _unlockBody(ownerId) {
    if (!_hasDom()) return;
    if (_bodyLockOwner !== ownerId) return; // not the owner — leave it
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    _bodyLockOwner = null;
}

function _onEscape(event) {
    if (event.key !== 'Escape') return;
    if (_stack.length === 0) return;
    const top = _stack[_stack.length - 1];
    if (top && typeof top.onEscape === 'function') {
        try { top.onEscape(event); } catch (_e) { /* never throw from listener */ }
    }
}

function _ensureEscListener() {
    if (!_hasDom() || _escListenerAttached) return;
    document.addEventListener('keydown', _onEscape);
    _escListenerAttached = true;
}

function _maybeDetachEscListener() {
    if (!_hasDom() || !_escListenerAttached) return;
    if (_stack.length > 0) return;
    document.removeEventListener('keydown', _onEscape);
    _escListenerAttached = false;
}

function _restoreFocus(triggerEl) {
    if (!_hasDom() || !triggerEl) return;
    if (typeof triggerEl.focus !== 'function') return;
    if (!document.contains(triggerEl)) return;
    try { triggerEl.focus({ preventScroll: true }); } catch (_e) { /* never throw */ }
}

function _scheduleOrphanSweep() {
    if (!_hasDom()) return;
    if (_sweepTimer) clearTimeout(_sweepTimer);
    _sweepTimer = setTimeout(() => {
        _sweepTimer = null;
        const backdrops     = document.querySelectorAll('.modal-backdrop');
        const visibleModals = document.querySelectorAll('.modal.show, .modal-overlay');
        // Case A: no visible modal but backdrops linger → orphan; nuke all.
        if (visibleModals.length === 0 && backdrops.length > 0) {
            backdrops.forEach(b => { try { b.remove(); } catch (_e) {} });
        }
        // Case B: more backdrops than modals — trim oldest first.
        else if (backdrops.length > visibleModals.length) {
            const excess = backdrops.length - visibleModals.length;
            for (let i = 0; i < excess; i++) {
                try { backdrops[i].remove(); } catch (_e) {}
            }
        }
        // Case C: stack empty but body still locked → force release.
        if (_stack.length === 0 && _bodyLockOwner === null) {
            if (document.body.classList.contains('modal-open')) {
                document.body.classList.remove('modal-open');
            }
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        }
    }, SWEEP_DELAY_MS);
}

// register(opts) → { release, isTop, id, rejectedAsDuplicate }
//
// opts:
//   key            — string identity for duplicate suppression. If a modal
//                    with this key is already open, register returns
//                    { rejectedAsDuplicate: true } and DOES NOT enter the
//                    stack. The caller is expected to call its own onAutoCloseForDuplicate
//                    (or just no-op the second open).
//   onEscape       — invoked when Escape is pressed and this entry is top
//                    of stack. Receives the KeyboardEvent.
//   triggerEl      — element to restore focus to on release. Defaults to
//                    document.activeElement at register time.
//
// release(reason?) — idempotent. Removes this entry from the stack, runs
//                    focus restoration if this was the top, releases body
//                    lock if this was the lock owner, schedules an orphan
//                    sweep, and (re)evaluates escape-listener attachment.
function register(opts = {}) {
    if (!_hasDom()) {
        return {
            release: () => {},
            isTop: () => false,
            id: -1,
            rejectedAsDuplicate: false,
        };
    }

    const { key = null, onEscape = null, triggerEl = null } = opts;

    if (key !== null) {
        const exists = _stack.some(entry => entry.key === key);
        if (exists) {
            return {
                release: () => {},
                isTop: () => false,
                id: -1,
                rejectedAsDuplicate: true,
            };
        }
    }

    const id = ++_idCounter;
    const entry = {
        id,
        key,
        triggerEl: triggerEl || document.activeElement || null,
        onEscape,
        released: false,
    };
    _stack.push(entry);
    _lockBody(id);
    _ensureEscListener();

    const release = (/* reason */) => {
        if (entry.released) return;
        entry.released = true;
        const idx = _stack.findIndex(e => e.id === id);
        if (idx === -1) return;
        const wasTop = idx === _stack.length - 1;
        _stack.splice(idx, 1);
        if (wasTop) {
            _restoreFocus(entry.triggerEl);
        }
        if (_stack.length === 0) {
            _unlockBody(id);
        } else if (_bodyLockOwner === id) {
            // We were the lock owner but more modals remain; transfer
            // ownership to the new top so the lock is released by the
            // last one to leave.
            _bodyLockOwner = _stack[_stack.length - 1].id;
        }
        _scheduleOrphanSweep();
        _maybeDetachEscListener();
    };

    return {
        release,
        isTop: () => _stack.length > 0 && _stack[_stack.length - 1].id === id,
        id,
        rejectedAsDuplicate: false,
    };
}

// Force-clear — used by tests and as an emergency reset path (e.g. after
// a workflow switch that orphans modals in flight).
function _resetForTests() {
    while (_stack.length > 0) _stack.pop();
    _bodyLockOwner = null;
    if (_sweepTimer) { clearTimeout(_sweepTimer); _sweepTimer = null; }
    _maybeDetachEscListener();
    if (_hasDom()) {
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
    }
}

// Diagnostics — read-only snapshot used by tests + the dev-tools probe.
function _snapshot() {
    return {
        stackSize: _stack.length,
        stack: _stack.map(e => ({ id: e.id, key: e.key })),
        bodyLockOwner: _bodyLockOwner,
        escListenerAttached: _escListenerAttached,
    };
}

export { register, _resetForTests, _snapshot, SWEEP_DELAY_MS };
