import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaUsers,
    FaCheckDouble, FaBars, FaChevronDown
} from 'react-icons/fa';
import ProtectedComponent from './ProtectedComponent';
import { APP_CONFIG } from '../../utils/Constants';

const Sidebar = ({ sidebarCollapsed }) => {
    const location = useLocation();

    // We duplicate the expanded logic from old AppShell here.
    const [expandedMenus, setExpandedMenus] = useState({
        'Workflow Board': location.pathname.startsWith('/workflow')
    });

    const navigation = React.useMemo(() => [
        {
            name: 'Dashboard',
            path: '/',
            icon: <FaTachometerAlt />,
            exact: true,
            roles: ['admin', 'manager']
        },
        {
            name: 'Customers',
            path: '/customers',
            icon: <FaUsers />,
            roles: ['admin', 'manager', 'front_desk']
        },
        {
            name: 'Workflow Board',
            path: '/workflow',
            icon: <FaCheckDouble />,
            roles: ['admin', 'manager', 'technician', 'front_desk']
        },
        {
            name: 'List Views',
            path: '/list-views',
            icon: <FaBars />,
            roles: ['admin', 'manager']
        }
    ], []);

    const isActive = React.useCallback((path, exact = false) => {
        if (!path) return false;
        if (path.includes('?')) {
            const [basePath, query] = path.split('?');
            if (location.pathname !== basePath) return false;
            const expected = new URLSearchParams(query);
            const current = new URLSearchParams(location.search);
            return Array.from(expected.entries()).every(([key, value]) => current.get(key) === value);
        }
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    }, [location.pathname, location.search]);

    const toggleMenu = (name) => {
        setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <aside className="app-sidebar">
            <nav className="sidebar-nav">
                {navigation.map((item, index) => {
                    const NavItemContent = (
                        <div className="nav-section">
                            {!item.subItems ? (
                                <Link
                                    to={item.path}
                                    className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {!sidebarCollapsed && <span className="nav-label">{item.name}</span>}
                                </Link>
                            ) : (
                                <div className={`nav-group ${isActive(item.path) ? 'active' : ''}`}>
                                    <div
                                        className="nav-group-header"
                                        onClick={() => !sidebarCollapsed && toggleMenu(item.name)}
                                        style={{ cursor: !sidebarCollapsed ? 'pointer' : 'default' }}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {!sidebarCollapsed && (
                                            <>
                                                <span className="nav-label">{item.name}</span>
                                                <FaChevronDown
                                                    style={{
                                                        marginLeft: 'auto',
                                                        fontSize: '0.8em',
                                                        transform: expandedMenus[item.name] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    {!sidebarCollapsed && expandedMenus[item.name] && (
                                        <div className="nav-subitems">
                                            {item.subItems.map((subItem, subIndex) => (
                                                <Link
                                                    key={subIndex}
                                                    to={subItem.path}
                                                    className={`nav-subitem ${isActive(subItem.path) ? 'active' : ''}`}
                                                >
                                                    <span className="nav-icon-sm">{subItem.icon}</span>
                                                    <span>{subItem.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );

                    return item.roles ? (
                        <ProtectedComponent key={index} roles={item.roles}>
                            {NavItemContent}
                        </ProtectedComponent>
                    ) : (
                        <React.Fragment key={index}>{NavItemContent}</React.Fragment>
                    );
                })}
            </nav>

            {!sidebarCollapsed && (
                <div className="sidebar-footer">
                    <div className="app-info">
                        <div className="app-version">{APP_CONFIG.version}</div>
                        <div className="app-copyright">{APP_CONFIG.copyright}</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
