import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const FoodDashboard = () => {
    const { user, logout } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [stallName, setStallName] = useState('');
    const [description, setDescription] = useState('');
    const [marker, setMarker] = useState(null);
    const imgRef = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/events/approved`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const mappedEvents = res.data.filter(e => e.stallMapUrl);
                setEvents(mappedEvents);
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleMapClick = (e) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMarker({ x, y });
    };

    const handleBookStall = async (e) => {
        e.preventDefault();
        if (!marker) return alert('Please select a location on the map first.');
        if (!stallName.trim()) return alert('Stall Name is required.');

        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/events/${selectedEvent._id}/book-stall`, {
                stallName,
                description,
                x: marker.x,
                y: marker.y
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Stall booked successfully!');
            setSelectedEvent(res.data);
            
            // update events list so back button works correctly
            setEvents(prev => prev.map(ev => ev._id === res.data._id ? res.data : ev));

            setMarker(null);
            setStallName('');
            setDescription('');
        } catch (error) {
            console.error('Failed to book stall', error);
            alert(error.response?.data?.message || 'Failed to book stall');
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading vendor data...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }} className="animation-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>Vendor Portal</h1>
                <button onClick={logout} className="btn-sm-outline">Secure Logout</button>
            </div>
            
            {!selectedEvent ? (
                <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                        Welcome, {user?.name}! Select an event below to book your food stall location.
                    </p>
                    {events.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏕️</div>
                            <h2>No Events Available</h2>
                            <p style={{ color: 'var(--text-muted)' }}>No upcoming events currently have a stall map available. Check back soon!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {events.map(ev => (
                                <div key={ev._id} className="glass-panel" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setSelectedEvent(ev)}>
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>{ev.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{new Date(ev.date).toLocaleDateString()} at {ev.time}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                                            {ev.bookedStalls?.length || 0} Stalls Booked
                                        </span>
                                        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Book Now →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="animation-slide-up">
                    <button className="btn-sm-outline" style={{ marginBottom: '1rem' }} onClick={() => setSelectedEvent(null)}>
                        ← Back to Events
                    </button>
                    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>{selectedEvent.name} - Map Booking</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Click anywhere on the map to place your stall container.</p>
                        
                        <div 
                            style={{ 
                                position: 'relative', 
                                width: '100%', 
                                maxHeight: '500px', 
                                overflow: 'hidden',
                                borderRadius: '12px',
                                border: '2px dashed var(--border-color)',
                                cursor: 'crosshair',
                                backgroundColor: '#111'
                            }}
                            onClick={handleMapClick}
                        >
                            <img 
                                ref={imgRef}
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
                                        background: stall.vendorId === user._id ? 'var(--primary-color)' : '#e74c3c',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        border: '3px solid white',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                        zIndex: 10
                                    }}
                                    title={`${stall.stallName} by ${stall.vendorName}`}
                                />
                            ))}

                            {/* Render current dropping marker */}
                            {marker && (
                                <div 
                                    className="animation-bounce"
                                    style={{
                                        position: 'absolute',
                                        left: `${marker.x}%`,
                                        top: `${marker.y}%`,
                                        transform: 'translate(-50%, -100%)',
                                        fontSize: '2rem',
                                        pointerEvents: 'none',
                                        zIndex: 20,
                                        filter: 'drop-shadow(0px 5px 5px rgba(0,0,0,0.5))'
                                    }}
                                >
                                    📍
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel">
                        <h3 style={{ marginBottom: '1rem' }}>Confirm Stall Location</h3>
                        {!marker ? (
                            <p style={{ color: 'var(--text-muted)' }}>Waiting for map selection...</p>
                        ) : (
                            <form onSubmit={handleBookStall}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Stall Name</label>
                                        <input 
                                            type="text" 
                                            value={stallName} 
                                            onChange={e => setStallName(e.target.value)} 
                                            placeholder="e.g. Burger Point" 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Coordinates</label>
                                        <input 
                                            type="text" 
                                            value={`X: ${marker.x.toFixed(1)}%, Y: ${marker.y.toFixed(1)}%`} 
                                            disabled 
                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Brief Description (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        placeholder="What will you be selling?" 
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                    Lock Location Position
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodDashboard;
