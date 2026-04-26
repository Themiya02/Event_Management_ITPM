import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './RegisteredUsers.css';

const RegisteredUsers = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
                const response = await axios.get(`${apiUrl}/api/events/organizer/registrations`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRegistrations(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch registrations');
                setLoading(false);
            }
        };

        if (token) {
            fetchRegistrations();
        }
    }, [token]);

    const handleStatusChange = async (id, status) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            await axios.patch(`${apiUrl}/api/events/registrations/${id}/status`, { status }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRegistrations(registrations.map(reg => reg._id === id ? { ...reg, status } : reg));
        } catch (err) {
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDownload = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'payment-receipt.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading image:', error);
            window.open(url, '_blank');
        }
    };

    if (loading) return (
        <div className="registered-users-container animation-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loading-spinner">Loading registrations...</div>
        </div>
    );
    
    if (error) return (
        <div className="registered-users-container animation-fade-in">
            <div className="error-card glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                <h3>Error Loading Data</h3>
                <p>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="registered-users-container animation-fade-in" style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <div className="page-header-block" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Registration Hub</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Review and manage all attendee registrations for your events.</p>
            </div>

            <div className="table-responsive glass-panel" style={{ padding: '1rem', borderRadius: '24px' }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr style={{ background: 'transparent' }}>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Attendee</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Event</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Campus ID</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Year</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Payment</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                    No registrations found in the database.
                                </td>
                            </tr>
                        ) : (
                            registrations.map((reg) => (
                                <tr key={reg._id} className="table-row-hover" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                    <td style={{ padding: '1.2rem', fontWeight: 600 }}>{reg.participantName}</td>
                                    <td style={{ padding: '1.2rem' }}>{reg.event?.name}</td>
                                    <td style={{ padding: '1.2rem' }}><code>{reg.campusId}</code></td>
                                    <td style={{ padding: '1.2rem' }}>{reg.campusYear}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        {reg.event?.isPaid ? (
                                            <span className="badge badge-paid" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Rs. {reg.event?.price}</span>
                                        ) : (
                                            <span className="badge badge-free" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>Free</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span className={`status-badge status-${reg.status?.toLowerCase() || 'pending'}`}>
                                            {reg.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div className="action-buttons-flex" style={{ display: 'flex', gap: '0.5rem' }}>
                                            {reg.event?.isPaid && reg.paymentSlip && (
                                                <button
                                                    className="btn-icon-only"
                                                    onClick={() => handleDownload(reg.paymentSlip)}
                                                    title="Download Slip"
                                                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '8px', borderRadius: '8px' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                                </button>
                                            )}
                                            {(!reg.status || reg.status === 'Pending') && (
                                                <>
                                                    <button
                                                        className="btn-approve-sm"
                                                        onClick={() => handleStatusChange(reg._id, 'Approved')}
                                                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn-reject-sm"
                                                        onClick={() => handleStatusChange(reg._id, 'Rejected')}
                                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegisteredUsers;
