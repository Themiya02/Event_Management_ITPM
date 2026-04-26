import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminEventsHandling = () => {
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [recentEvents, setRecentEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [approvedEventsList, setApprovedEventsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch stats and all events (summary mode) in parallel
                const [statsRes, allRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/events/admin/stats`, { headers }),
                    axios.get(`${apiUrl}/api/events/admin/all?summary=true`, { headers }),
                ]);

                const allData = allRes.data || [];
                setStats(statsRes.data);
                setAllEvents(allData);

                // Derive other lists locally to avoid extra network requests
                setRecentEvents(allData.filter(e => e.status.toLowerCase() === 'pending').slice(0, 4));
                setApprovedEventsList(allData.filter(e => e.status.toLowerCase() === 'approved'));
            } catch (err) {
                console.error('Failed to fetch event data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const rejectedEvents = allEvents.filter(e => e.status === 'Rejected');

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

    return (
        <div className="admin-dashboard animation-fade-in" style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto', width: '100%', minHeight: '100vh', marginTop: '80px' }}>
            {loading ? (
                <div className="loading-msg">Loading comprehensive server data arrays...</div>
            ) : (
                <div className="animation-fade-in" style={{ paddingBottom: '4rem' }}>
                    {/* Blue Hero Banner */}
                    <div className="search-hero-section" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: '20px', padding: '4rem 2rem 4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '30px 30px', opacity: 0.3 }} />
                        
                        <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                            Event Handling
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

                    {renderCards(allEvents, '🌐 All Events Directory', '/admin/events/all', 'Directory', 'open')}
                    {renderCards(recentEvents, '⏳ Upcoming Events (Pending)', '/admin/events/upcoming', 'Review Pending', 'required')}
                    {renderCards(approvedEventsList, '✅ Approved Events', '/admin/events/approved', 'Approved', 'open')}
                    {renderCards(rejectedEvents, '❌ Rejected Events', '/admin/events/rejected', 'Rejected', 'required')}

                </div>
            )}
        </div>
    );
};

export default AdminEventsHandling;
