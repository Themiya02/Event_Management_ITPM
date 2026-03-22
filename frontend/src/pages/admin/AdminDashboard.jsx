import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [recentEvents, setRecentEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
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
                            <div className="glass-panel admin-recent-card">
                                <div className="card-row-header">
                                    <h2 className="section-title">🕐 Registration Pipeline Highlights</h2>
                                    <Link to="/admin/events/upcoming" className="link-action">View All In Pipeline →</Link>
                                </div>
                                {recentEvents.length === 0 ? (
                                    <p className="empty-note">No requested events currently active. 🎉</p>
                                ) : (
                                    <div className="recent-list">
                                        {recentEvents.map(ev => (
                                            <div key={ev._id} className="recent-row">
                                                <div>
                                                    <p className="recent-name">{ev.name}</p>
                                                    <p className="recent-meta">By {ev.organizer?.name || 'Unknown'} · {new Date(ev.date).toLocaleDateString()}</p>
                                                </div>
                                                <Link to="/admin/events/upcoming" className="btn-sm-primary">Review Details</Link>
                                            </div>
                                        ))}
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
                            {allEvents.filter(e => e.status !== 'Rejected').length === 0 ? (
                                <p className="empty-note">No requested events currently active. 🎉</p>
                            ) : (
                                <div className="recent-list">
                                    {allEvents.filter(e => e.status !== 'Rejected').map(ev => (
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
                                                        onChange={(e) => handleUploadMap(ev._id, e)} 
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
