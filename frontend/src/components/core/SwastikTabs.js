import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';

/**
 * Standardized Tabs component for the Salesforce-style grouped layout.
 * Enforces unified styling (borderless white backgrounds with subtle active-tab highlights).
 */
const SwastikTabs = ({ activeKey, onSelect, tabs }) => {
    return (
        <div className="swastik-core-tabs bg-white shadow-sm border-0 rounded overflow-hidden">
            <Tabs
                activeKey={activeKey}
                onSelect={onSelect}
                className="border-bottom px-3 pt-2"
                variant="underline" // Standard bootstrap 5 behavior
            >
                {tabs.map((tab, idx) => (
                    <Tab
                        key={tab.eventKey || idx}
                        eventKey={tab.eventKey || `tab-${idx}`}
                        title={<span className="fw-bold d-flex align-items-center gap-2">{tab.icon}{tab.label}</span>}
                        className="p-4"
                    >
                        {tab.content}
                    </Tab>
                ))}
            </Tabs>

            <style>{`
                .swastik-core-tabs .nav-tabs {
                    border-bottom: 2px solid #f1f3f5;
                }
                .swastik-core-tabs .nav-tabs .nav-link {
                    border: none;
                    color: #495057;
                    padding: 0.75rem 1.25rem;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s ease-in-out;
                }
                .swastik-core-tabs .nav-tabs .nav-link:hover {
                    color: #0176d3;
                }
                .swastik-core-tabs .nav-tabs .nav-link.active {
                    color: #0176d3;
                    border-bottom: 3px solid #0176d3;
                    background: transparent;
                }
            `}</style>
        </div>
    );
};

export default SwastikTabs;
