import React, { useState, useEffect, useRef } from 'react';
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
                <div className="notifications-dropdown glass-panel">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">No new notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif._id} 
                                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                    onClick={() => {
                                        if (!notif.isRead) handleMarkAsRead(notif._id);
                                    }}
                                >
                                    <div className="notification-icon">
                                        {notif.type === 'new_message' && '💬'}
                                        {notif.type === 'event_created' && '📅'}
                                        {notif.type === 'event_approved' && '✅'}
                                        {notif.type === 'event_rejected' && '❌'}
                                        {notif.type === 'system' && '🔔'}
                                    </div>
                                    <div className="notification-content">
                                        <p>{notif.message}</p>
                                        <span className="notification-time">
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {!notif.isRead && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
