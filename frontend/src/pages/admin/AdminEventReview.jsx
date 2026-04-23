import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './UpcomingEvents.css'; // Reuse CSS for layout elements

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
        <div className="upcoming-page animation-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '1rem' }}>
            
            <button 
                onClick={() => navigate('/admin/events/upcoming')} 
                style={{background:'none', border:'none', color:'var(--primary-color)', fontWeight: 600, cursor:'pointer', marginBottom:'2rem', fontSize:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}
            >
                ← Back to Pending Events
            </button>

            <div className="upcoming-modal-card" style={{ width: '100%', maxWidth: '100%', padding: '3rem', maxHeight:'none', overflow:'visible' }}>
                <div className="event-card-header" style={{borderBottom:'none', paddingBottom:'0', display:'block'}}>
                    {/* Immersive Cinematic Hero Banner */}
                    {event.imageUrl ? (
                        <div style={{ width: '100%', height: '400px', borderRadius: '20px', overflow: 'hidden', position: 'relative', marginBottom: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ position: 'absolute', inset: -30, background: `url(${event.imageUrl}) center/cover`, filter: 'blur(25px)', opacity: 0.5 }} />
                            <img src={event.imageUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} />
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: '250px', borderRadius: '20px', background: 'var(--primary-gradient)', display: 'grid', placeItems: 'center', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(167, 139, 250, 0.2)' }}>
                            <span style={{ fontSize: '6rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>{event.name.charAt(0)}</span>
                        </div>
                    )}
                    
                    <div>
                        <h1 className="page-main-title" style={{fontSize: '2.4rem', marginBottom: '1.5rem'}}>{event.name}</h1>
                        
                        {/* Unified Organized Event Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '3rem' }}>
                            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Committee / Organizer</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>👤 {event.organizer?.name || 'Local Organizer'}</span>
                            </div>
                            
                            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Date & Time</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>📅 {new Date(event.date).toLocaleDateString()} at {event.time}</span>
                            </div>
                            
                            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Location Venue</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>📍 {event.location}</span>
                            </div>

                            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Event Access</span>
                                <span className={`ticket-badge ${event.isOpenRegistration ? 'required' : 'open'}`} style={{ alignSelf: 'flex-start', margin: 0 }}>
                                    {event.isOpenRegistration ? '📝 Registration Required' : '🚪 Open Walk-in (Free)'}
                                </span>
                            </div>

                            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Ticket Pricing</span>
                                <span className={`ticket-badge ${event.isPaid ? 'paid' : 'free'}`} style={{ alignSelf: 'flex-start', margin: 0 }}>
                                    {event.isPaid ? `💳 Paid: Rs ${event.price}` : '🎟️ Free Auto-Entry'}
                                </span>
                            </div>
                        </div>

                        {event.description && (
                            <div style={{marginBottom: '3rem'}}>
                                <h3 style={{fontSize:'1.1rem', marginBottom:'1rem', color:'var(--text-muted)'}}>Description</h3>
                                <p className="event-desc" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius:'12px', fontSize:'1.05rem', lineHeight:'1.6'}}>
                                    {event.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Explicitly Requested Approval Nodes */}
                <div className="approval-section" style={{background:'var(--bg-color)', borderRadius:'16px', padding:'2rem', border:'1px solid var(--border-color)'}}>
                    <h3 className="approval-heading" style={{fontSize:'1.2rem', marginBottom:'1.5rem', color:'var(--text-main)'}}>Security & Stage Approvals</h3>
                    <p style={{color:'var(--text-muted)', marginBottom:'2rem', fontSize:'0.95rem'}}>Every department must review and physically authorize the event parameters before it becomes visible to the campus.</p>
                    
                    <div className="approval-grid" style={{gap:'1rem'}}>
                        {approvalStages.map(stage => {
                            const isChecked = event.approvals?.[stage.key] || false;
                            const isUpdating = updatingId === stage.key;
                            return (
                                <label key={stage.key} className={`stage-checkbox ${isChecked ? 'checked' : ''} ${isUpdating ? 'updating' : ''}`} style={{padding:'1.2rem'}}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isUpdating}
                                        onChange={() => handleCheckboxChange(stage.key, isChecked)}
                                    />
                                    <span className="stage-emoji" style={{fontSize:'1.8rem', width:'48px', height:'48px'}}>{stage.icon}</span>
                                    <div className="stage-text" style={{marginLeft:'0.5rem'}}>
                                        <span className="stage-label" style={{fontSize:'1.05rem'}}>{stage.label}</span>
                                        <span className="stage-desc" style={{fontSize:'0.85rem'}}>{stage.desc}</span>
                                    </div>
                                    <span className={`stage-check-mark ${isChecked ? 'on' : ''}`} style={{fontSize:'1.5rem', marginLeft:'auto'}}>
                                        {isChecked ? '✓' : '○'}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="progress-section" style={{marginTop:'3rem', padding:'2rem', background:'var(--surface-color)', borderRadius:'12px'}}>
                        <div className="progress-labels" style={{fontSize:'1rem'}}>
                            <span>{clearedCount} out of 4 mandatory stages cleared</span>
                            {canApprove && <span className="all-clear-text" style={{fontSize:'1.1rem'}}>Ready for Publication ✓</span>}
                        </div>
                        <div className="progress-track" style={{height:'10px', marginTop:'1rem'}}>
                            <div className="progress-fill" style={{ width: `${(clearedCount / 4) * 100}%` }} />
                        </div>
                    </div>
                </div>

                <div className="event-card-actions" style={{marginTop:'3rem', gap:'1.5rem'}}>
                    <button className="btn-reject-event" onClick={() => setRejectModal({ open: true, reason: '' })} style={{flex: 1, padding:'1.2rem', fontSize:'1.1rem'}}>
                        ✕ Reject & Return to Organizer
                    </button>
                    <button
                        className={`btn-approve-event ${canApprove ? '' : 'disabled'}`}
                        onClick={() => canApprove && handleApprove()}
                        disabled={!canApprove}
                        title={canApprove ? 'Approve Event' : 'Complete all 4 stages first'}
                        style={{flex: 2, padding:'1.2rem', fontSize:'1.1rem'}}
                    >
                        ✓ Permanently Publish to User Dashboard
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
