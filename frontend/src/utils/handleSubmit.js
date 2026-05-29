// Defensive: remove any orphaned Bootstrap modal-backdrop nodes / body class.
// Fallback only — used in error recovery, not as normal lifecycle management.
export const cleanupOrphanedBackdrops = () => {
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
};

const handleSubmit = async ({ action, reload, close }) => {
    let result;
    try {
        result = await action();
    } catch (err) {
        // On failure, modal stays open for the user to retry — but make sure
        // a half-applied backdrop from a prior aborted close doesn't linger.
        cleanupOrphanedBackdrops();
        throw err;
    }

    // Close FIRST so Bootstrap's fade-out + backdrop teardown can complete
    // without being interrupted by the parent re-render that reload() triggers.
    if (close) close();

    // Defer reload to the next paint so modal lifecycle (fade, backdrop removal)
    // commits before the heavy board reconciliation begins. Prevents the stale
    // .modal-backdrop overlay that freezes the page until the next reconcile.
    if (reload) {
        requestAnimationFrame(() => {
            reload(result);
        });
    }

    return result;
};

export default handleSubmit;
