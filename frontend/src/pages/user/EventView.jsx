import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import './EventView.css';

const EventView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const invitationRef = useRef(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const [regForm, setRegForm] = useState({
        participantName: '',
        campusId: '',
        campusYear: '',
        paymentSlip: ''
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegForm(prev => ({ ...prev, paymentSlip: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

    useEffect(() => {
        const fetchEventAndRegistrations = async () => {
            try {
                const localUser = JSON.parse(localStorage.getItem('user'));
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                // Fetch event details
                const res = await axios.get(`${apiUrl}/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${localUser?.token}` }
                });
                setEvent(res.data);

                // Fetch user registrations to check if already registered
                try {
                    const regRes = await axios.get(`${apiUrl}/api/events/my-registrations`, {
                        headers: { Authorization: `Bearer ${localUser?.token}` }
                    });
                    const registrations = regRes.data;
                    const alreadyRegistered = registrations.some(reg => 
                        (reg.event._id || reg.event) === id
                    );
                    setIsAlreadyRegistered(alreadyRegistered);
                } catch (regError) {
                    console.error('Failed to load user registrations', regError);
                }

                if (localUser?.name) {
                    setRegForm(prev => ({ ...prev, participantName: localUser.name }));
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to load event details', error);
                setLoading(false);
            }
        };
        fetchEventAndRegistrations();
    }, [id]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const localUser = JSON.parse(localStorage.getItem('user'));
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            await axios.post(`${apiUrl}/api/events/${id}/register`, regForm, {
                headers: { Authorization: `Bearer ${localUser?.token}` }
            });
            
            setMessage({ type: 'success', text: 'Successfully registered for this event! 🎉 Your ticket has been recorded.' });
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to register. You may already be registered.' });
        } finally {
            setSubmitting(false);
        }
    };

    const downloadInvitation = async () => {
        if (!invitationRef.current) return;
        try {
            const canvas = await html2canvas(invitationRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `Invitation-${event.name}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to download invitation', err);
        }
    };

    if (loading) return <div className="loading">Loading event details...</div>;
    if (!event) return <div className="error">Event not found</div>;

    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="event-view-container animation-fade-in">
            <div className="event-banner">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.name} />
                ) : (
                    <div className="placeholder">{event.name.charAt(0)}</div>
                )}
                <div className={`open-badge-large ${event.isOpenRegistration ? 'required' : 'open'}`}>
                    {event.isOpenRegistration ? '🎟️ Registration Required' : '🌟 Open Entry'}
                </div>
            </div>

            <div className="glass-panel event-info-glass">
                <h1>{event.name}</h1>
                <div className="org-block">
                    <span>👤 Organized by: <strong>{event.organizer?.name || 'Local Organizer'}</strong></span>
                </div>

                <div className="details-grid">
                    <div className="detail-node">
                        <span className="label">Date</span>
                        <span className="val">{dateStr}</span>
                    </div>
                    {event.artistName && (
                        <div className="detail-node">
                            <span className="label">Artist / Performer</span>
                            <span className="val">🎤 {event.artistName}</span>
                        </div>
                    )}
                    <div className="detail-node">
                        <span className="label">Time</span>
                        <span className="val">⏰ {event.time}</span>
                    </div>
                    <div className="detail-node">
                        <span className="label">Location</span>
                        <span className="val">📍 {event.location}</span>
                    </div>
                </div>

                <div className="event-description">
                    <h3>About this event</h3>
                    <p>{event.description}</p>
                </div>
            </div>

            <div className="glass-panel registration-glass">
                {message.text && (
                    <div className={`message-banner ${message.type}`} style={{marginBottom:'1.5rem'}}>
                        {message.text}
                    </div>
                )}

                {!event.isOpenRegistration ? (
                    <div className="open-event-notice">
                        <h3>🎟️ This is an Open Event!</h3>
                        <p>Everyone is welcome. Click below to view and download your official invitation.</p>
                        
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button className="click-me-btn" onClick={() => setShowInviteModal(true)}>
                                <span className="hand-icon">👆</span>
                                See the invitation
                            </button>
                        </div>

                        {showInviteModal && (
                            <div className="invite-modal-backdrop" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowInviteModal(false)}>
                                <div className="invite-modal-card" style={{ maxWidth: '650px', background: '#111', border: '1px solid rgba(212, 175, 55, 0.3)' }} onClick={e => e.stopPropagation()}>
                                    <div className="invite-modal-header" style={{ background: '#0a0a0a', borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                        <h3 style={{ color: '#d4af37', letterSpacing: '1px' }}>Event Invitation</h3>
                                        <button className="btn-close-invite" onClick={() => setShowInviteModal(false)}>×</button>
                                    </div>
                                    
                                    <div className="invite-modal-content" style={{ background: '#0a0a0a' }}>
                                        <div ref={invitationRef} style={{
                                            width: '560px',
                                            padding: '60px 40px',
                                            background: '#0a0a0a',
                                            color: '#f1f1f1',
                                            borderRadius: '4px',
                                            fontFamily: "'Playfair Display', serif",
                                            border: '1px solid #d4af37',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            textAlign: 'center',
                                            boxShadow: '0 0 50px rgba(0,0,0,1)'
                                        }}>
                                            {/* Decorative Elements */}
                                            <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'linear-gradient(135deg, #d4af37 0%, transparent 70%)', opacity: 0.1, transform: 'rotate(45deg)' }}></div>
                                            <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: 'linear-gradient(315deg, #d4af37 0%, transparent 70%)', opacity: 0.1, transform: 'rotate(45deg)' }}></div>
                                            
                                            <div style={{ marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '6px', color: '#d4af37', fontWeight: '300', fontSize: '13px' }}>You're Invited To</div>
                                            
                                            <h1 style={{ 
                                                fontSize: '72px', 
                                                margin: '0 0 10px 0', 
                                                fontFamily: "'Great Vibes', cursive", 
                                                color: '#d4af37',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                            }}>
                                                Event
                                            </h1>
                                            
                                            <div style={{ 
                                                fontSize: '28px', 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '4px', 
                                                fontWeight: 'bold', 
                                                margin: '0 0 30px 0',
                                                color: '#fff',
                                                borderTop: '1px solid rgba(212, 175, 55, 0.4)',
                                                borderBottom: '1px solid rgba(212, 175, 55, 0.4)',
                                                padding: '15px 0',
                                                display: 'inline-block',
                                                width: '100%'
                                            }}>
                                                {event.name}
                                            </div>

                                            {event.artistName && (
                                                <div style={{ fontSize: '20px', color: '#d4af37', marginBottom: '40px', fontStyle: 'italic' }}>
                                                    Featuring a special performance by {event.artistName}
                                                </div>
                                            )}

                                            <div style={{ margin: '40px 0', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', zIndex: 1 }}>
                                                <div style={{ fontSize: '22px', fontWeight: '400', letterSpacing: '1px' }}>
                                                    {dateStr.toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: '18px', color: '#d4af37' }}>
                                                    {event.time}
                                                </div>
                                                <div style={{ height: '1px', width: '100px', background: '#d4af37', margin: '10px auto' }}></div>
                                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                    {event.location}
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '50px', opacity: 0.4, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>
                                                Official Invitation • Campus Event Management
                                            </div>
                                        </div>
                                        
                                        <button className="btn-sm-primary" onClick={downloadInvitation} style={{ 
                                            marginTop: '2.5rem', 
                                            width: '320px', 
                                            padding: '1.2rem',
                                            background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                                            borderColor: '#966e08',
                                            color: '#000',
                                            fontWeight: '800',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                                        }}>
                                            📥 DOWNLOAD DIGITAL INVITATION
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {isAlreadyRegistered ? (
                            <div className="already-registered-notice" style={{ textAlign: 'center', padding: '3rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', marginTop: '1rem' }}>
                                <h3 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.4rem' }}>🎉 You are registered!</h3>
                                <p style={{ color: 'var(--text-muted)' }}>You have already secured your ticket for this event.</p>
                                <button className="btn-sm-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2>Secure Your Ticket</h2>
                                <p>Please provide your campus credentials to reliably reserve your seat.</p>
                                
                                <form onSubmit={handleRegister} className="styled-form" style={{ marginTop: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Participant Full Name</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={regForm.participantName}
                                            onChange={(e) => setRegForm({...regForm, participantName: e.target.value})}
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Campus ID Number</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={regForm.campusId}
                                                onChange={(e) => setRegForm({...regForm, campusId: e.target.value})}
                                                placeholder="IT21XXXXXX"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Campus Year</label>
                                            <select 
                                                required
                                                className="styled-input"
                                                value={regForm.campusYear}
                                                onChange={(e) => setRegForm({...regForm, campusYear: e.target.value})}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                            </select>
                                        </div>
                                    </div>

                                    {event.isPaid && (
                                        <div className="form-group" style={{ marginTop: '1rem' }}>
                                            <label>Payment Slip (Rs. {event.price})</label>
                                            <div className="file-input-wrapper">
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    required
                                                    onChange={handleFileUpload}
                                                />
                                                <div className="file-custom-placeholder">
                                                    {regForm.paymentSlip ? '✅ Slip Uploaded' : '📁 Click to upload payment receipt'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        type="submit" 
                                        className="btn-sm-primary" 
                                        style={{ width: '100%', marginTop: '2rem', padding: '1.2rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Processing...' : (event.isPaid ? 'Submit Registration' : 'Register Now')}
                                    </button>
                                </form>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EventView;
