import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './GlobalNavbar.css';

const GlobalNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="global-navbar glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" className="navbar-brand text-gradient" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Eventio</Link>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', fontSize: '1.15rem' }}>
          <Link to="/" className="nav-link">Home</Link>
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
          {user && user.role === 'admin' && (
            <Link 
              to="/admin/dashboard"
              className="nav-link" 
              style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}
            >
              Dashboard
            </Link>
          )}
        </div>

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
            <div className="profile-details" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="profile-name" style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>{user.name}</span>
              <span className="profile-role" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          </Link>
        ) : (
          <div className="profile-info" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="profile-icon">👤</div>
            <span className="profile-role" style={{ color: 'var(--text-muted)' }}>Guest</span>
            <Link to="/login" className="nav-link login-btn" style={{ marginLeft: '15px', fontSize: '1.05rem', background: 'var(--primary-gradient)', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold' }}>Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlobalNavbar;
