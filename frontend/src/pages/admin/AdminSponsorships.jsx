import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminSponsorships.css';

const AdminSponsorships = () => {
    const [sponsorships, setSponsorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [selectedSlip, setSelectedSlip] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchSponsorships();
    }, []);

    const fetchSponsorships = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.get(`${API_URL}/api/sponsorship/all`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            if (res.data.success) {
                const data = res.data.sponsorships;
                setSponsorships(data);
                
                // Calculate stats
                const s = {
                    pending: data.filter(item => item.status === 'pending_review').length,
                    approved: data.filter(item => item.status === 'approved').length,
                    rejected: data.filter(item => item.status === 'rejected').length
                };
                setStats(s);
            }
        } catch (err) {
            console.error('Failed to fetch sponsorships:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this sponsorship application?`)) return;
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.patch(`${API_URL}/api/sponsorship/${id}/status`, 
                { status },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            
            if (res.data.success) {
                alert(`Sponsorship ${status} successfully!`);
                fetchSponsorships(); // Refresh list
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this sponsorship application? This cannot be undone.')) return;
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.delete(`${API_URL}/api/sponsorship/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            if (res.data.success) {
                alert('Application deleted successfully!');
                fetchSponsorships();
            }
        } catch (err) {
            console.error('Failed to delete:', err);
            alert('Failed to delete. Please try again.');
        }
    };

    const getPackageInfo = (type) => {
        const info = {
            bronze: { icon: '🥉', color: '#cd7f32', name: 'Bronze' },
            silver: { icon: '🥈', color: '#94a3b8', name: 'Silver' },
            gold: { icon: '🥇', color: '#f59e0b', name: 'Gold' },
            platinum: { icon: '💎', color: '#9333ea', name: 'Platinum' },
            diamond: { icon: '💠', color: '#0ea5e9', name: 'Diamond' }
        };
        return info[type] || { icon: '📦', color: '#64748b', name: type };
    };

    const filteredSponsorships = sponsorships.filter(item => {
        if (filter === 'all') return item.status !== 'pending_otp';
        if (filter === 'pending') return item.status === 'pending_review';
        return item.status === filter;
    });

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading sponsorship applications...</p>
            </div>
        );
    }

    return (
        <div className="admin-sponsorships animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title">Sponsorship Management</h1>
                <p className="page-main-subtitle">Review, approve, or reject sponsorship applications from partners.</p>
            </div>

            {/* Stat Cards */}
            <div className="sponsorship-stats">
                <div className="sponsorship-stat-card">
                    <div className="stat-icon-wrapper stat-icon-pending">⏳</div>
                    <div className="stat-info">
                        <span className="stat-count">{stats.pending}</span>
                        <span className="stat-label">Pending Review</span>
                    </div>
                </div>
                <div className="sponsorship-stat-card">
                    <div className="stat-icon-wrapper stat-icon-approved">✅</div>
                    <div className="stat-info">
                        <span className="stat-count">{stats.approved}</span>
                        <span className="stat-label">Approved Sponsors</span>
                    </div>
                </div>
                <div className="sponsorship-stat-card">
                    <div className="stat-icon-wrapper stat-icon-rejected">❌</div>
                    <div className="stat-info">
                        <span className="stat-count">{stats.rejected}</span>
                        <span className="stat-label">Rejected Applications</span>
                    </div>
                </div>
            </div>

            {/* Main List */}
            <div className="sponsorship-list-container">
                <div className="list-header">
                    <h2 className="list-title">Applications Dashboard</h2>
                    <div className="filter-group">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Active
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                <div className="sponsorship-grid">
                    {filteredSponsorships.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📂</span>
                            <h3>No applications found</h3>
                            <p>There are no sponsorship applications matching your current filter.</p>
                        </div>
                    ) : (
                        filteredSponsorships.map((item) => {
                            const pkg = getPackageInfo(item.packageType);
                            const isPending = item.status === 'pending_review';

                            return (
                                <div key={item._id} className="sponsorship-card">
                                    <div className="sponsor-main-info">
                                        <div className="package-badge" style={{ backgroundColor: pkg.color }}>
                                            <span className="package-icon">{pkg.icon}</span>
                                            <span>{pkg.name}</span>
                                        </div>
                                        <div className="sponsor-details">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3>{item.sponsorName}</h3>
                                                <button 
                                                    className="btn-delete-card" 
                                                    onClick={() => handleDelete(item._id)}
                                                    title="Delete Application"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                            <div className="sponsor-meta">
                                                <div className="meta-item">
                                                    📅 {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="meta-item" style={{ fontWeight: 700, color: '#10b981' }}>
                                                    💰 LKR {item.packageAmount?.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sponsor-contact-grid">
                                        <div className="contact-item">
                                            <span className="contact-label">Contact Person</span>
                                            <span className="contact-value">{item.contactPerson}</span>
                                        </div>
                                        <div className="contact-item">
                                            <span className="contact-label">Email</span>
                                            <span className="contact-value" style={{ fontSize: '0.8rem' }}>{item.sponsorEmail}</span>
                                        </div>
                                        <div className="contact-item">
                                            <span className="contact-label">Phone</span>
                                            <span className="contact-value">{item.phone}</span>
                                        </div>
                                        <div className="contact-item">
                                            <span className="contact-label">Status</span>
                                            <div className={`status-tag ${item.status === 'pending_review' ? 'pending' : item.status}`}>
                                                {item.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <button 
                                            className="btn-view-slip"
                                            onClick={() => setSelectedSlip(item.paymentSlip)}
                                        >
                                            📄 View Payment Slip
                                        </button>
                                        
                                        {isPending && (
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-approve"
                                                    onClick={() => handleUpdateStatus(item._id, 'approved')}
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    className="btn-reject"
                                                    onClick={() => handleUpdateStatus(item._id, 'rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Slip Preview Modal */}
            {selectedSlip && (
                <div className="slip-modal-overlay" onClick={() => setSelectedSlip(null)}>
                    <div className="slip-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Payment Slip Preview</h2>
                            <button className="btn-close" onClick={() => setSelectedSlip(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {selectedSlip.toLowerCase().endsWith('.pdf') ? (
                                <div className="pdf-preview">
                                    <div className="pdf-icon">📄</div>
                                    <p>This is a PDF document.</p>
                                    <a 
                                        href={`${API_URL}/uploads/slips/${selectedSlip}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-view-slip"
                                        style={{ background: '#7c3aed', color: 'white', border: 'none' }}
                                    >
                                        Open PDF in New Tab
                                    </a>
                                </div>
                            ) : (
                                <img 
                                    src={`${API_URL}/uploads/slips/${selectedSlip}`} 
                                    alt="Payment Slip" 
                                    className="slip-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/600x800?text=Slip+Image+Not+Found';
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSponsorships;
