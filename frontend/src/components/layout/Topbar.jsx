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
            {/* The user requested to remove the search, notifications, and profile tabs from the Topbar */}
        </header>
    );
};

export default Topbar;
