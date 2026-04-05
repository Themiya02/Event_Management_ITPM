import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../user/UserDashboard.css';
import './UpcomingEvents.css';

const ApprovedEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        <div className="upcoming-page animation-fade-in">
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
                                    <span className={`reg-badge ${ev.isOpenRegistration ? 'required' : 'open'}`}>
                                        {ev.isOpenRegistration ? 'Register Required' : 'Register Not Required'}
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

                                    <div className="card-actions" style={{justifyContent: 'center'}}>
                                        <span className="status-tag" style={{background: 'rgba(5, 150, 105, 0.1)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.3)'}}>
                                            ✓ Approved
                                        </span>
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

export default ApprovedEvents;
