import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MyTickets = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const localUser = JSON.parse(localStorage.getItem('user'));
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                
                const res = await axios.get(`${apiUrl}/api/events/my-registrations`, {
                    headers: { Authorization: `Bearer ${localUser?.token}` }
                });
                setTickets(res.data);
            } catch (error) {
                console.error('Failed to load tickets', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) return <div className="loading-state">Loading your reserved tickets...</div>;

    return (
        <div className="user-dashboard animation-fade-in" style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="feed-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-main-title">My Registered Events</h1>
                <p className="page-main-subtitle">Manage your reserved seats and past event attendances.</p>
            </div>

            {tickets.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>No Registered Events Found 🎫</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't registered for any upcoming events yet.</p>
                    <button className="btn-sm-primary" onClick={() => navigate('/dashboard')}>
                        Browse Events
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tickets.map((t) => {
                        const ev = t.event;
                        if (!ev) return null;
                        
                        const dateObj = new Date(ev.date);
                        const dateStr = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });

                        return (
                            <div key={t._id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: 'var(--primary-gradient)', flexShrink: 0 }}>
                                    {ev.imageUrl ? (
                                        <img src={ev.imageUrl} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                                            {ev.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{ev.name}</h3>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem' }}>
                                        <span>📅 {dateStr} at {ev.time}</span>
                                        <span>📍 {ev.location}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', padding: '0.4rem 0.8rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '6px', display: 'inline-block', color: 'var(--accent-purple)' }}>
                                        Registered as: <strong>{t.participantName || user?.name}</strong> (ID: {t.campusId || 'N/A'})
                                    </div>
                                    <div style={{ marginTop: '0.8rem' }}>
                                        <span className={`status-badge status-${(t.status || 'pending').toLowerCase()}`} style={{
                                            padding: '0.4rem 0.8rem', 
                                            borderRadius: '20px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 'bold',
                                            background: t.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : t.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                            color: t.status === 'Approved' ? '#10b981' : t.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                                            border: `1px solid ${t.status === 'Approved' ? 'rgba(16, 185, 129, 0.3)' : t.status === 'Rejected' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                        }}>
                                            Status: {t.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <button className="btn-sm-outline" onClick={() => navigate(`/dashboard/event/${ev._id}`)}>
                                        View Event
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyTickets;
