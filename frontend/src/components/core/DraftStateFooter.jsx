import React from 'react';
import { FaRegFileAlt } from 'react-icons/fa';

/**
 * DraftStateFooter — operator reassurance, not a governance warning.
 *
 * Renders a muted footer strip ONLY when the parent form is dirty. The job
 * is to reduce operator fear during interruption: tells them their entries
 * will survive a workflow switch or modal-open race, but will be discarded
 * when the modal closes. No animation, no warning palette — slate tones,
 * single sentence, contextual appearance only.
 *
 * The parent decides what "dirty" means for its own form; this component
 * only renders. Lifecycle owns lifecycle, business owns business — same
 * boundary discipline as the modal lifecycle service.
 */
export default function DraftStateFooter({ isDirty, message }) {
    if (!isDirty) return null;
    const text = message || 'Draft preserved while this form is open. Closing discards unsaved entries.';
    return (
        <div className="draft-state-footer" role="status" aria-live="polite">
            <FaRegFileAlt className="draft-state-footer__icon" aria-hidden="true" />
            <span className="draft-state-footer__text">{text}</span>
        </div>
    );
}
