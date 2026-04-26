import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EventsList.css';

const EventsList = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this event?")) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
                await axios.delete(`${apiUrl}/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(events.filter(e => e.id !== id));
            } catch (error) {
                console.error('Error deleting event:', error);
                alert("Failed to delete event: " + (error.response?.data?.message || 'Unknown error'));
            }
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
                const response = await axios.get(`${apiUrl}/api/events/organizer?summary=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const mappedEvents = response.data.map(dbEvent => ({
                    id: dbEvent._id,
                    name: dbEvent.name,
                    type: dbEvent.campusType === 'indoor' ? 'Indoor' : 'Outdoor',
                    status: dbEvent.status,
                    date: new Date(dbEvent.date).toLocaleDateString(),
                    attendees: dbEvent.registrationsCount || 0
                }));
                setEvents(mappedEvents);
            } catch (error) {
                console.error('Error fetching real events:', error);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="events-list-page animation-fade-in">
            <div className="events-header">
                <div>
                    <h1 className="page-title">Your Events</h1>
                    <p className="page-subtitle">Manage all your previously created events here.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search by event name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                borderRadius: '50px',
                                border: '1px solid var(--border-color)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-color)',
                                width: '250px'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>

                    <button className="btn btn-primary create-btn" onClick={() => navigate('/organizer/create-event')}>
                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Event
                    </button>
                </div>
            </div>

            <div className="glass-panel table-container">
                <table className="events-table">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Date</th>
                            <th>Venue Type</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.length > 0 ? filteredEvents.map(event => (
                            <tr key={event.id}>
                                <td className="font-semibold event-name-col">{event.name}</td>
                                <td className="text-muted">{event.date}</td>
                                <td>
                                    <span className="type-badge">
                                        {event.type === 'Indoor' ? '🏛️ ' : '🌳 '}
                                        {event.type}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${event.status.toLowerCase()}`}>
                                        {event.status}
                                    </span>
                                </td>
                                <td className="text-right flex-actions" style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderBottom: 'none' }}>
                                    <button className="action-link btn-sm" style={{ color: 'var(--secondary-color)' }} onClick={() => navigate(`/organizer/track/${event.id}`)}>Track</button>
                                    {event.status === 'Pending' && (
                                        <>
                                            <button className="action-link btn-sm" onClick={() => navigate(`/organizer/edit-event/${event.id}`)}>Edit</button>
                                            <button className="action-link btn-sm" style={{ color: '#ef4444' }} onClick={() => handleDelete(event.id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="empty-state">{searchTerm ? 'No matching events found.' : 'No events found. Click + New Event to start!'}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventsList;
