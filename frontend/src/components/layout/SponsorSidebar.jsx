import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '@iconify/react';
import './Sidebar.css';

const SponsorSidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon-wrapper">
                    <Icon icon="solar:crown-minimalistic-bold-duotone" className="brand-icon-svg" />
                </div>
                <div className="brand-text">
                    <h2 className="product-title">Eventio</h2>
                    <span className="role-badge">Sponsor Portal</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <span className="nav-group-title">Main Menu</span>
                    
                    <NavLink to="/sponsor/dashboard" className={({ isActive }) => `nav-accordion-header ${isActive ? 'active' : ''}`}>
                        <div className="accordion-title-flex">
                            <Icon icon="solar:widget-5-bold-duotone" className="nav-icon-svg" />
                            <span className="nav-text">Dashboard</span>
                        </div>
                    </NavLink>

                    <NavLink to="/sponsor/packages" className={({ isActive }) => `nav-accordion-header ${isActive ? 'active' : ''}`}>
                        <div className="accordion-title-flex">
                            <Icon icon="solar:box-bold-duotone" className="nav-icon-svg" />
                            <span className="nav-text">Packages</span>
                        </div>
                    </NavLink>

                    <NavLink to="/sponsor/apply" className={({ isActive }) => `nav-accordion-header ${isActive ? 'active' : ''}`}>
                        <div className="accordion-title-flex">
                            <Icon icon="solar:pen-new-square-bold-duotone" className="nav-icon-svg" />
                            <span className="nav-text">Apply Sponsorship</span>
                        </div>
                    </NavLink>
                </div>

                <div className="nav-group">
                    <span className="nav-group-title">Account Settings</span>
                    <NavLink to="/sponsor/profile" className={({ isActive }) => `nav-accordion-header ${isActive ? 'active' : ''}`}>
                        <div className="accordion-title-flex">
                            <Icon icon="solar:user-circle-bold-duotone" className="nav-icon-svg" />
                            <span className="nav-text">My Profile</span>
                        </div>
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.name || 'Sponsor User'}</span>
                        <span className="user-email">{user?.email || 'sponsor@eventio.com'}</span>
                    </div>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    <Icon icon="solar:logout-3-bold-duotone" className="logout-icon-svg" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default SponsorSidebar;
