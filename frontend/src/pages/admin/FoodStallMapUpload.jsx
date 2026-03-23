import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpcomingEvents.css';
import '../user/UserDashboard.css';

const FoodStallMapUpload = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [bankForms, setBankForms] = useState({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const getAuth = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return { token: user?.token, apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000' };
    };

    const fetchEvents = async () => {
        try {
            const { token, apiUrl } = getAuth();
            // Fetch all events, including pending (upcoming) ones
            const res = await axios.get(`${apiUrl}/api/events/admin/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Show approved and pending events
            const filtered = res.data.filter(e => e.status === 'Approved' || e.status === 'Pending');
            setAllEvents(filtered);
            const initialForms = {};
            filtered.forEach((event) => {
                initialForms[event._id] = {
                    accountName: event.bankDetails?.accountName || '',
                    bankName: event.bankDetails?.bankName || '',
                    accountNumber: event.bankDetails?.accountNumber || '',
                    branch: event.bankDetails?.branch || '',
                    instructions: event.bankDetails?.instructions || ''
                };
            });
            setBankForms(initialForms);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    useEffect(() => {
        if (!toast.show) return;
        const timer = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 2500);
        return () => clearTimeout(timer);
    }, [toast.show]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleBankFieldChange = (eventId, field, value) => {
        setBankForms(prev => ({
            ...prev,
            [eventId]: {
                ...prev[eventId],
                [field]: value
            }
        }));
    };

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
                showToast('Food stall map uploaded successfully.');
            } catch (error) {
                console.error('Failed to upload map', error);
                showToast('Failed to upload map.', 'error');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveBankDetails = async (eventId) => {
        try {
            const { token, apiUrl } = getAuth();
            const details = bankForms[eventId] || {};
            const res = await axios.patch(`${apiUrl}/api/events/admin/${eventId}/bank-details`, details, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllEvents(prev => prev.map(ev => ev._id === eventId ? res.data : ev));
            setBankForms(prev => ({
                ...prev,
                [eventId]: {
                    accountName: res.data.bankDetails?.accountName || '',
                    bankName: res.data.bankDetails?.bankName || '',
                    accountNumber: res.data.bankDetails?.accountNumber || '',
                    branch: res.data.bankDetails?.branch || '',
                    instructions: res.data.bankDetails?.instructions || ''
                }
            }));
            showToast('Bank details saved successfully.');
        } catch (error) {
            console.error('Failed to save bank details', error);
            showToast('Failed to save bank details.', 'error');
        }
    };

    const handleDeleteBankDetails = async (eventId) => {
        try {
            const { token, apiUrl } = getAuth();
            const res = await axios.delete(`${apiUrl}/api/events/admin/${eventId}/bank-details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllEvents(prev => prev.map(ev => ev._id === eventId ? res.data : ev));
            setBankForms(prev => ({
                ...prev,
                [eventId]: {
                    accountName: '',
                    bankName: '',
                    accountNumber: '',
                    branch: '',
                    instructions: ''
                }
            }));
            showToast('Bank details deleted.');
        } catch (error) {
            console.error('Failed to delete bank details', error);
            showToast('Failed to delete bank details.', 'error');
        }
    };

    return (
        <div className="upcoming-page animation-fade-in">
            {toast.show && (
                <div className={`modern-toast ${toast.type === 'error' ? 'error' : 'success'}`}>
                    <span className="modern-toast-icon">{toast.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{toast.message}</span>
                </div>
            )}
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

                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                        <h4 style={{ marginBottom: '0.6rem' }}>Bank Details for Vendors</h4>
                                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Account Name"
                                                value={bankForms[ev._id]?.accountName || ''}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'accountName', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Bank Name"
                                                value={bankForms[ev._id]?.bankName || ''}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'bankName', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Account Number"
                                                value={bankForms[ev._id]?.accountNumber || ''}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'accountNumber', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Branch"
                                                value={bankForms[ev._id]?.branch || ''}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'branch', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            />
                                            <textarea
                                                placeholder="Instructions (optional)"
                                                value={bankForms[ev._id]?.instructions || ''}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'instructions', e.target.value)}
                                                rows={2}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                                            <button
                                                type="button"
                                                className="btn-sm-primary"
                                                onClick={() => handleSaveBankDetails(ev._id)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-sm-outline"
                                                onClick={() => handleDeleteBankDetails(ev._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
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
