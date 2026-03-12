import React, { useState } from 'react';
import { FaBars, FaGem, FaSearch, FaBell, FaQuestionCircle, FaUser, FaChevronDown, FaUserCog, FaSignOutAlt, FaUsers, FaPrint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import { APP_CONFIG } from '../../utils/Constants';

const Header = ({ sidebarCollapsed, setSidebarCollapsed }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

            <div className="header-center">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search daily NNN token, tests, customers..."
                        className="search-input"
                    />
                    <FaSearch />
                </div>
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
