import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpcomingEvents.css';
import '../user/UserDashboard.css';

const FoodStallBookings = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            const res = await axios.get(`${apiUrl}/api/events/admin/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // Only show events that have a stallMapUrl assigned already
            const mappedEvents = res.data.filter(e => e.stallMapUrl);
            setEvents(mappedEvents);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (eventId, bookingId, status) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            const res = await axios.patch(`${apiUrl}/api/events/admin/stall-booking/${eventId}/${bookingId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSelectedEvent(res.data);
            setEvents(prev => prev.map(e => e._id === eventId ? res.data : e));
            alert(`Booking successfully ${status.toLowerCase()}!`);
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update booking status.');
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    if (loading) return <div className="loading-msg">Loading comprehensive vendor bookings...</div>;

    return (
        <div className="upcoming-page animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title">Food Stall Bookings Tracker</h1>
                <p className="page-main-subtitle">Monitor interactive vendor map placements and container assignments.</p>
            </div>

            {!selectedEvent ? (
                <>
                    {events.length === 0 ? (
                        <div className="glass-panel empty-state">
                            <div className="empty-big-icon">🍔</div>
                            <h3>No Mapped Events</h3>
                            <p>You haven't uploaded a stall map to any upcoming events yet.</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {events.map(ev => {
                                const dateObj = new Date(ev.date);
                                const month = dateObj.toLocaleString('default', { month: 'short' });
                                const day = dateObj.getDate();

                                return (
                                    <div key={ev._id} className="event-card glass-panel animation-fade-in" style={{ cursor: 'pointer' }} onClick={() => setSelectedEvent(ev)}>
                                        <div className="card-img-wrapper" style={{ height: '160px' }}>
                                            <img src={ev.stallMapUrl} alt={`${ev.name} Map`} />
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
                                                <div className="detail-item">
                                                    <span>📍</span> {ev.location}
                                                </div>
                                                <div style={{ color: 'var(--primary-color)', fontSize: '1rem', fontWeight: 'bold', marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{ev.bookedStalls?.length || 0} Booked Stalls</span>
                                                    <span>View Details →</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                <div className="animation-slide-up">
                    <button className="btn-sm-outline" style={{ marginBottom: '1.5rem' }} onClick={() => setSelectedEvent(null)}>
                        ← Back to Event List
                    </button>
                    
                    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>{selectedEvent.name} - Stall Placements</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Visual overview of all locked-in container coordinates for this blueprint.</p>
                        
                        <div 
                            style={{ 
                                position: 'relative', 
                                width: '100%', 
                                maxHeight: '500px', 
                                overflow: 'hidden',
                                borderRadius: '12px',
                                border: '2px dashed var(--border-color)',
                                backgroundColor: '#111'
                            }}
                        >
                            <img 
                                src={selectedEvent.stallMapUrl} 
                                alt="Event Stall Map" 
                                style={{ width: '100%', display: 'block' }}
                            />
                            
                            {/* Render already booked stalls */}
                            {selectedEvent.bookedStalls?.map((stall, idx) => (
                                <div 
                                    key={idx}
                                    style={{
                                        position: 'absolute',
                                        left: `${stall.x}%`,
                                        top: `${stall.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        background: 'var(--primary-color)',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        border: '3px solid white',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}
                                    title={`${stall.stallName} by ${stall.vendorName}`}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel">
                        <h2 className="section-title">Registered Vendors</h2>
                        {selectedEvent.bookedStalls?.length === 0 ? (
                            <p className="empty-note">No stalls have been booked for this event yet.</p>
                        ) : (
                            <div className="recent-list">
                                {selectedEvent.bookedStalls?.map((stall, idx) => (
                                    <div key={idx} className="recent-row" style={{ alignItems: 'center' }}>
                                        <div>
                                            <p className="recent-name" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <span style={{ 
                                                    background: 'var(--primary-color)', color: '#fff', borderRadius: '50%',
                                                    width: '24px', height: '24px', display: 'flex', alignItems: 'center', 
                                                    justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' 
                                                }}>{idx + 1}</span>
                                                {stall.stallName}
                                            </p>
                                            <p className="recent-meta" style={{ marginLeft: '2.3rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                                                Vendor: <strong style={{color:'#fff'}}>{stall.vendorName}</strong>
                                                <br />
                                                <span style={{color: 'var(--primary-color)', fontSize: '0.85rem'}}>{stall.foodType || 'Food'}</span>
                                                <br />
                                                Description: {stall.description || 'No description provided.'}
                                                <br />
                                                <span style={{ fontSize: '0.8rem', display: 'inline-block', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
                                                    Utilities: {stall.needsElectricity ? '🔌 Electricity' : ''} {stall.needsElectricity && stall.needsWater ? '|' : ''} {stall.needsWater ? '💧 Water' : ''} 
                                                    {!stall.needsElectricity && !stall.needsWater && 'None'}
                                                </span>
                                                {stall.paymentReceipt && (
                                                    <>
                                                        <br />
                                                        <a href={stall.paymentReceipt} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.4rem', color: '#00d2ff', textDecoration: 'underline', fontSize: '0.85rem' }}>View Payment Receipt</a>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ color: '#521e1eff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                                                Rs {stall.totalPrice?.toLocaleString() || '10,000'}
                                            </p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                                X: {stall.x.toFixed(1)}% | Y: {stall.y.toFixed(1)}%
                                            </p>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <span style={{ 
                                                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                    background: stall.status === 'Approved' ? 'var(--success-color)' : stall.status === 'Rejected' ? '#e74c3c' : '#f39c12',
                                                    color: '#fff'
                                                }}>
                                                    {stall.status || 'Pending'}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                                                Booked: {new Date(stall.bookedAt).toLocaleDateString()}
                                            </p>
                                            {stall.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => updateStatus(selectedEvent._id, stall._id, 'Approved')} className="btn-sm-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', margin: 0 }}>Approve</button>
                                                    <button onClick={() => updateStatus(selectedEvent._id, stall._id, 'Rejected')} className="btn-sm-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#e74c3c', color: '#e74c3c', margin: 0 }}>Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodStallBookings;
