import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

/**
 * PrerequisiteBanner — workflow guidance, not governance enforcement.
 *
 * Surfaces the canonical workflow path so operators don't have to rely
 * on tribal knowledge. Calm slate panel, info-icon, single sentence.
 * No animation, no warning palette, no blocking — the modal still
 * accepts direct entry; the banner just sets expectations about the
 * usual path.
 *
 * The backend does NOT require a prior test for cert creation (both
 * paths are supported), so the wording must say "typically" / "usually"
 * — never "requires" or "must" — to match institutional truth.
 */
export default function PrerequisiteBanner({ children, icon = null }) {
    if (!children) return null;
    const Icon = icon || FaInfoCircle;
    return (
        <div className="prereq-banner" role="note">
            <Icon className="prereq-banner__icon" aria-hidden="true" />
            <span className="prereq-banner__text">{children}</span>
        </div>
    );
}
