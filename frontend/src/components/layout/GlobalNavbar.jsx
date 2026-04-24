import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import './GlobalNavbar.css';

const GlobalNavbar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'organizer': return '/organizer/dashboard';
      case 'sponsor': return '/sponsor/dashboard';
      case 'food_stall': return '/food/dashboard';
      case 'user': return '/dashboard';
      default: return '/dashboard';
    }
  };

  const getProfilePath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/profile';
      case 'organizer': return '/organizer/profile';
      case 'sponsor': return '/sponsor/profile';
      case 'user': return '/user/profile';
      default: return '/user/profile';
    }
  };

  return (
    <nav className="global-navbar glass-panel">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand text-gradient">Eventio</Link>
      </div>

      <div className="navbar-right">
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
            Home
          </NavLink>
          
          <NavLink 
            to={
              user?.role === 'admin' ? '/admin/events/upcoming' :
              user?.role === 'organizer' ? '/organizer/dashboard' :
              user?.role === 'user' ? '/dashboard' :
              '/dashboard'
            }
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Events
          </NavLink>

          <NavLink
            to={
              user?.role === 'admin' ? '/admin/artists/view' :
              user?.role === 'organizer' ? '/organizer/artists' :
              user?.role === 'user' ? '/user/artists' :
              '/artists'
            }
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Artists
          </NavLink>

          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Contact
          </NavLink>

          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            About
          </NavLink>
        </div>

        {user && <NotificationsDropdown />}

        {user ? (
          <div className="profile-container" ref={dropdownRef}>
            <div 
              className="profile-info clickable-profile"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: 'pointer' }}
            >
              <div className="profile-icon">👤</div>
              <div className="profile-details">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role" style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>
              <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▾</span>
            </div>

            {showDropdown && (
              <div className="navbar-dropdown">
                <Link to={getDashboardPath()} className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  Dashboard
                </Link>
                <Link to={getProfilePath()} className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  Profile
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-info">
            <span className="profile-role" style={{ color: 'var(--text-muted)' }}>Guest</span>
            <Link to="/login" className="nav-link login-btn">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlobalNavbar;
