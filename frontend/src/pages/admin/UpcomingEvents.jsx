import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UpcomingEvents.css';

const approvalStages = [
    { key: 'security', label: 'Security Manager', icon: '🛡️', desc: 'Safety & crowd control' },
    { key: 'medical', label: 'Medical / Doctor', icon: '🏥', desc: 'Health & first aid clearance' },
    { key: 'community', label: 'Community Officer', icon: '🌍', desc: 'Societal & environmental' },
    { key: 'dean', label: 'Campus Dean', icon: '🎓', desc: 'Final executive sign-off' },
];

const UpcomingEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState({ open: false, eventId: null, reason: '' });
    const [updatingId, setUpdatingId] = useState(null);

    const getAuth = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return { token: user?.token, apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000' };
    };

    const fetchEvents = async () => {
        try {
            const { token, apiUrl } = getAuth();
            const res = await axios.get(`${apiUrl}/api/events/admin/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents(res.data);
        } catch (err) {
            console.error('Error fetching pending events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleCheckboxChange = async (eventId, field, currentValue) => {
        setUpdatingId(`${eventId}-${field}`);
        try {
            const { token, apiUrl } = getAuth();
            const res = await axios.patch(
                `${apiUrl}/api/events/admin/${eventId}/approval`,
                { field, value: !currentValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvents(prev => prev.map(ev => ev._id === eventId ? res.data : ev));
        } catch (err) {
            alert('Failed to update: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleApprove = async (eventId) => {
        if (!window.confirm('Approve this event?')) return;
        try {
            const { token, apiUrl } = getAuth();
            await axios.patch(
                `${apiUrl}/api/events/admin/${eventId}/decide`,
                { action: 'approve' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvents(prev => prev.filter(ev => ev._id !== eventId));
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRejectConfirm = async () => {
        const { eventId, reason } = rejectModal;
        if (!reason.trim()) { alert('Please provide a rejection reason.'); return; }
        try {
            const { token, apiUrl } = getAuth();
            await axios.patch(
                `${apiUrl}/api/events/admin/${eventId}/decide`,
                { action: 'reject', reason: { rejectedAt: 'Admin', rejectionReason: reason } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvents(prev => prev.filter(ev => ev._id !== eventId));
            setRejectModal({ open: false, eventId: null, reason: '' });
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const allApproved = (approvals) => approvalStages.every(s => approvals?.[s.key]);

    return (
        <div className="upcoming-page animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title">Upcoming Events</h1>
                <p className="page-main-subtitle">Review pending events and grant stage-by-stage approvals.</p>
            </div>

            {loading ? (
                <p className="loading-msg">Loading events...</p>
            ) : events.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">🎉</div>
                    <h3>All Clear!</h3>
                    <p>No events are pending approval right now.</p>
                </div>
            ) : (
                <div className="event-cards-list">
                    {events.map(ev => {
                        const canApprove = allApproved(ev.approvals);
                        const clearedCount = approvalStages.filter(s => ev.approvals?.[s.key]).length;
                        return (
                            <div key={ev._id} className="event-card glass-panel">
                                {/* Header */}
                                <div className="event-card-header">
                                    <div>
                                        <h2 className="event-name">{ev.name}</h2>
                                        <div className="event-meta">
                                            <span>👤 {ev.organizer?.name || 'Unknown'}</span>
                                            <span>📅 {new Date(ev.date).toLocaleDateString()}</span>
                                            <span>📍 {ev.location}</span>
                                            <span className={`ticket-badge ${ev.isPaid ? 'paid' : 'free'}`}>
                                                {ev.isPaid ? `💳 Rs ${ev.price}` : '🎟️ Free'}
                                            </span>
                                        </div>
                                        {ev.description && <p className="event-desc">{ev.description}</p>}
                                    </div>
                                    <span className="status-tag pending">Pending</span>
                                </div>

                                {/* Approval Checkboxes */}
                                <div className="approval-section">
                                    <h3 className="approval-heading">Approval Stages</h3>
                                    <div className="approval-grid">
                                        {approvalStages.map(stage => {
                                            const isChecked = ev.approvals?.[stage.key] || false;
                                            const isUpdating = updatingId === `${ev._id}-${stage.key}`;
                                            return (
                                                <label key={stage.key} className={`stage-checkbox ${isChecked ? 'checked' : ''} ${isUpdating ? 'updating' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={isUpdating}
                                                        onChange={() => handleCheckboxChange(ev._id, stage.key, isChecked)}
                                                    />
                                                    <span className="stage-emoji">{stage.icon}</span>
                                                    <div className="stage-text">
                                                        <span className="stage-label">{stage.label}</span>
                                                        <span className="stage-desc">{stage.desc}</span>
                                                    </div>
                                                    <span className={`stage-check-mark ${isChecked ? 'on' : ''}`}>
                                                        {isChecked ? '✓' : '○'}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="progress-section">
                                    <div className="progress-labels">
                                        <span>{clearedCount} / 4 stages cleared</span>
                                        {canApprove && <span className="all-clear-text">All Stages Cleared ✓</span>}
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${(clearedCount / 4) * 100}%` }} />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="event-card-actions">
                                    <button className="btn-reject-event" onClick={() => setRejectModal({ open: true, eventId: ev._id, reason: '' })}>
                                        ✕ Reject Event
                                    </button>
                                    <button
                                        className={`btn-approve-event ${canApprove ? '' : 'disabled'}`}
                                        onClick={() => canApprove && handleApprove(ev._id)}
                                        disabled={!canApprove}
                                        title={canApprove ? 'Approve Event' : 'Complete all 4 stages first'}
                                    >
                                        ✓ Approve Event
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="modal-backdrop" onClick={() => setRejectModal({ open: false, eventId: null, reason: '' })}>
                    <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Reject This Event</h3>
                        <p className="modal-sub">Enter a reason — the organizer will be notified.</p>
                        <textarea
                            className="modal-input"
                            placeholder="e.g. Venue safety concerns not addressed..."
                            value={rejectModal.reason}
                            onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                            rows={4}
                        />
                        <div className="modal-btns">
                            <button className="modal-cancel" onClick={() => setRejectModal({ open: false, eventId: null, reason: '' })}>Cancel</button>
                            <button className="modal-confirm-reject" onClick={handleRejectConfirm}>Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingEvents;
