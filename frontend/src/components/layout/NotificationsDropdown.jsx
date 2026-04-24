import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './NotificationsDropdown.css';

const NotificationsDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const { user } = useAuth();
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/notifications`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setNotifications(response.data);
                setUnreadCount(response.data.filter(n => !n.isRead).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [user, apiUrl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${apiUrl}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put(`${apiUrl}/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const handleView = (notif, e) => {
        e.stopPropagation();
        if (!notif.isRead) handleMarkAsRead(notif._id);
        
        // Navigation logic based on type and role
        if (notif.type === 'new_message') {
            navigate(user.role === 'admin' ? '/admin/messages' : '/organizer/support');
        } else if (notif.type === 'registration_received') {
            navigate('/organizer/registered-users');
        } else if (notif.type.includes('event')) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'organizer') navigate('/organizer');
            else navigate(`/events/${notif.relatedId}`);
        } else {
            navigate('/dashboard');
        }
        setIsOpen(false);
    };

    const displayedNotifications = activeTab === 'all' 
        ? notifications 
        : notifications.filter(n => !n.isRead);

    return (
        <div className="notifications-wrapper" ref={dropdownRef}>
            <button className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="notifications-header-wrapper">
                        <div className="notifications-header">
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                    Mark all as read
                                </button>
                            )}
                        </div>
                        <div className="notifications-tabs">
                            <button 
                                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All Notifications
                            </button>
                            <button 
                                className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
                                onClick={() => setActiveTab('unread')}
                            >
                                Unread
                            </button>
                        </div>
                    </div>
                    
                    <div className="notifications-list">
                        {displayedNotifications.length === 0 ? (
                            <div className="no-notifications">
                                {activeTab === 'unread' ? 'No unread notifications' : 'No new notifications'}
                            </div>
                        ) : (
                            displayedNotifications.map(notif => {
                                // Generate a simple avatar based on type
                                let avatarName = 'System';
                                let showViewBtn = true;
                                if (notif.type.includes('event')) avatarName = 'Eventio Admin';
                                if (notif.type.includes('message')) avatarName = 'Support';
                                if (notif.type.includes('registration')) avatarName = 'Organizer';

                                return (
                                    <div 
                                        key={notif._id} 
                                        className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                        onClick={() => {
                                            if (!notif.isRead) handleMarkAsRead(notif._id);
                                        }}
                                    >
                                        <div className="notification-avatar-wrapper">
                                            <img src={`https://ui-avatars.com/api/?name=${avatarName}&background=random&color=fff&rounded=true`} alt="Avatar" className="notification-avatar" />
                                            {!notif.isRead && <span className="unread-indicator"></span>}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-text">
                                                <strong>{avatarName}</strong> {notif.message}
                                            </p>
                                            <span className="notification-time">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {showViewBtn && (
                                                <div className="notification-actions">
                                                    <button className="notif-btn-secondary" onClick={(e) => handleView(notif, e)}>View</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="notification-options">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
