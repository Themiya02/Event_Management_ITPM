import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const FoodStallSidebar = ({ activeTab, onTabChange }) => {
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
                    <div className="brand-icon">🏪</div>
                </div>
                <div className="brand-text">
                    <h2 className="product-title">Eventio</h2>
                    <span className="role-badge">Vendor Portal</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <span className="nav-group-title">Main Menu</span>
                    
                    <NavLink 
                        to="/food/dashboard"
                        onClick={() => onTabChange && onTabChange('dashboard')}
                        className={({ isActive }) => `nav-accordion-header ${isActive || activeTab === 'dashboard' ? 'active' : ''}`}
                    >
                        <div className="accordion-title-flex">
                            <span className="nav-icon">📊</span>
                            <span className="nav-text">Dashboard</span>
                        </div>
                    </NavLink>

                    <button 
                        onClick={() => onTabChange && onTabChange('application')}
                        className={`nav-accordion-header ${activeTab === 'application' ? 'active' : ''}`}
                    >
                        <div className="accordion-title-flex">
                            <span className="nav-icon">🍔</span>
                            <span className="nav-text">Stall Application</span>
                        </div>
                    </button>

                    <button 
                        onClick={() => onTabChange && onTabChange('payments')}
                        className={`nav-accordion-header ${activeTab === 'payments' ? 'active' : ''}`}
                    >
                        <div className="accordion-title-flex">
                            <span className="nav-icon">💰</span>
                            <span className="nav-text">Payment Details</span>
                        </div>
                    </button>
                </div>

                <div className="nav-group">
                    <span className="nav-group-title">Account</span>
                    <NavLink 
                        to="/food/profile" 
                        className={({ isActive }) => `nav-accordion-header ${isActive ? 'active' : ''}`}
                    >
                        <div className="accordion-title-flex">
                            <span className="nav-icon">👤</span>
                            <span className="nav-text">My Profile</span>
                        </div>
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'V'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.name || 'Vendor'}</span>
                        <span className="user-email">{user?.email || 'vendor@eventio.com'}</span>
                    </div>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    <span className="logout-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default FoodStallSidebar;
