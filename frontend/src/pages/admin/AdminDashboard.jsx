import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [recentEvents, setRecentEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [approvedEventsList, setApprovedEventsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDomain, setActiveDomain] = useState('events');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const headers = { Authorization: `Bearer ${token}` };

                const [pendingRes, approvedRes, allRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/events/admin/pending`, { headers }),
                    axios.get(`${apiUrl}/api/events/approved`, { headers }),
                    axios.get(`${apiUrl}/api/events/admin/all`, { headers }).catch(() => ({ data: [] })),
                ]);

                const rejected = allRes.data.filter(e => e.status === 'Rejected');

                setStats({
                    pending: pendingRes.data.length,
                    approved: approvedRes.data.length,
                    rejected: rejected.length,
                });
                setRecentEvents(pendingRes.data.slice(0, 4));
                setAllEvents(allRes.data);
                setApprovedEventsList(approvedRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUploadMap = async (eventId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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

    const statCards = [
        { label: 'Pending Events', value: stats.pending, icon: '⏳', link: '/admin/events/upcoming', color: 'orange' },
        { label: 'Approved Events', value: stats.approved, icon: '✅', link: '/admin/events/approved', color: 'green' },
        { label: 'Rejected Events', value: stats.rejected, icon: '❌', link: '/admin/events/rejected', color: 'red' },
    ];

    const domains = [
        { id: 'events', label: 'Event Handling', icon: '📅' },
        { id: 'artists', label: 'Artist Handling', icon: '🎤' },
        { id: 'food', label: 'Food Stall Handling', icon: '🍔' },
        { id: 'sponsors', label: 'Sponsor Handling', icon: '🤝' },
    ];

    return (
        <div className="admin-dashboard animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title">Admin Dashboard</h1>
                <p className="page-main-subtitle">Manage campus nodes via isolated structural domains.</p>
            </div>

            {/* DOMAIN MACRO TOGGLES */}
            <div className="domain-toggles glass-panel">
                {domains.map(d => (
                    <button 
                        key={d.id}
                        className={`domain-tab ${activeDomain === d.id ? 'active' : ''}`}
                        onClick={() => setActiveDomain(d.id)}
                    >
                        <span className="domain-icon">{d.icon}</span>
                        {d.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-msg">Loading comprehensive server data arrays...</div>
            ) : (
                <div className="domain-content-wrapper">
                    
                    {/* DOMAIN 1: EVENT HANDLING (Legacy Dashboard) */}
                    {activeDomain === 'events' && (
                        <div className="animation-fade-in">
                            {/* Stat Cards */}
                            <div className="admin-stat-grid">
                                {statCards.map((card) => (
                                    <Link to={card.link} key={card.label} className={`admin-stat-card glass-panel stat-${card.color}`}>
                                        <div className="stat-emoji">{card.icon}</div>
                                        <div className="stat-text">
                                            <div className="stat-number">{card.value}</div>
                                            <div className="stat-name">{card.label}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Approval Workflow */}
                            <div className="glass-panel admin-workflow-card">
                                <h2 className="section-title">📋 Event Approval Workflow</h2>
                                <p className="section-subtitle">Every requested event must securely pass all 4 discrete stages before broad campus publication.</p>
                                <div className="workflow-row">
                                    {[
                                        { icon: '🛡️', title: 'Security Manager', desc: 'Safety & crowd control' },
                                        { icon: '🏥', title: 'Medical / Doctor', desc: 'Health & first aid' },
                                        { icon: '🌍', title: 'Community Officer', desc: 'Societal approval' },
                                        { icon: '🎓', title: 'Campus Dean', desc: 'Final sign-off' },
                                    ].map((s, i, arr) => (
                                        <React.Fragment key={s.title}>
                                            <div className="workflow-step">
                                                <div className="workflow-icon">{s.icon}</div>
                                                <div className="workflow-text">
                                                    <strong>{s.title}</strong>
                                                    <span>{s.desc}</span>
                                                </div>
                                            </div>
                                            {i < arr.length - 1 && <div className="workflow-arrow">→</div>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Pending Events */}
                            <div className="glass-panel admin-recent-card" style={{ padding: '2rem', marginTop: '2rem' }}>
                                <div className="card-row-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 className="section-title" style={{ margin: 0 }}>🕐 Registration Pipeline Highlights</h2>
                                    <Link to="/admin/events/upcoming" className="link-action">View All In Pipeline →</Link>
                                </div>
                                {recentEvents.length === 0 ? (
                                    <p className="empty-note">No requested events currently active. 🎉</p>
                                ) : (
                                    <div className="events-grid">
                                        {recentEvents.map(ev => {
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
                                                        <span className="reg-badge required">Review Pending</span>
                                                    </div>

                                                    <div className="card-content">
                                                        <h3>{ev.name}</h3>
                                                        <div className="org-name">
                                                            <span>👤 {ev.organizer?.name || 'Local Organizer'}</span>
                                                        </div>

                                                        <div className="card-details">
                                                            <div className="detail-item">
                                                                <span>📅</span> {month} {day}, {ev.time || 'TBD'}
                                                            </div>
                                                            <div className="detail-item">
                                                                <span>📍</span> {ev.location || 'TBA'}
                                                            </div>
                                                            <div className="detail-item">
                                                                <span>🎟️</span> {ev.isPaid ? `Rs ${ev.price}` : 'Free'}
                                                            </div>
                                                        </div>

                                                        <div className="card-actions">
                                                            <Link
                                                                to={`/admin/events/review/${ev._id}`}
                                                                className="btn-view-event"
                                                            >
                                                                Review Event
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* DOMAIN: FOOD STALL HANDLING */}
                    {activeDomain === 'food' && (
                        <div className="animation-fade-in glass-panel admin-recent-card">
                            <div className="card-row-header">
                                <h2 className="section-title">🍔 Food Stall Handling (Upcoming Events)</h2>
                            </div>
                            {allEvents.filter(e => e.status === 'Approved' || e.status === 'Pending').length === 0 ? (
                                <p className="empty-note">No approved or upcoming events available. 🎉</p>
                            ) : (
                                <div className="recent-list">
                                    {allEvents.filter(e => e.status === 'Approved' || e.status === 'Pending').map(ev => (
                                        <div key={ev._id} className="recent-row" style={{ alignItems: 'center' }}>
                                            <div>
                                                <p className="recent-name">{ev.name} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>({ev.status})</span></p>
                                                <p className="recent-meta">By {ev.organizer?.name || 'Unknown'} · {new Date(ev.date).toLocaleDateString()}</p>
                                                {ev.stallMapUrl && <span style={{ color: 'var(--success-color)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>✓ Map Available</span>}
                                            </div>
                                            <div>
                                                <label className="btn-sm-primary" style={{ cursor: 'pointer', margin: 0 }}>
                                                    {ev.stallMapUrl ? 'Update Map' : 'Upload Map'}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        style={{ display: 'none' }} 
                                                        onChange={(e) => {
                                                            // We call handleUploadMap as before
                                                            handleUploadMap(ev._id, e);
                                                            // Additionally locally update approvedEventsList just to reflect UI instantly
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const r = new FileReader();
                                                                r.onloadend = () => {
                                                                    setAllEvents(prev => prev.map(a => a._id === ev._id ? { ...a, stallMapUrl: r.result } : a));
                                                                }
                                                                r.readAsDataURL(file);
                                                            }
                                                        }} 
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BLANK PLACEHOLDER FOR UPCOMING DOMAINS */}
                    {activeDomain !== 'events' && activeDomain !== 'food' && (
                        <div className="glass-panel empty-domain-state animation-fade-in">
                            <span className="massive-icon">{domains.find(d => d.id === activeDomain)?.icon}</span>
                            <h2 className="empty-domain-title">{domains.find(d => d.id === activeDomain)?.label} Module</h2>
                            <p className="empty-domain-desc">This administrative sub-system infrastructure is currently pending provisioning.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
