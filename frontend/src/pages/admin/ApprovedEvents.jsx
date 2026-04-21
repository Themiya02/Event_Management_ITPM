import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EventListPage.css';

const ApprovedEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredEvents = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="event-list-page animation-fade-in">
            <div className="page-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-main-title">Approved Events</h1>
                    <p className="page-main-subtitle">All events that have been fully approved and are live on the platform.</p>
                </div>

                <div className="search-wrapper" style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Search Approved Events..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            width: '250px'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>
            </div>

            {loading ? (
                <p className="loading-msg">Loading...</p>
            ) : filteredEvents.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">{searchTerm ? '🔍' : '✅'}</div>
                    <h3>{searchTerm ? 'No matching events' : 'No Approved Events Yet'}</h3>
                </div>
            ) : (
                <div className="simple-card-list">
                    {filteredEvents.map(ev => (
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
                                {ev.description && <p className="sec-desc" style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem' }}>{ev.description}</p>}
                            </div>
                            <span className="status-tag approved" style={{ marginTop: '1rem', display: 'inline-block', background: 'rgba(5, 150, 105, 0.1)', color: '#10b981', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' }}>✓ Approved</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApprovedEvents;
