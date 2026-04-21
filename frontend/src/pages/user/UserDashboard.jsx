import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('register'); // 'register' or 'open'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const localUser = JSON.parse(localStorage.getItem('user'));
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                
                const [eventsRes, ticketsRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/events/approved`, { headers: { Authorization: `Bearer ${localUser?.token}` } }),
                    axios.get(`${apiUrl}/api/events/my-registrations`, { headers: { Authorization: `Bearer ${localUser?.token}` } })
                ]);
                
                setEvents(eventsRes.data);
                setTickets(ticketsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading-state">Loading Global Event Feed...</div>;

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'register' ? e.isOpenRegistration : !e.isOpenRegistration;
        return matchesSearch && matchesTab;
    });

    const totalEvents = events.length;
    const openEventsCount = events.filter(e => !e.isOpenRegistration).length;
    const mySeats = tickets.length;

    const stats = [
        { label: 'Active Campus Events', value: totalEvents, trend: 'Live', isPositive: true },
        { label: 'My Registered Events', value: mySeats, trend: mySeats > 0 ? 'Confirmed' : 'None yet', isPositive: mySeats > 0 },
        { label: 'Open Entry Events', value: openEventsCount, trend: 'Free walk-ins', isPositive: true },
    ];

    return (
        <div className="user-dashboard animation-fade-in">
            <div className="header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
                    <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>Discover exactly what's happening around campus today.</p>
                </div>
                <button className="btn-sm-primary" onClick={() => navigate('/user/tickets')} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, background: 'var(--primary-gradient)', border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(167, 139, 250, 0.4)' }}>
                    🎟️ My Registered Events
                </button>
            </div>

            {/* Injected Premium Stats Grid mirroring Organizer Dashboard */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <h3 className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>{stat.label}</h3>
                        <div className="stat-value-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                            <span className="stat-value" style={{ fontSize: '2.5rem', fontWeight: '800', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {loading ? '...' : stat.value}
                            </span>
                            <span className={`stat-trend ${stat.isPositive ? 'positive' : 'negative'}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem', borderRadius: '20px', background: stat.isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: stat.isPositive ? '#10b981' : '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="stat-chart-mock" style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '100px', height: '60px', opacity: 0.1, background: 'var(--primary-gradient)', filter: 'blur(20px)' }}></div>
                    </div>
                ))}
            </div>

            {/* DUAL TOGGLE FEED CHANGER */}
            <div className="feed-toggle-container glass-panel">
                <button 
                    className={`toggle-btn ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                >
                    🎫 Registration Events
                </button>
                <button 
                    className={`toggle-btn ${activeTab === 'open' ? 'active' : ''}`}
                    onClick={() => setActiveTab('open')}
                >
                    🚪 Open Events (Walk-in)
                </button>
            </div>

            <div className="feed-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                    {activeTab === 'register' ? 'Upcoming Registration Events' : 'Upcoming Open Events'}
                </h2>
                
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Search event name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: '50px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--glass-bg)',
                            color: 'var(--text-color)',
                            width: '250px',
                            fontSize: '0.9rem'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>No events found! 🔍</h2>
                    <p>Try searching for a different event name or check back later.</p>
                </div>
            ) : (
                <div className="events-grid">
                    {filteredEvents.map(ev => {
                        const dateObj = new Date(ev.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate();

                        return (
                            <div key={ev._id} className="event-card glass-panel">
                                <div className="card-img-wrapper">
                                    {ev.imageUrl ? (
                                        <img src={ev.imageUrl} alt={ev.name} />
                                    ) : (
                                        <div className="placeholder-img">
                                            <span>{ev.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <span className={`reg-badge ${ev.isOpenRegistration ? 'required' : 'open'}`}>
                                        {ev.isOpenRegistration ? 'Register Required' : 'Register Not Required'}
                                    </span>
                                </div>
                                
                                <div className="card-content">
                                    <h3>{ev.name}</h3>
                                    <div className="org-name">
                                        <span>👤 {ev.organizer?.name || 'Local Organizer'}</span>
                                        {ev.artistName && <span style={{ marginLeft: '1rem' }}>🎤 {ev.artistName}</span>}
                                    </div>
                                    
                                    <div className="card-details">
                                        <div className="detail-item">
                                            <span>📅</span> {month} {day}, {ev.time}
                                        </div>
                                        <div className="detail-item">
                                            <span>📍</span> {ev.location}
                                        </div>
                                        <div className="detail-item">
                                            <span>🎟️</span> {ev.isPaid ? `Rs ${ev.price}` : 'Free'}
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <button 
                                            className="btn-view-event"
                                            onClick={() => navigate(`/dashboard/event/${ev._id}`)}
                                        >
                                            {ev.isOpenRegistration ? 'Register Now' : 'View Details'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
