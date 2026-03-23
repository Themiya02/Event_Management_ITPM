import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './GlobalNavbar.css';

const GlobalNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="global-navbar glass-panel">
      <div className="navbar-left">
        {user ? (
          <div className="profile-info">
            <div className="profile-icon">👤</div>
            <div className="profile-details">
              <span className="profile-name">{user.name}</span>
              <span className="profile-role">{user.role}</span>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="profile-icon">👤</div>
            <span className="profile-role">Guest</span>
            <Link to="/login" className="nav-link" style={{ marginLeft: '10px' }}>Login</Link>
          </div>
        )}
      </div>

      <div className="navbar-right">
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/artists" className="nav-link">Artists</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/about" className="nav-link">About</Link>
          {user && (
            <Link 
              to={
                user.role === 'admin' ? '/admin/dashboard' :
                user.role === 'organizer' ? '/organizer/dashboard' :
                user.role === 'sponsor' ? '/sponsor/dashboard' :
                user.role === 'food_stall' ? '/food/dashboard' :
                '/dashboard'
              } 
              className="nav-link" 
              style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}
            >
              Dashboard
            </Link>
          )}
        </div>
        <Link to="/" className="navbar-brand text-gradient">Eventio</Link>
      </div>
    </nav>
  );
};

export default GlobalNavbar;
