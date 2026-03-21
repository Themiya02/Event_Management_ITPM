import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EventListPage.css';

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
                <div className="simple-card-list">
                    {events.map(ev => (
                        <div key={ev._id} className="simple-event-card glass-panel">
                            <div className="sec-info">
                                <h3 className="sec-name">{ev.name}</h3>
                                <div className="sec-meta">
                                    <span>📅 {new Date(ev.date).toLocaleDateString()}</span>
                                    <span>📍 {ev.location}</span>
                                </div>
                                {ev.rejectionReason && (
                                    <div className="rejection-reason-box">
                                        <strong>Rejection Reason:</strong> {ev.rejectionReason}
                                    </div>
                                )}
                            </div>
                            <span className="status-tag rejected">✕ Rejected</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RejectedEvents;
