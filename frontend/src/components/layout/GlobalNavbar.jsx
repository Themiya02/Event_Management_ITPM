<<<<<<< HEAD
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import './GlobalNavbar.css';

const GlobalNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="global-navbar glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', height: '95px', boxSizing: 'border-box' }}>
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" className="navbar-brand text-gradient" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Eventio</Link>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', fontSize: '1.15rem' }}>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            end
          >
            Home
          </NavLink>
          <NavLink 
            to={
              user?.role === 'admin' ? '/admin/events-handling' : 
              user?.role === 'organizer' ? '/organizer/dashboard' : 
              '/dashboard'
            } 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Events
          </NavLink>
          <NavLink
            to={
              user?.role === 'admin' ? '/admin/events/upcoming' :
              user?.role === 'organizer' ? '/organizer/dashboard' :
              user?.role === 'user' ? '/dashboard' :
              '/'
            }
            className="nav-link"
          >
            Events
          </Link>
=======
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
      default: return '/dashboard';
    }
  };

  const getProfilePath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/profile';
      case 'organizer': return '/organizer/profile';
      case 'sponsor': return '/sponsor/profile';
      default: return '/dashboard'; // Fallback
    }
  };

  return (
    <nav className="global-navbar glass-panel">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand text-gradient">Eventio</Link>
      </div>

      <div className="navbar-right">
        <div className="nav-links">
          {user && user.role === 'sponsor' && (
            <Link 
              to={getDashboardPath()}
              className="nav-link" 
            >
              Dashboard
            </Link>
          )}
          <Link to="/home" className="nav-link">Home</Link>
>>>>>>> hasini_dev
          <Link
            to={
              user?.role === 'admin' ? '/admin/artists/view' :
              user?.role === 'organizer' ? '/organizer/artists' :
              user?.role === 'user' ? '/user/artists' :
              '/artists'
            }
<<<<<<< HEAD
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Artists
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Contact
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            About
          </NavLink>
          {user && user.role === 'admin' && (
<<<<<<< HEAD
            <Link
              to="/admin/dashboard"
              className="nav-link"
              style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}
=======
            <NavLink 
              to="/admin/dashboard"
              className={({ isActive }) => isActive ? "nav-link active-dashboard" : "nav-link"} 
              style={({ isActive }) => ({ fontWeight: 'bold', color: isActive ? 'var(--primary-color)' : 'var(--text-main)' })}
>>>>>>> kumuthu01
            >
              Dashboard
            </NavLink>
          )}
        </div>

        {user && <NotificationsDropdown />}

        {user ? (
          <Link
            to={
              user.role === 'admin' ? '/admin/dashboard' :
                user.role === 'organizer' ? '/organizer/dashboard' :
                  user.role === 'sponsor' ? '/sponsor/dashboard' :
                    user.role === 'food_stall' ? '/food/dashboard' :
                      '/dashboard'
            }
            className="profile-info clickable-profile"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.3s ease' }}
            title="Go to Profile/Dashboard"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="profile-icon" style={{ fontSize: '1.4rem' }}>👤</div>
            <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
              <span className="profile-name" style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>{user.name}</span>
              <span className="profile-role" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          </Link>
        ) : (
          <div className="profile-info" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="profile-icon">👤</div>
            <span className="profile-role" style={{ color: 'var(--text-muted)' }}>Guest</span>
            <Link to="/login" className="nav-link login-btn" style={{ marginLeft: '15px', fontSize: '1.05rem', background: 'var(--primary-gradient)', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold' }}>Login</Link>
=======
            className="nav-link"
          >
            Artists
          </Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/about" className="nav-link">About</Link>
          
          {user && (user.role === 'admin' || user.role === 'organizer' || user.role === 'food_stall') && (
            <Link 
              to={getDashboardPath()}
              className="nav-link" 
            >
              Dashboard
            </Link>
          )}
        </div>

        {user ? (
          <div className="profile-container" ref={dropdownRef}>
            <div 
              className="profile-info clickable-profile"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: 'pointer' }}
            >
              <div className="profile-details">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">{user.role}</span>
              </div>
              <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▾</span>
            </div>

            {showDropdown && (
              <div className="navbar-dropdown">
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
>>>>>>> hasini_dev
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlobalNavbar;
