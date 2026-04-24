import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Default expand the domain the user is currently inside
    const [expandedAccordion, setExpandedAccordion] = useState(() => {
        if (currentPath.includes('/admin/events/')) return 'events';
        return null;
    });

    const toggleAccordion = (id) => {
        setExpandedAccordion(prev => prev === id ? null : id);
    };

    const dashboardItem = {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    };

    const accordionDomains = [
        {
            id: 'events',
            label: 'Event Handling',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            links: [
                { label: 'Upcoming Events', path: '/admin/events/upcoming' },
                { label: 'Approved Events', path: '/admin/events/approved' },
                { label: 'Rejected Events', path: '/admin/events/rejected' },
            ]
        },
        {
            id: 'sponsors',
            label: 'Sponsor Handling',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            links: [
                { label: 'Manage Sponsorships', path: '/admin/sponsorships' }
            ]
        },
        {
            id: 'food',
            label: 'Food Stall Handling',
            icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
            links: [
                { label: 'Map Upload', path: '/admin/food/upload-map' },
                { label: 'Stall Bookings', path: '/admin/food/bookings' }
            ]
        },
        {
            id: 'artists',
            label: 'Artist Handling',
            icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
            links: [
                { label: 'Add/Manage Artists', path: '/admin/artists' },
                { label: 'Ratings Analyze', path: '/artists/analyze' }
            ]
        }
    ];

    const [unreadMessages, setUnreadMessages] = useState(0);

    React.useEffect(() => {
        if (!user) return;
        const fetchUnread = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/messages/unread-count', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUnreadMessages(data.count);
                }
            } catch (err) {
                console.error('Failed to fetch unread messages count', err);
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar glass-panel">
<<<<<<< HEAD

=======
            <div className="sidebar-header">
                <div className="logo-icon"></div>
                <div>
                    <span className="admin-role-badge">Admin Panel</span>
                </div>
            </div>
>>>>>>> kumuthu01
            <nav className="sidebar-nav">
                <ul>
                    {/* Standalone Dashboard Link */}
                    <li>
                        <Link to={dashboardItem.path} className={`nav-link ${currentPath === dashboardItem.path ? 'active' : ''}`}>
                            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dashboardItem.icon} />
                            </svg>
                            <span>{dashboardItem.label}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/messages" className={`nav-link ${currentPath === '/admin/messages' ? 'active' : ''}`} style={{ position: 'relative' }}>
                            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span>Inbox / Messages</span>
                            {unreadMessages > 0 && (
                                <span style={{ position: 'absolute', right: '15px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>
                                    {unreadMessages}
                                </span>
                            )}
                        </Link>
                    </li>

                    <li className="nav-divider"></li>

                    {/* Multi-Domain Accordion List */}
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
                                    {domain.links.length === 0 ? (
                                        <div className="empty-domain-notice">Coming Soon</div>
                                    ) : (
                                        <ul className="sub-nav-list">
                                            {domain.links.map(link => (
                                                <li key={link.path}>
                                                    <Link to={link.path} className={`sub-nav-link ${currentPath === link.path ? 'active' : ''}`}>
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
