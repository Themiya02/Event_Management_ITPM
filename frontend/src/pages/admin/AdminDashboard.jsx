import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: 'Pending Events', value: stats.pending, icon: '⏳', link: '/admin/events/upcoming', color: 'orange' },
        { label: 'Approved Events', value: stats.approved, icon: '✅', link: '/admin/events/approved', color: 'green' },
        { label: 'Rejected Events', value: stats.rejected, icon: '❌', link: '/admin/events/rejected', color: 'red' },
    ];

    return (
        <div className="admin-dashboard animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title">Admin Dashboard</h1>
                <p className="page-main-subtitle">Manage event approvals and monitor activity across the campus.</p>
            </div>

            {loading ? (
                <div className="loading-msg">Loading dashboard data...</div>
            ) : (
                <>
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
                        <h2 className="section-title">📋 Approval Workflow</h2>
                        <p className="section-subtitle">Every event must pass all 4 stages before it can be published.</p>
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
                            <h2 className="section-title">🕐 Pending Events</h2>
                            <Link to="/admin/events/upcoming" className="link-action">View All →</Link>
                        </div>
                        {recentEvents.length === 0 ? (
                            <p className="empty-note">No pending events. 🎉</p>
                        ) : (
                            <div className="recent-list">
                                {recentEvents.map(ev => (
                                    <div key={ev._id} className="recent-row">
                                        <div>
                                            <p className="recent-name">{ev.name}</p>
                                            <p className="recent-meta">By {ev.organizer?.name || 'Unknown'} · {new Date(ev.date).toLocaleDateString()}</p>
                                        </div>
                                        <Link to="/admin/events/upcoming" className="btn-sm-primary">Review</Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
