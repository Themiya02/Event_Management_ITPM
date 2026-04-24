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
                const response = await axios.get('http://localhost:5002/api/events/organizer/registrations', {
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
            await axios.patch(`http://localhost:5002/api/events/registrations/${id}/status`, { status }, {
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

    if (loading) return <div className="loading">Loading registrations...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="registered-users-container">
            <h1 className="page-title">Registered Users</h1>

            <div className="table-responsive">
                <table className="custom-table glass-panel">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Event Name</th>
                            <th>Campus ID</th>
                            <th>Campus Year</th>
                            <th>Event Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">No registrations found.</td>
                            </tr>
                        ) : (
                            registrations.map((reg) => (
                                <tr key={reg._id}>
                                    <td>{reg.participantName}</td>
                                    <td>{reg.event?.name}</td>
                                    <td>{reg.campusId}</td>
                                    <td>{reg.campusYear}</td>
                                    <td>
                                        {reg.event?.isPaid ? (
                                            <span className="badge badge-paid">Paid (Rs. {reg.event?.price})</span>
                                        ) : (
                                            <span className="badge badge-free">Free</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${reg.status?.toLowerCase() || 'pending'}`}>
                                            {reg.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {reg.event?.isPaid && reg.paymentSlip && (
                                            <button
                                                className="btn btn-outline-info btn-sm view-slip-btn"
                                                onClick={() => handleDownload(reg.paymentSlip)}
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                Download Receipt
                                            </button>
                                        )}
                                        {(!reg.status || reg.status === 'Pending') && (
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    onClick={() => handleStatusChange(reg._id, 'Approved')}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    onClick={() => handleStatusChange(reg._id, 'Rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
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
