import React from 'react';

/**
 * Ensures Action Buttons are uniformly placed on screens (specifically bottom modals or record pages).
 * Designed for grouping Primary Action, Token Action, Secondary, and Danger Actions.
 */
const FixedActionFooter = ({ children, align = 'between', fullWidth = false }) => {
    return (
        <div
            className={`swastik-action-footer d-flex align-items-center ${align === 'between' ? 'justify-content-between' :
                    align === 'end' ? 'justify-content-end' :
                        align === 'start' ? 'justify-content-start' : 'justify-content-center'
                } ${fullWidth ? 'w-100' : ''}`}
        >
            {children}

            <style>{`
                .swastik-action-footer {
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    padding: 1rem 1.5rem;
                    border-radius: 0 0 12px 12px;
                    margin: 0 -1.5rem -1rem -1.5rem; /* Negate modal padding if inside modal */
                }
                .swastik-action-footer .btn {
                    border-radius: 8px;
                    font-weight: 600;
                    padding: 0.5rem 1.25rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default FixedActionFooter;
