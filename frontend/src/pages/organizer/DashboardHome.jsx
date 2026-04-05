import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashboardHome.css';

const DashboardHome = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await axios.get(`${apiUrl}/api/events/organizer`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Calculate real stats
    const totalEvents = events.length;
    const activeAttendees = events.reduce((acc, ev) => acc + (ev.registrationsCount || 0), 0);
    const pendingEvents = events.filter(e => e.status?.toLowerCase() === 'pending').length;

    const stats = [
        { label: 'Total Events', value: totalEvents.toString(), trend: '+0%', isPositive: true },
        { label: 'Active Attendees', value: activeAttendees.toString(), trend: '+0%', isPositive: true },
        { label: 'Pending Events', value: pendingEvents.toString(), trend: '+0%', isPositive: true },
    ];

    const recentEvents = events.slice(0, 4).map(ev => ({
        id: ev._id,
        name: ev.name,
        date: new Date(ev.date).toLocaleDateString(),
        status: ev.status,
        attendees: ev.registrationsCount || 0
    }));

    return (
        <div className="dashboard-home">
            <div className="header-section">
                <div>
                    <h1 className="page-title">Welcome back, {user.name?.split(' ')[0] || 'Organizer'}! 👋</h1>
                    <p className="page-subtitle">Here is what's happening with your events today.</p>
                </div>
                <button className="create-btn" onClick={() => navigate('/organizer/create-event')}>
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Event
                </button>
            </div>

            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card glass-panel">
                        <h3 className="stat-label">{stat.label}</h3>
                        <div className="stat-value-row">
                            <span className="stat-value">{loading ? '...' : stat.value}</span>
                            <span className={`stat-trend ${stat.isPositive ? 'positive' : 'negative'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="stat-chart-mock"></div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content-grid">
                <div className="chart-section glass-panel">
                    <div className="section-header">
                        <h2>Activity Overview</h2>
                        <select className="filter-select">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="chart-placeholder">
                        {/* Simple CSS-based mock chart bars */}
                        <div className="bar-group"><div className="bar" style={{ height: '40%' }}></div></div>
                        <div className="bar-group"><div className="bar" style={{ height: '70%' }}></div></div>
                        <div className="bar-group"><div className="bar" style={{ height: '50%' }}></div></div>
                        <div className="bar-group"><div className="bar" style={{ height: '90%' }}></div></div>
                        <div className="bar-group"><div className="bar" style={{ height: '65%' }}></div></div>
                        <div className="bar-group"><div className="bar" style={{ height: '80%' }}></div></div>
                        <div className="bar-group"><div className="bar" style={{ height: '100%' }}></div></div>
                    </div>
                </div>

                <div className="recent-events-section glass-panel">
                    <div className="section-header">
                        <h2>Recent Events</h2>
                        <button className="view-all-btn" onClick={() => navigate('/organizer/events')}>View All</button>
                    </div>
                    <ul className="event-list">
                        {loading ? (
                            <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading events...</p>
                        ) : recentEvents.length > 0 ? (
                            recentEvents.map(event => (
                                <li key={event.id} className="event-item">
                                    <div className="event-info">
                                        <h4>{event.name}</h4>
                                        <p>{event.date}</p>
                                    </div>
                                    <div className="event-meta">
                                        <span className={`status-badge ${event.status.toLowerCase()}`}>{event.status}</span>
                                        <span className="attendee-count">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            {event.attendees}
                                        </span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>No events yet. Create one to get started!</p>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
