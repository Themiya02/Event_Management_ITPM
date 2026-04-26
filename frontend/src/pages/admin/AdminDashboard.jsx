import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
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
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
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
                    total: allRes.data.length
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
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
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
        <AdminLayout>
            <div className="admin-dashboard animation-fade-in" style={{ paddingLeft: '0', paddingRight: '1.5rem' }}>

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
                    
                    {/* DOMAIN 1: EVENT HANDLING (Premium Dashboard View) */}
                    {activeDomain === 'events' && (
                        <div className="animation-fade-in" style={{ paddingBottom: '4rem' }}>
                            {/* Blue Hero Banner */}
                            <div className="search-hero-section" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: '20px', padding: '3.5rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '30px 30px', opacity: 0.3 }} />
                                
                                <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                                    Welcome Admin
                                </h1>
                                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', position: 'relative', zIndex: 1 }}>
                                    Your central hub for monitoring and managing all campus events.
                                </p>

                                {/* Glowing Search Bar */}
                                <div className="glowing-search-wrapper">
                                    <div className="glowing-search-bar">
                                        <div className="glowing-search-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                        </div>
                                        <input type="text" placeholder="Search across all events..." />
                                        <button className="glowing-search-btn">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Stat Cards for Counts */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                                <Link to="/admin/events/all" className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s', textDecoration: 'none', borderTop: '4px solid #3b82f6' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stats.total || 0}</div>
                                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>All Events</div>
                                </Link>

                                <Link to="/admin/events/upcoming" className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s', textDecoration: 'none', borderTop: '4px solid #f59e0b' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stats.pending || 0}</div>
                                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>Upcoming (Pending)</div>
                                </Link>

                                <Link to="/admin/events/approved" className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s', textDecoration: 'none', borderTop: '4px solid #10b981' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stats.approved || 0}</div>
                                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>Approved Events</div>
                                </Link>

                                <Link to="/admin/events/rejected" className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.3s', textDecoration: 'none', borderTop: '4px solid #ef4444' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stats.rejected || 0}</div>
                                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>Rejected Events</div>
                                </Link>
                            </div>

                            {/* Render Event Grids Below the Stat Cards */}
                            {(() => {
                                const renderCards = (eventsList, title, linkPath, badgeText, badgeClass) => (
                                    <div style={{ marginTop: '4rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{title}</h2>
                                            <Link to={linkPath} style={{ color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                View All <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                            </Link>
                                        </div>
                                        
                                        {eventsList.length === 0 ? (
                                            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No events found in this category.
                                            </div>
                                        ) : (
                                            <div className="events-grid">
                                                {eventsList.slice(0, 4).map(ev => {
                                                    const dateObj = new Date(ev.date);
                                                    const month = dateObj.toLocaleString('default', { month: 'short' });
                                                    const day = dateObj.getDate();

                                                    return (
                                                        <div key={ev._id} className="event-card glass-panel" style={{ border: badgeClass === 'required' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)' }}>
                                                            <div className="card-img-wrapper">
                                                                {ev.imageUrl ? (
                                                                    <img src={ev.imageUrl} alt={ev.name} style={badgeClass === 'required' ? { filter: 'grayscale(0.5)' } : {}} />
                                                                ) : (
                                                                    <div className="placeholder-img" style={badgeClass === 'required' ? { background: 'linear-gradient(135deg, #7f1d1d, #ef4444)' } : {}}>
                                                                        <span>{ev.name.charAt(0)}</span>
                                                                    </div>
                                                                )}
                                                                <span className={`reg-badge ${badgeClass}`}>{badgeText}</span>
                                                            </div>

                                                            <div className="card-content">
                                                                <h3>{ev.name}</h3>
                                                                <div className="org-name">
                                                                    <span>👤 {ev.organizer?.name || 'Local Organizer'}</span>
                                                                </div>

                                                                <div className="card-details">
                                                                    <div className="detail-item">
                                                                        <span>📅</span> {month} {day}, {ev.time || 'TBA'}
                                                                    </div>
                                                                    <div className="detail-item">
                                                                        <span>📍</span> {ev.location || 'TBA'}
                                                                    </div>
                                                                </div>

                                                                <div className="card-actions">
                                                                    <Link to={`/admin/events/review/${ev._id}`} className="btn-view-event" style={badgeClass === 'required' ? { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } : badgeClass === 'open' ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' } : {}}>
                                                                        {badgeClass === 'required' ? 'Review Rejected' : badgeClass === 'open' ? 'Review Approved' : 'Review Event'}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );

                                const rejectedEvents = allEvents.filter(e => e.status === 'Rejected');

                                return (
                                    <>
                                        {renderCards(allEvents, '🌐 All Events Directory', '/admin/events/all', 'Directory', 'open')}
                                        {renderCards(recentEvents, '⏳ Upcoming Events (Pending)', '/admin/events/upcoming', 'Review Pending', 'required')}
                                        {renderCards(approvedEventsList, '✅ Approved Events', '/admin/events/approved', 'Approved', 'open')}
                                        {renderCards(rejectedEvents, '❌ Rejected Events', '/admin/events/rejected', 'Rejected', 'required')}
                                    </>
                                );
                            })()}

                        </div>
                    )}

                    {/* DOMAIN: FOOD STALL HANDLING */}
                    {activeDomain === 'food' && (
                        <div className="admin-food-domain animation-fade-in">
                            <header className="admin-food-hero">
                                <span className="admin-food-kicker">Food operations</span>
                                <h2 className="admin-food-title">Food stall handling</h2>
                                <p className="admin-food-desc">
                                    Manage blueprint maps, stall pricing, vendor bank details, and booking approvals in one place.
                                </p>
                                <div className="admin-food-quick-links">
                                    <Link to="/admin/food/upload-map" className="admin-food-btn admin-food-btn-primary">
                                        Map &amp; stall pricing
                                    </Link>
                                    <Link to="/admin/food/bookings" className="admin-food-btn admin-food-btn-secondary">
                                        Stall bookings
                                    </Link>
                                </div>
                            </header>

                            <section className="admin-food-section" aria-labelledby="admin-food-events-heading">
                                <div className="admin-food-section-head">
                                    <h3 id="admin-food-events-heading" className="admin-food-section-title">
                                        Upcoming &amp; approved events
                                    </h3>
                                    <p className="admin-food-section-sub">
                                        Configure each event on the map screen — add stalls, prices, and layout images.
                                    </p>
                                </div>
                                {allEvents.filter((e) => e.status === 'Approved' || e.status === 'Pending').length === 0 ? (
                                    <div className="admin-food-empty">
                                        <span className="admin-food-empty-icon" aria-hidden>🍔</span>
                                        <p className="admin-food-empty-title">No events to configure</p>
                                        <p className="admin-food-empty-text">
                                            When events are pending or approved, they will appear here for food stall setup.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="admin-food-grid">
                                        {allEvents
                                            .filter((e) => e.status === 'Approved' || e.status === 'Pending')
                                            .map((ev) => {
                                                const stallCount = (ev.stallPricing || []).length;
                                                const hasMap = Boolean(ev.stallMapUrl);
                                                return (
                                                    <article key={ev._id} className="admin-food-card">
                                                        <div className="admin-food-card-top">
                                                            <h4 className="admin-food-card-title">{ev.name}</h4>
                                                            <span
                                                                className={`admin-food-pill admin-food-pill--${ev.status === 'Approved' ? 'approved' : 'pending'}`}
                                                            >
                                                                {ev.status}
                                                            </span>
                                                        </div>
                                                        <p className="admin-food-card-meta">
                                                            <span>{ev.organizer?.name || 'Unknown organizer'}</span>
                                                            <span className="admin-food-card-dot" aria-hidden>
                                                                ·
                                                            </span>
                                                            <span>{new Date(ev.date).toLocaleDateString()}</span>
                                                        </p>
                                                        <div className="admin-food-card-tags">
                                                            <span
                                                                className={
                                                                    hasMap
                                                                        ? 'admin-food-tag admin-food-tag--ok'
                                                                        : 'admin-food-tag admin-food-tag--warn'
                                                                }
                                                            >
                                                                {hasMap ? 'Map uploaded' : 'Map needed'}
                                                            </span>
                                                            <span className="admin-food-tag admin-food-tag--neutral">
                                                                {stallCount > 0
                                                                    ? `${stallCount} stall${stallCount === 1 ? '' : 's'} priced`
                                                                    : 'No stall prices'}
                                                            </span>
                                                        </div>
                                                        <div className="admin-food-card-actions">
                                                            <Link
                                                                to="/admin/food/upload-map"
                                                                className="admin-food-card-cta"
                                                            >
                                                                Configure
                                                            </Link>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* DOMAIN: SPONSOR HANDLING */}
                    {activeDomain === 'sponsors' && (
                        <div className="animation-fade-in glass-panel admin-recent-card">
                            <div className="card-row-header">
                                <h2 className="section-title">🤝 Sponsor & Partnership Management</h2>
                                <Link to="/admin/sponsorships" className="link-action">Go to Management Portal →</Link>
                            </div>
                            <div className="workflow-row" style={{ marginTop: '1rem', paddingBottom: '0' }}>
                                <div className="workflow-step" style={{ flex: 1 }}>
                                    <div className="workflow-icon">📋</div>
                                    <div className="workflow-text">
                                        <strong>Review Applications</strong>
                                        <span>Verify details and documents</span>
                                    </div>
                                </div>
                                <div className="workflow-step" style={{ flex: 1 }}>
                                    <div className="workflow-icon">📄</div>
                                    <div className="workflow-text">
                                        <strong>Validate Slips</strong>
                                        <span>Ensure payments are genuine</span>
                                    </div>
                                </div>
                                <div className="workflow-step" style={{ flex: 1 }}>
                                    <div className="workflow-icon">🤝</div>
                                    <div className="workflow-text">
                                        <strong>Manage Partners</strong>
                                        <span>Build long-term relationships</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Access the dedicated portal to manage all incoming sponsorship requests.</p>
                                <Link to="/admin/sponsorships" className="btn-sm-primary" style={{ padding: '0.8rem 2rem' }}>Open Sponsorship Portal</Link>
                            </div>
                        </div>
                    )}

                    {/* BLANK PLACEHOLDER FOR UPCOMING DOMAINS */}
                    {activeDomain !== 'events' && activeDomain !== 'food' && activeDomain !== 'sponsors' && (
                        <div className="glass-panel empty-domain-state animation-fade-in">
                            <span className="massive-icon">{domains.find(d => d.id === activeDomain)?.icon}</span>
                            <h2 className="empty-domain-title">{domains.find(d => d.id === activeDomain)?.label} Module</h2>
                            <p className="empty-domain-desc">This administrative sub-system infrastructure is currently pending provisioning.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </AdminLayout>
    );
};

export default AdminDashboard;
