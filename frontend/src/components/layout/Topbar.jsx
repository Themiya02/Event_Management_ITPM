import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

const Topbar = () => {
    const { user: authUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const user = authUser || JSON.parse(localStorage.getItem('user')) || {};
    
    // Format the role to start with a capital letter
    const displayRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest';
    const displayName = user.name || 'Jane Doe';
    const profilePath = user.role === 'admin' ? '/admin/profile' : '/organizer/profile';

    // Determine if we are on an artists page
    const isArtistsPage = location.pathname.toLowerCase().includes('artists');
    const placeholderText = isArtistsPage ? "Search for artists by name..." : "Search event, attendees...";

    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (query) {
            setSearchParams({ q: query });
        } else {
            setSearchParams({});
        }
    };

    const clearSearch = () => {
        setSearchParams({});
    };

    return (
        <header className="topbar">
            <div className="search-container">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    type="text" 
                    placeholder={placeholderText} 
                    className="search-input" 
                    value={searchParams.get('q') || ''}
                    onChange={handleSearchChange}
                />
                {searchParams.get('q') && (
                    <button 
                        onClick={clearSearch} 
                        className="clear-search-btn"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0 10px',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            <div className="topbar-actions">
                <button className="icon-btn notification-btn">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span className="badge"></span>
                </button>

                <Link to={profilePath} className="profile-menu" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="avatar" style={{ background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile avatar" />
                        ) : (
                            <span style={{ fontSize: '1.2rem' }}>{displayName.charAt(0)}</span>
                        )}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{displayName}</span>
                        <span className="profile-role">{displayRole}</span>
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Topbar;
