import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EventListPage.css';
import '../user/UserDashboard.css';

const RejectedEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/events/admin/rejected?summary=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredEvents = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="event-list-page animation-fade-in">
            <div className="page-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-main-title">Rejected Events</h1>
                    <p className="page-main-subtitle">Events that were reviewed and not approved by the admin.</p>
                </div>

                <div className="ud-search-wrapper" style={{ flex: 1, maxWidth: '400px', marginLeft: '2rem' }}>
                    <div className="ud-search-bar" style={{ padding: '4px 4px 4px 1.2rem', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                        <span className="ud-search-category">Search</span>
                        <input
                            type="text"
                            placeholder="Find rejected events..."
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
                <p className="loading-msg">Loading...</p>
            ) : filteredEvents.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">{searchTerm ? '🔍' : '🚫'}</div>
                    <h3>{searchTerm ? 'No matching events' : 'No Rejected Events Yet'}</h3>
                </div>
            ) : (
                <div className="events-grid">
                    {filteredEvents.map(ev => {
                        const dateObj = new Date(ev.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate();

                        return (
                            <div key={ev._id} className="event-card glass-panel animation-fade-in" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <div className="card-img-wrapper">
                                    {ev.imageUrl ? (
                                        <img src={ev.imageUrl} alt={ev.name} style={{ filter: 'grayscale(0.5)' }} />
                                    ) : (
                                        <div className="placeholder-img" style={{ background: 'linear-gradient(135deg, #7f1d1d, #ef4444)' }}>
                                            <span>{ev.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <span className={`reg-badge required`}>
                                        ✕ Rejected
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
                                            <span>📅</span> {month} {day}, {ev.time || 'TBA'}
                                        </div>
                                        <div className="detail-item">
                                            <span>📍</span> {ev.location || 'TBA'}
                                        </div>
                                        <div className="detail-item">
                                            <span>🎟️</span> {ev.isPaid ? `Rs ${ev.price}` : 'Free'}
                                        </div>
                                    </div>

                                    {ev.rejectionReason && (
                                        <div style={{ marginTop: 'auto', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.85rem', color: '#ef4444' }}>
                                            <strong>Reason:</strong> {ev.rejectionReason}
                                        </div>
                                    )}

                                    <div className="card-actions" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
                                        <div className="btn-view-event" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', pointerEvents: 'none'}}>
                                            Rejected Event
                                        </div>
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

export default RejectedEvents;
