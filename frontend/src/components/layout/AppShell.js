import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { APP_CONFIG } from '../../utils/Constants';
import './AppShell.css';

/**
 * AppShell: The main architectural wrapper for the Single Page Application.
 * Replaces the legacy `templates/dashboard/templates/base.html` SSR pipeline.
 * Ensures the Header, Sidebar, and Global Contexts remain alive while the body re-renders.
 */
const AppShell = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Global Header */}
            <Header
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
            />

            {/* Application Sidebar */}
            <Sidebar sidebarCollapsed={sidebarCollapsed} />

            {/* Main Content Pane */}
            <main className="app-main">
                <div className="app-content">
                    {children}
                </div>

                {/* Legacy Footer Support */}
                <footer className="app-footer">
                    <div className="footer-content">
                        <span>{APP_CONFIG.copyright}</span>
                        <div className="footer-links">
                            {/* Privacy / Term Links natively extendible here */}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AppShell;
