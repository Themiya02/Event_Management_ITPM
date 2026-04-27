import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

const FoodStallSidebar = ({ handleLogout }) => {
    return (
        <aside className="food-sidebar">
            <div className="food-brand-section">
                <div className="food-logo-box">
                   <div className="blue-square"></div>
                </div>
                <div className="food-brand-info">
                    <h2 className="food-brand-name">Eventio</h2>
                    <span className="food-brand-subtitle">VENDOR PORTAL</span>
                    <p className="food-workspace-text">Food stall workspace</p>
                </div>
            </div>

            <nav className="food-nav-menu">
                <NavLink 
                    to="/food/dashboard"
                    end
                    className={({ isActive }) => `food-nav-link ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-text">Dashboard</span>
                </NavLink>

                <NavLink 
                    to="/food/dashboard?tab=application" 
                    className={({ isActive }) => `food-nav-link ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-text">Stall Application</span>
                </NavLink>

                <NavLink 
                    to="/food/dashboard?tab=payments" 
                    className={({ isActive }) => `food-nav-link ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-text">Payment Details</span>
                </NavLink>
            </nav>

            <div className="food-sidebar-bottom">
                <button className="food-logout-link" onClick={handleLogout}>
                    <Icon icon="solar:logout-linear" className="logout-icon" />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default FoodStallSidebar;
