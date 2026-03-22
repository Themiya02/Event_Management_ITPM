import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventView.css';

const EventView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
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

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const localUser = JSON.parse(localStorage.getItem('user'));
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                
                const res = await axios.get(`${apiUrl}/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${localUser?.token}` }
                });
                setEvent(res.data);
                
                // Pre-fill participant name from current user explicitly 
                if (localUser?.name) {
                    setRegForm(prev => ({ ...prev, participantName: localUser.name }));
                }
            } catch (error) {
                console.error('Failed to load event details', error);
                setMessage({ type: 'error', text: 'Event not found or unavailable' });
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
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
            
            // Wait and redirect back to feed
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to register. You may already be registered.' });
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-state">Loading specific event details...</div>;
    if (!event) return <div className="message-banner error" style={{margin:'2rem'}}>{message.text}</div>;

    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="event-view-container animation-fade-in">
            <button className="btn-sm-outline" style={{marginBottom:'1rem'}} onClick={() => navigate('/dashboard')}>
                ← Back to Feed
            </button>

            <div className="event-banner">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.name} />
                ) : (
                    <div className="placeholder">{event.name.charAt(0)}</div>
                )}
                <div className={`open-badge-large ${event.isOpenRegistration ? 'required' : 'open'}`}>
                    {event.isOpenRegistration ? 'Register Required' : 'Register Not Required'}
                </div>
            </div>

            <div className="glass-panel event-info-glass">
                <h1>{event.name}</h1>
                <div className="org-block">
                    <span>Hosted by Organizer ID: {event.organizer || 'Campus Organization'}</span>
                </div>

                <div className="details-grid">
                    <div className="detail-node">
                        <span className="label">Date</span>
                        <span className="val">{dateStr}</span>
                    </div>
                    <div className="detail-node">
                        <span className="label">Time</span>
                        <span className="val">{event.time}</span>
                    </div>
                    <div className="detail-node">
                        <span className="label">Location</span>
                        <span className="val">{event.location}</span>
                    </div>
                    <div className="detail-node">
                        <span className="label">Entry Fee</span>
                        <span className="val">{event.isPaid ? `Rs ${event.price}` : 'Free'}</span>
                    </div>
                </div>

                <div className="event-description">
                    <h3>About this event</h3>
                    <p>{event.description}</p>
                </div>
            </div>

            {/* Dynamic Event Registration Block */}
            <div className="glass-panel registration-glass">
                {message.text && (
                    <div className={`message-banner ${message.type}`} style={{marginBottom:'1.5rem'}}>
                        {message.text}
                    </div>
                )}

                {!event.isOpenRegistration ? (
                    <div className="open-event-notice">
                        <h3>🎟️ This is an Open Event!</h3>
                        <p>No registration or tickets are strictly required to attend. Feel free to walk in and enjoy!</p>
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
                                        <option value="">-- Select Year --</option>
                                        <option value="Year 1">Year 1</option>
                                        <option value="Year 2">Year 2</option>
                                        <option value="Year 3">Year 3</option>
                                        <option value="Year 4">Year 4</option>
                                        <option value="Alumni">Alumni / Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            {event.isPaid && (
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Upload Payment Slip (Required)</label>
                                    <div style={{ padding: '1rem', border: '2px dashed var(--primary-color)', borderRadius: '12px', textAlign: 'center', background: 'var(--surface-color)', transition: 'all 0.3s ease' }}>
                                        <input 
                                            type="file" 
                                            accept="image/*,application/pdf" 
                                            required={event.isPaid} 
                                            onChange={handleFileUpload}
                                            style={{ width: '100%', cursor: 'pointer' }}
                                        />
                                    </div>
                                    {regForm.paymentSlip && <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#10b981', fontWeight: 600}}>✅ Receipt attached successfully</div>}
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                                        * A payment transfer screenshot or receipt is strictly required to secure your ticket for this paid event.
                                    </small>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="save-btn" 
                                style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}
                                disabled={submitting}
                            >
                                {submitting ? 'Authenticating Ticket...' : 'Confirm Registration'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default EventView;
