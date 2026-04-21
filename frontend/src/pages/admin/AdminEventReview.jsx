import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AdminEventReview.css';

const approvalStages = [
    { key: 'security', label: 'Security Manager', icon: '🛡️', desc: 'Safety & crowd control' },
    { key: 'medical', label: 'Medical / Doctor', icon: '🏥', desc: 'Health & first aid clearance' },
    { key: 'community', label: 'Community Officer', icon: '🌍', desc: 'Societal & environmental' },
    { key: 'dean', label: 'Campus Dean', icon: '🎓', desc: 'Final executive sign-off' },
];

const AdminEventReview = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // The event should be passed in state natively; if not, we fallback (or redirect)
    const [event, setEvent] = useState(state?.event || null);
    const [updatingId, setUpdatingId] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, reason: '' });

    if (!event) {
        // Safe fallback if users manually type URL
        return (
            <div className="upcoming-page animation-fade-in" style={{padding:'4rem', textAlign:'center'}}>
                <h2>Event Not Found</h2>
                <button className="btn-sm-primary" onClick={() => navigate('/admin/events/upcoming')}>Go Back</button>
            </div>
        );
    }

    const getAuth = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return { token: user?.token, apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000' };
    };

    const handleCheckboxChange = async (field, currentValue) => {
        setUpdatingId(field);
        try {
            const { token, apiUrl } = getAuth();
            const res = await axios.patch(
                `${apiUrl}/api/events/admin/${event._id}/approval`,
                { field, value: !currentValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Replace full event state to sync DB arrays
            setEvent(res.data);
        } catch (err) {
            alert('Failed to update stage: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleApprove = async () => {
        if (!window.confirm('Are you absolutely certain you want to publish this event to all Users?')) return;
        try {
            const { token, apiUrl } = getAuth();
            await axios.patch(
                `${apiUrl}/api/events/admin/${event._id}/decide`,
                { action: 'approve' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/admin/events/upcoming');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectModal.reason.trim()) { alert('Please provide a rejection reason for the Organizer.'); return; }
        try {
            const { token, apiUrl } = getAuth();
            await axios.patch(
                `${apiUrl}/api/events/admin/${event._id}/decide`,
                { action: 'reject', reason: { rejectedAt: 'Admin', rejectionReason: rejectModal.reason } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRejectModal({ open: false, reason: '' });
            navigate('/admin/events/upcoming');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const allApproved = (approvals) => approvalStages.every(s => approvals?.[s.key]);
    const canApprove = allApproved(event.approvals);
    const clearedCount = approvalStages.filter(s => event.approvals?.[s.key]).length;

    return (
        <div className="review-page animation-fade-in">
            <button className="back-button" onClick={() => navigate('/admin/events/upcoming')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Pending Events
            </button>

            <div className="review-card">
                <div className={`review-hero ${event.imageUrl ? 'has-image' : 'no-image'}`}>
                    {event.imageUrl ? (
                        <>
                            <div className="hero-bg-blur" style={{ backgroundImage: `url(${event.imageUrl})` }} />
                            <img src={event.imageUrl} alt={event.name} className="hero-img" />
                        </>
                    ) : (
                        <div className="hero-placeholder">{event.name.charAt(0)}</div>
                    )}
                </div>

                <h1 className="review-title">{event.name}</h1>

                <div className="event-meta-grid">
                    <div className="meta-item">
                        <span className="meta-label">Organizer / Committee</span>
                        <span className="meta-value">👤 {event.organizer?.name || 'Local Organizer'}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Date & Time</span>
                        <span className="meta-value">📅 {new Date(event.date).toLocaleDateString()} at {event.time || 'TBA'}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Location</span>
                        <span className="meta-value">📍 {event.location || 'TBA'}</span>
                    </div>
                </div>

                <div className="status-grid">
                    <div className="status-block">
                        <span className="status-block-title">Event Access</span>
                        <span className={`ticket-badge ${event.isOpenRegistration ? 'required' : 'open'}`} style={{ fontSize: '1.1rem', width: 'fit-content', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            {event.isOpenRegistration ? '📝 Registration Required' : '🚪 Open Walk-in (Unlimited)'}
                        </span>
                    </div>
                    <div className="status-block">
                        <span className="status-block-title">Ticket Pricing</span>
                        <span className={`ticket-badge ${event.isPaid ? 'paid' : 'free'}`} style={{ fontSize: '1.1rem', width: 'fit-content', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            {event.isPaid ? `💳 Paid: Rs ${event.price}` : '🎟️ Free Auto-Entry'}
                        </span>
                    </div>
                </div>

                {event.description && (
                    <div className="review-description">
                        <h3>Event Description</h3>
                        <p>{event.description}</p>
                    </div>
                )}

                <div className="review-approval-section">
                    <div className="review-approval-header">
                        <h3>Security & Stage Approvals</h3>
                        <p>Every department must review and authorize the event parameters before it becomes visible to the campus.</p>
                    </div>

                    <div className="review-approval-grid">
                        {approvalStages.map(stage => {
                            const isChecked = event.approvals?.[stage.key] || false;
                            const isUpdating = updatingId === stage.key;
                            return (
                                <label key={stage.key} className={`approval-stage-card ${isChecked ? 'checked' : ''} ${isUpdating ? 'updating' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isUpdating}
                                        onChange={() => handleCheckboxChange(stage.key, isChecked)}
                                    />
                                    <div className="approval-icon">{stage.icon}</div>
                                    <div className="approval-info">
                                        <span className="approval-label">{stage.label}</span>
                                        <span className="approval-desc">{stage.desc}</span>
                                    </div>
                                    <div className="approval-check-icon">
                                        {isChecked ? '✓' : '○'}
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <div className="review-progress">
                        <div className="progress-header">
                            <span>{clearedCount} out of 4 mandatory stages cleared</span>
                            {canApprove && <span className="ready-text">Ready for Publication ✓</span>}
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${(clearedCount / 4) * 100}%` }} />
                        </div>
                    </div>
                </div>

                <div className="review-actions">
                    <button className="btn-reject" onClick={() => setRejectModal({ open: true, reason: '' })}>
                        ✕ Reject & Return to Organizer
                    </button>
                    <button
                        className="btn-publish"
                        onClick={() => canApprove && handleApprove()}
                        disabled={!canApprove}
                        title={canApprove ? 'Approve Event' : 'Complete all 4 stages first'}
                    >
                        {canApprove ? '✓ Permanently Publish Event' : 'Complete all 4 stages to publish'}
                    </button>
                </div>
            </div>

            {/* Reject Overlay inside the Route */}
            {rejectModal.open && (
                <div className="modal-backdrop" onClick={() => setRejectModal({ open: false, reason: '' })}>
                    <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Reject This Event</h3>
                        <p className="modal-sub">Enter a reason — the organizer will be notified immediately.</p>
                        <textarea
                            className="modal-input"
                            placeholder="e.g. Venue safety concerns not explicitly addressed in the description..."
                            value={rejectModal.reason}
                            onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                            rows={5}
                        />
                        <div className="modal-btns">
                            <button className="modal-cancel" onClick={() => setRejectModal({ open: false, reason: '' })}>Cancel</button>
                            <button className="modal-confirm-reject" onClick={handleRejectConfirm}>Confirm Panel Rejection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventReview;
