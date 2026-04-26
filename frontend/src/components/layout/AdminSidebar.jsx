import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const AdminSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [expandedAccordion, setExpandedAccordion] = useState(null);

    // Default expand the domain the user is currently inside
    const [expandedAccordion, setExpandedAccordion] = useState(() => {
        if (currentPath.includes('/admin/events/')) return 'events';
        if (currentPath.includes('/admin/artists') || currentPath.includes('/artists/analyze')) return 'artists';
        return null;
    });

    const toggleAccordion = (id) => {
        setExpandedAccordion(prev => (prev === id ? null : id));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchUnread = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
                const res = await fetch(`${apiUrl}/api/messages/unread-count`, {
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
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [user]);

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'solar:widget-5-bold-duotone',
            path: '/admin/dashboard',
            type: 'link'
        },
        {
            id: 'messages',
            label: 'Inbox',
            icon: 'solar:letter-bold-duotone',
            path: '/admin/messages',
            type: 'link',
            badge: unreadMessages
        },
        {
            id: 'events',
            label: 'Event Handling',
            icon: 'solar:calendar-bold-duotone',
            type: 'accordion',
            links: [
                { label: 'Upcoming Events', path: '/admin/events/upcoming' },
                { label: 'Approved Events', path: '/admin/events/approved' },
                { label: 'Rejected Events', path: '/admin/events/rejected' }
            ]
        },
        {
            id: 'sponsors',
            label: 'Sponsor Handling',
            icon: 'solar:hand-money-bold-duotone',
            type: 'accordion',
            links: [
                { label: 'Manage Sponsorships', path: '/admin/sponsorships' }
            ]
        },
        {
            id: 'food',
            label: 'Food Stall Handling',
            icon: 'solar:shop-bold-duotone',
            type: 'accordion',
            links: [
                { label: 'Map Upload', path: '/admin/food/upload-map' },
                { label: 'Stall Bookings', path: '/admin/food/bookings' }
            ]
        },
        {
            id: 'artists',
            label: 'Artist Handling',
            icon: 'solar:music-library-bold-duotone',
            type: 'accordion',
            links: [
                { label: 'Add/Manage Artists', path: '/admin/artists' },
                { label: 'Ratings Analyze', path: '/artists/analyze' },
                { label: 'Analytical Report', path: '/admin/artists/analytics' }
            ]
        },
        {
            id: 'profile',
            label: 'Admin Profile',
            icon: 'solar:user-circle-bold-duotone',
            path: '/admin/profile',
            type: 'link'
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Icon icon="solar:bolt-circle-bold-duotone" width="32" height="32" />
                </div>
                <div>
                    <div className="brand-name">Eventio</div>
                    <span className="role-badge">Admin Panel</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => {
                        if (item.type === 'link') {
                            return (
                                <li key={item.id}>
                                    <Link to={item.path} className={`nav-link ${currentPath === item.path ? 'active' : ''}`}>
                                        <Icon icon={item.icon} className="nav-icon" />
                                        <span>{item.label}</span>
                                        {item.badge > 0 && <span className="unread-badge">{item.badge}</span>}
                                    </Link>
                                </li>
                            );
                        }

                        const isExpanded = expandedAccordion === item.id;
                        const hasActiveChild = item.links.some(link => currentPath === link.path);

                        return (
                            <li key={item.id} className="nav-accordion-group">
                                <div
                                    className={`nav-accordion-header ${hasActiveChild && !isExpanded ? 'child-active' : ''}`}
                                    onClick={() => toggleAccordion(item.id)}
                                >
                                    <div className="accordion-title-flex">
                                        <Icon icon={item.icon} className="nav-icon" />
                                        <span>{item.label}</span>
                                    </div>
                                    <Icon icon="solar:alt-arrow-down-bold" className={`chevron ${isExpanded ? 'rotated' : ''}`} />
                                </div>

                                <div className={`nav-accordion-content ${isExpanded ? 'expanded' : ''}`}>
                                    <ul className="sub-nav-list">
                                        {item.links.map(link => (
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
                    <Icon icon="solar:logout-bold-duotone" className="nav-icon" />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
