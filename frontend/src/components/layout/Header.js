import React, { useState, useEffect } from 'react';
import { FaBars, FaGem, FaSearch, FaBell, FaQuestionCircle, FaUser, FaChevronDown, FaUserCog, FaSignOutAlt, FaUsers, FaPrint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { APP_CONFIG } from '../../utils/Constants';
import api from '../../services/api';

const Header = ({ sidebarCollapsed, setSidebarCollapsed }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [searchQuery, setSearchQuery]     = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searchOpen, setSearchOpen]       = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchQuery.length < 2) { setSearchResults(null); return; }
        const t = setTimeout(() => {
            setSearchLoading(true);
            api.get(`/analytics/search?q=${encodeURIComponent(searchQuery)}`)
                .then(res => { setSearchResults(res.data?.data || null); setSearchOpen(true); })
                .catch(() => setSearchResults(null))
                .finally(() => setSearchLoading(false));
        }, 280); // 280ms debounce
        return () => clearTimeout(t);
    }, [searchQuery]);

    return (
        <header className="app-header">
            <div className="header-left">
                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    <FaBars />
                </button>
                <div className="logo cursor-pointer" onClick={() => navigate('/')}>
                    <FaGem className="logo-icon" />
                    {!sidebarCollapsed && <span className="brand-name gradient-text">{APP_CONFIG.brandName}</span>}
                </div>
            </div>

            <div className="header-center" style={{ position: 'relative' }}>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search customers, tests, certificates..."
                        className="search-input"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                        onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                    />
                    <FaSearch />
                </div>
                {searchOpen && searchResults && (
                    <div style={{
                        position: 'absolute', top: '110%', left: 0, right: 0,
                        background: 'var(--bg-card, #fff)', border: '1px solid #e0e0e0',
                        borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        zIndex: 9999, maxHeight: 420, overflowY: 'auto', padding: '8px 0'
                    }}>
                        {searchLoading && (
                            <div style={{ padding: '12px 16px', color: '#888', fontSize: 13 }}>Searching...</div>
                        )}
                        {!searchLoading && !searchResults.customers?.length && !searchResults.tests?.length && !searchResults.certs?.length && (
                            <div style={{ padding: '12px 16px', color: '#888', fontSize: 13 }}>No results found.</div>
                        )}
                        {searchResults.customers?.length > 0 && (
                            <>
                                <div style={{ padding: '4px 16px 2px', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Customers</div>
                                {searchResults.customers.map(c => (
                                    <button key={c.id} className="search-result-item" onMouseDown={() => { navigate(`/customers/${c.id}`); setSearchOpen(false); setSearchQuery(''); }}>
                                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                                        {c.phone && <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{c.phone}</span>}
                                    </button>
                                ))}
                            </>
                        )}
                        {searchResults.tests?.length > 0 && (
                            <>
                                <div style={{ padding: '4px 16px 2px', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tests</div>
                                {searchResults.tests.map(t => (
                                    <button key={t.id} className="search-result-item" onMouseDown={() => { navigate(`/record/${t.metal_type}-tests/${t.id}`); setSearchOpen(false); setSearchQuery(''); }}>
                                        <span style={{ fontWeight: 500 }}>{t.auto_number}</span>
                                        <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{t.customer_name}</span>
                                        <span style={{ marginLeft: 8, fontSize: 11, color: t.status === 'DONE' ? '#2e7d32' : '#f59e0b', fontWeight: 600 }}>{t.status}</span>
                                    </button>
                                ))}
                            </>
                        )}
                        {searchResults.certs?.length > 0 && (
                            <>
                                <div style={{ padding: '4px 16px 2px', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Certificates</div>
                                {searchResults.certs.map(c => (
                                    <button key={c.id} className="search-result-item" onMouseDown={() => { navigate(`/record/${c.metal_type}-cert/${c.id}`); setSearchOpen(false); setSearchQuery(''); }}>
                                        <span style={{ fontWeight: 500 }}>{c.auto_number}</span>
                                        <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{c.customer_name}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="header-right">
                <div className="header-actions">
                    <button className="header-action-btn" title="Recent Activity">
                        <FaPrint />
                    </button>
                    <button className="header-action-btn" title="Notifications">
                        <FaBell />
                        <span className="notification-badge">3</span>
                    </button>
                    <button className="header-action-btn" title="Help Center">
                        <FaQuestionCircle />
                    </button>

                    <div className="user-menu-container">
                        <button
                            className="user-menu-btn"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="user-avatar shadow-sm">
                                <FaUser />
                            </div>
                            {!sidebarCollapsed && (
                                <div className="user-info d-none d-md-flex">
                                    <span className="user-name">{user?.username || 'Admin'}</span>
                                    <span className="user-role">Lab Technician</span>
                                </div>
                            )}
                            <FaChevronDown className={`menu-arrow ${userMenuOpen ? 'open' : ''}`} />
                        </button>

                        {userMenuOpen && (
                            <div className="user-menu-dropdown">
                                <div className="user-menu-header">
                                    <div className="user-avatar large">
                                        <FaUser />
                                    </div>
                                    <div className="user-menu-info">
                                        <strong>{user?.username || 'Guest'}</strong>
                                        <span>{user?.role}@swastiklab.com</span>
                                    </div>
                                </div>
                                <div className="user-menu-items">
                                    {user?.role === APP_CONFIG.roles.ADMIN && (
                                        <button
                                            className="user-menu-item"
                                            onClick={() => {
                                                navigate('/admin/users');
                                                setUserMenuOpen(false);
                                            }}
                                        >
                                            <FaUsers />
                                            <span>User Management</span>
                                        </button>
                                    )}
                                    <button
                                        className="user-menu-item"
                                        onClick={() => {
                                            setShowChangePasswordModal(true);
                                            setUserMenuOpen(false);
                                        }}
                                    >
                                        <FaUserCog />
                                        <span>Change Password</span>
                                    </button>
                                    <div className="divider"></div>
                                    <button className="user-menu-item logout" onClick={logout}>
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                show={showChangePasswordModal}
                onHide={() => setShowChangePasswordModal(false)}
            />
        </header>
    );
};

export default Header;
