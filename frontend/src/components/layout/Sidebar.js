import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaUsers, FaCheckDouble, FaBars, FaChevronDown,
    FaCertificate, FaFlask, FaFileInvoiceDollar, FaBoxes,
    FaWeight, FaMoneyBillWave, FaUserShield
} from 'react-icons/fa';
import ProtectedComponent from './ProtectedComponent';
import { APP_CONFIG } from '../../utils/Constants';

const Sidebar = ({ sidebarCollapsed }) => {
    const location = useLocation();

    const [expandedMenus, setExpandedMenus] = useState(() => ({
        Certificates: location.pathname.startsWith('/gold-certificates')
            || location.pathname.startsWith('/silver-certificates')
            || location.pathname.startsWith('/photo-certificates'),
        Tests: location.pathname.startsWith('/gold-test') || location.pathname.startsWith('/silver-test'),
        Admin: location.pathname.startsWith('/admin'),
    }));

    const navigation = React.useMemo(() => [
        {
            name: 'Dashboard',
            path: '/',
            icon: <FaTachometerAlt />,
            exact: true,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Customers',
            path: '/customers',
            icon: <FaUsers />,
            roles: ['admin', 'manager', 'front_desk'],
        },
        {
            name: 'Certificates',
            path: '/gold-certificates',
            icon: <FaCertificate />,
            roles: ['admin', 'manager', 'front_desk', 'user'],
            subItems: [
                { name: 'Gold', path: '/gold-certificates' },
                { name: 'Silver', path: '/silver-certificates' },
                { name: 'Photo', path: '/photo-certificates' },
            ],
        },
        {
            name: 'Tests',
            path: '/gold-test',
            icon: <FaFlask />,
            roles: ['admin', 'manager', 'technician', 'front_desk', 'user'],
            subItems: [
                { name: 'Gold Test', path: '/gold-test' },
                { name: 'Silver Test', path: '/silver-test' },
            ],
        },
        {
            name: 'Workflow Board',
            path: '/workflow',
            icon: <FaCheckDouble />,
            roles: ['admin', 'manager', 'technician', 'front_desk'],
        },
        {
            name: 'Bills Report',
            path: '/bills',
            icon: <FaFileInvoiceDollar />,
            roles: ['admin', 'manager', 'front_desk'],
        },
        {
            name: 'Item Master',
            path: '/items',
            icon: <FaBoxes />,
            roles: ['admin', 'manager', 'technician'],
        },
        {
            name: 'List Views',
            path: '/list-views',
            icon: <FaBars />,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Weight Loss',
            path: '/weight-loss',
            icon: <FaWeight />,
            roles: ['admin', 'manager'],
        },
        {
            name: 'Cash in Hand',
            path: '/cash-in-hand',
            icon: <FaMoneyBillWave />,
            roles: ['admin'],
        },
        {
            name: 'Admin',
            path: '/admin/users',
            icon: <FaUserShield />,
            roles: ['admin'],
            subItems: [
                { name: 'Users', path: '/admin/users' },
            ],
        },
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

    const isGroupActive = React.useCallback((item) => {
        if (!item.subItems) return isActive(item.path, item.exact);
        return item.subItems.some(sub => isActive(sub.path));
    }, [isActive]);

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
                                <div className={`nav-group ${isGroupActive(item) ? 'active' : ''}`}>
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
