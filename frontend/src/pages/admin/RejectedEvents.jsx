import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EventListPage.css';
import '../user/UserDashboard.css';

const RejectedEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/events/admin/rejected`, {
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

    return (
        <div className="event-list-page animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title">Rejected Events</h1>
                <p className="page-main-subtitle">Events that were reviewed and not approved by the admin.</p>
            </div>

            {loading ? (
                <p className="loading-msg">Loading...</p>
            ) : events.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">🚫</div>
                    <h3>No Rejected Events</h3>
                    <p>Any events you reject will appear here.</p>
                </div>
            ) : (
                <div className="events-grid">
                    {events.map(ev => {
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
                                    <span className="reg-badge" style={{ background: '#ef4444', color: 'white' }}>
                                        ✕ Rejected
                                    </span>
                                </div>
                                
                                <div className="card-content">
                                    <h3>{ev.name}</h3>
                                    <div className="org-name">
                                        <span>👤 {ev.organizer?.name || 'Local Organizer'}</span>
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

                                    <div className="card-actions" style={{ flexDirection: 'column', alignItems: 'flex-start', background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', marginTop: '0.5rem', width: '100%' }}>
                                        <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Rejection Reason</span>
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{ev.rejectionReason || 'No specific reason provided.'}</span>
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
