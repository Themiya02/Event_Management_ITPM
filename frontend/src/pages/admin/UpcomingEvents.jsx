import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpcomingEvents.css';
import '../user/UserDashboard.css';

const UpcomingEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const getAuth = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return { token: user?.token, apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000' };
    };

    const fetchEvents = async () => {
        try {
            const { token, apiUrl } = getAuth();
            const res = await axios.get(`${apiUrl}/api/events/admin/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents(res.data);
        } catch (err) {
            console.error('Error fetching pending events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const filteredEvents = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="upcoming-page animation-fade-in">
            <div className="page-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-main-title">Upcoming Events</h1>
                    <p className="page-main-subtitle">Review pending events and grant stage-by-stage approvals.</p>
                </div>

                <div className="ud-search-wrapper" style={{ flex: 1, maxWidth: '400px', marginLeft: '2rem' }}>
                    <div className="ud-search-bar" style={{ padding: '4px 4px 4px 1.2rem', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                        <span className="ud-search-category">Search</span>
                        <input
                            type="text"
                            placeholder="Find upcoming events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.4rem 0' }}
                        />
                        <button className="ud-search-btn" style={{ padding: '0.5rem 1.2rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <p className="loading-msg">Loading events...</p>
            ) : filteredEvents.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">{searchTerm ? '🔍' : '🎉'}</div>
                    <h3>{searchTerm ? 'No matching events' : 'All Clear!'}</h3>
                    <p>{searchTerm ? 'Try a different search term.' : 'No events are pending approval right now.'}</p>
                </div>
            ) : (
                <div className="events-grid">
                    {filteredEvents.map(ev => {
                        const dateObj = new Date(ev.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate();

                        return (
                            <div key={ev._id} className="event-card glass-panel animation-fade-in">
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
                                            onClick={() => navigate(`/admin/events/review/${ev._id}`, { state: { event: ev } })}
                                            style={{background: 'var(--primary-gradient)'}}
                                        >
                                            Review Event Details
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

export default UpcomingEvents;
