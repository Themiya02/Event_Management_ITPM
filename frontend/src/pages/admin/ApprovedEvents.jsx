import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EventListPage.css';

const ApprovedEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/events/approved`, {
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
                <h1 className="page-main-title">Approved Events</h1>
                <p className="page-main-subtitle">All events that have been fully approved and are live on the platform.</p>
            </div>

            {loading ? (
                <p className="loading-msg">Loading...</p>
            ) : events.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">✅</div>
                    <h3>No Approved Events Yet</h3>
                    <p>Approved events will appear here once organizer events are reviewed.</p>
                </div>
            ) : (
                <div className="simple-card-list">
                    {events.map(ev => (
                        <div key={ev._id} className="simple-event-card glass-panel">
                            <div className="sec-info">
                                <h3 className="sec-name">{ev.name}</h3>
                                <div className="sec-meta" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    <span style={{background: 'rgba(255,255,255,0.1)', padding:'0.2rem 0.6rem', borderRadius:'20px'}}>📅 {new Date(ev.date).toLocaleDateString()}</span>
                                    <span style={{background: 'rgba(255,255,255,0.1)', padding:'0.2rem 0.6rem', borderRadius:'20px'}}>📍 {ev.location}</span>
                                    
                                    <span className={`ticket-badge ${ev.isOpenRegistration ? 'required' : 'open'}`} style={{ marginLeft: 'auto' }}>
                                        {ev.isOpenRegistration ? '📝 Registration Required' : '🚪 Open Walk-in'}
                                    </span>

                                    <span className={`ticket-badge ${ev.isPaid ? 'paid' : 'free'}`}>
                                        {ev.isPaid ? `💳 Paid: Rs ${ev.price}` : '🎟️ Free Entry'}
                                    </span>
                                </div>
                                {ev.description && <p className="sec-desc">{ev.description}</p>}
                            </div>
                            <span className="status-tag approved">✓ Approved</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApprovedEvents;
