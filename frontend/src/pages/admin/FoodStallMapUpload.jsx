import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpcomingEvents.css';
import '../user/UserDashboard.css';

const FoodStallMapUpload = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuth = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return { token: user?.token, apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000' };
    };

    const fetchEvents = async () => {
        try {
            const { token, apiUrl } = getAuth();
            // Fetch all events, similar to what we do in AdminDashboard.jsx
            const res = await axios.get(`${apiUrl}/api/events/admin/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Let's filter out Rejected ones
            setAllEvents(res.data.filter(e => e.status !== 'Rejected'));
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleUploadMap = async (eventId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const { token, apiUrl } = getAuth();
                await axios.patch(`${apiUrl}/api/events/admin/${eventId}/stall-map`, {
                    stallMapUrl: reader.result
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setAllEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, stallMapUrl: reader.result } : ev));
                alert('Food stall map uploaded successfully!');
            } catch (error) {
                console.error('Failed to upload map', error);
                alert('Failed to upload map');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="upcoming-page animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title">Food Stall Map Upload</h1>
                <p className="page-main-subtitle">Upload spatial blueprints for upcoming events allowing vendors to lock-in containers.</p>
            </div>

            {loading ? (
                <p className="loading-msg">Loading events...</p>
            ) : allEvents.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">🎉</div>
                    <h3>No Active Events</h3>
                    <p>There are currently no upcoming approved or pending events to upload maps for.</p>
                </div>
            ) : (
                <div className="events-grid">
                    {allEvents.map(ev => {
                        const dateObj = new Date(ev.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate();

                        return (
                            <div key={ev._id} className="event-card glass-panel animation-fade-in">
                                <div className="card-img-wrapper" style={{ height: '160px' }}>
                                    {ev.imageUrl ? (
                                        <img src={ev.imageUrl} alt={ev.name} />
                                    ) : (
                                        <div className="placeholder-img">
                                            <span>{ev.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="card-content">
                                    <h3 style={{ marginBottom: '0.2rem' }}>{ev.name}</h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>{ev.status}</span>
                                    </div>
                                    
                                    <div className="card-details">
                                        <div className="detail-item">
                                            <span>📅</span> {month} {day}, {ev.time}
                                        </div>
                                        <div className="detail-item" style={{ marginBottom: '1rem' }}>
                                            <span>📍</span> {ev.location}
                                        </div>
                                        {ev.stallMapUrl ? (
                                            <div style={{ color: 'var(--success-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                                ✓ Map Uploaded
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                ❌ No Map Uploaded
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-actions" style={{ marginTop: '1.5rem' }}>
                                        <label 
                                            className="btn-view-event"
                                            style={{
                                                background: ev.stallMapUrl ? 'transparent' : 'var(--primary-gradient)',
                                                border: ev.stallMapUrl ? '1px solid var(--primary-color)' : 'none',
                                                color: 'var(--text-color)',
                                                cursor: 'pointer',
                                                display: 'block',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {ev.stallMapUrl ? 'Update Blueprint Map' : 'Upload Blueprint Map'}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                style={{ display: 'none' }} 
                                                onChange={(e) => handleUploadMap(ev._id, e)} 
                                            />
                                        </label>
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

export default FoodStallMapUpload;
