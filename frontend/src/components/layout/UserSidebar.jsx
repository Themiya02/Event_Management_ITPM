import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const UserSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Default expand the domain the user is currently inside
    const [expandedAccordion, setExpandedAccordion] = useState(() => {
        if (currentPath.includes('/user/')) return 'account';
        return null;
    });

    const toggleAccordion = (id) => {
        setExpandedAccordion(prev => prev === id ? null : id);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const accordionDomains = [
        {
            id: 'events',
            label: 'My Activities',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            links: [
                { label: 'Browse Events', path: '/dashboard' },
                { label: 'My Tickets', path: '/user/tickets' },
                { label: 'Participated Artists', path: '/user/artists' },
            ]
        },
        {
            id: 'account',
            label: 'Account & Safety',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            links: [
                { label: 'My Profile', path: '/user/profile' },
                { label: 'Ratings & Feedback', path: '/user/rating' }
            ]
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                    <div className="brand-name">Eventio</div>
                    <span className="role-badge">Student Portal</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link to="/dashboard" className={`nav-link ${currentPath === '/dashboard' ? 'active' : ''}`}>
                            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <span>Home</span>
                        </Link>
                    </li>

                    <li className="nav-divider"></li>

                    {accordionDomains.map((domain) => {
                        const isExpanded = expandedAccordion === domain.id;
                        const hasActiveChild = domain.links.some(link => currentPath === link.path);

                        return (
                            <li key={domain.id} className="nav-accordion-group">
                                <div 
                                    className={`nav-accordion-header ${hasActiveChild && !isExpanded ? 'child-active' : ''}`}
                                    onClick={() => toggleAccordion(domain.id)}
                                >
                                    <div className="accordion-title-flex">
                                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={domain.icon} />
                                        </svg>
                                        <span>{domain.label}</span>
                                    </div>
                                    <svg className={`chevron ${isExpanded ? 'rotated' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'16px', height:'16px', transition:'transform 0.3s'}}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                
                                <div className={`nav-accordion-content ${isExpanded ? 'expanded' : ''}`}>
                                    <ul className="sub-nav-list">
                                        {domain.links.map(link => (
                                            <li key={link.path}>
                                                <Link to={link.path} className={`sub-nav-link ${currentPath === link.path ? 'active' : ''}`}>
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default UserSidebar;
