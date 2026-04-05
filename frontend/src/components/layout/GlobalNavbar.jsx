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
          <Link
            to={
              user?.role === 'admin' ? '/admin/artists/view' :
              user?.role === 'organizer' ? '/organizer/artists' :
              user?.role === 'user' ? '/user/artists' :
              '/artists'
            }
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
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlobalNavbar;
