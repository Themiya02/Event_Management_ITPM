import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './UpcomingEvents.css';
import '../user/UserDashboard.css';

const FoodStallMapUpload = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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
            setAllEvents(res.data.filter(e => e.status === 'Approved' || e.status === 'Pending'));
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleBankFieldChange = (eventId, field, value) => {
        setBankForms(prev => ({
            ...prev,
            [eventId]: {
                ...prev[eventId],
                [field]: value
            }
        }));
    };
    
    const toggleEdit = (eventId) => {
        setEditingEvents(prev => ({
            ...prev,
            [eventId]: !prev[eventId]
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
                
                await Swal.fire({
                    title: "Upload Successful",
                    text: "The food stall map has been uploaded successfully.",
                    icon: "success",
                    confirmButtonColor: "#3b82f6",
                });
            } catch (error) {
                console.error('Failed to upload map', error);
                await Swal.fire({
                    title: "Upload Failed",
                    text: "There was an error uploading the stall map.",
                    icon: "error",
                    confirmButtonColor: "#ef4444",
                });
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
            setEditingEvents(prev => ({ ...prev, [eventId]: false }));
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

            await Swal.fire({
                title: "Update Successful",
                text: "The vendor bank details have been updated successfully.",
                icon: "success",
                confirmButtonColor: "#3b82f6",
            });
        } catch (error) {
            console.error('Failed to save bank details', error);
            await Swal.fire({
                title: "Update Failed",
                text: "There was an error updating the bank details. Please try again.",
                icon: "error",
                confirmButtonColor: "#ef4444",
            });
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

            await Swal.fire({
                title: "Deleted",
                text: "Bank details have been removed.",
                icon: "info",
                confirmButtonColor: "#ef4444",
            });
        } catch (error) {
            console.error('Failed to delete bank details', error);
            await Swal.fire({
                title: "Delete Failed",
                text: "Could not delete bank details.",
                icon: "error",
                confirmButtonColor: "#ef4444",
            });
        }
    };

    return (
        <div className="upcoming-page animation-fade-in">
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
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'accountName', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: !editingEvents[ev._id] ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Bank Name"
                                                value={bankForms[ev._id]?.bankName || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'bankName', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: !editingEvents[ev._id] ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Account Number"
                                                value={bankForms[ev._id]?.accountNumber || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'accountNumber', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: !editingEvents[ev._id] ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Branch"
                                                value={bankForms[ev._id]?.branch || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'branch', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: !editingEvents[ev._id] ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                                            />
                                            <textarea
                                                placeholder="Instructions (optional)"
                                                value={bankForms[ev._id]?.instructions || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'instructions', e.target.value)}
                                                rows={2}
                                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical', background: !editingEvents[ev._id] ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                                            />
                                                                     <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', justifyContent: 'flex-start' }}>
                                            {!editingEvents[ev._id] ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn-sm-primary"
                                                        style={{ 
                                                            background: '#3b82f6', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            padding: '0.6rem 1.2rem',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            flex: '1'
                                                        }}
                                                        onClick={() => toggleEdit(ev._id)}
                                                    >
                                                        Edit Details
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-sm-primary"
                                                        style={{ 
                                                            background: '#ef4444', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            padding: '0.6rem 1.2rem',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            flex: '1'
                                                        }}
                                                        onClick={() => handleDeleteBankDetails(ev._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn-sm-primary"
                                                        style={{ 
                                                            background: '#3b82f6', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            padding: '0.6rem 1.2rem',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            flex: '1'
                                                        }}
                                                        onClick={() => handleSaveBankDetails(ev._id)}
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-sm-primary"
                                                        style={{ 
                                                            background: '#ef4444', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            padding: '0.6rem 1.2rem',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            flex: '1'
                                                        }}
                                                        onClick={() => toggleEdit(ev._id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </div>
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
//fix
export default FoodStallMapUpload;
