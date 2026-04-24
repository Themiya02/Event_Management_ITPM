import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import './GlobalNavbar.css';

const GlobalNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
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

  const isDashboardLayout = location.pathname.startsWith('/admin') ||
                            location.pathname.startsWith('/organizer') ||
                            location.pathname.startsWith('/user') ||
                            location.pathname.startsWith('/dashboard');

  const navbarStyle = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0 2rem', 
    height: '95px', 
    boxSizing: 'border-box', 
    position: 'sticky', 
    top: 0, 
    zIndex: 50,
    marginLeft: isDashboardLayout ? 'calc(var(--sidebar-width) + 2rem)' : '0',
    width: isDashboardLayout ? 'calc(100% - var(--sidebar-width) - 2rem)' : '100%'
  };

  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  return (
    <nav className={`global-navbar glass-panel ${isLandingPage && !user ? 'landing-nav' : ''}`} style={navbarStyle}>
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" className="navbar-brand text-gradient" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Eventio</Link>
      </div>

      <div className="navbar-right">
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
            Home
          </NavLink>
          
          <NavLink 
            to={
              user?.role === 'admin' ? '/admin/events/upcoming' : 
              user?.role === 'organizer' ? '/organizer/events' : 
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

          {user && user.role === 'admin' && (
            <NavLink 
              to="/admin/dashboard"
              className={({ isActive }) => isActive ? "nav-link active-dashboard" : "nav-link"} 
              style={({ isActive }) => ({ fontWeight: 'bold', color: isActive ? 'var(--primary-color)' : 'var(--text-main)' })}
            >
              Dashboard
            </NavLink>
          )}
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
