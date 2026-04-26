import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TrackEvent.css';

const TrackEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
                const response = await axios.get(`${apiUrl}/api/events/organizer?tracking=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const mappedEvents = response.data.map(dbEvent => ({
                    id: dbEvent._id,
                    name: dbEvent.name,
                    currentStep: dbEvent.trackingStep || 1,
                    status: dbEvent.status,
                    rejectedAt: dbEvent.rejectedAt || null,
                    reason: dbEvent.rejectionReason || null,
                    approvals: dbEvent.approvals || { security: false, medical: false, community: false, dean: false }
                }));
                setEvents(mappedEvents);
            } catch (error) {
                console.error('Error fetching tracker items:', error);
            }
        };
        fetchTrackingData();
        
        // Poll for real-time tracking updates every 3 seconds
        const intervalId = setInterval(fetchTrackingData, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const [selectedEventId, setSelectedEventId] = useState(eventId || '');
    const [eventData, setEventData] = useState(null);

    useEffect(() => {
        if (selectedEventId) {
            const found = events.find(e => e.id.toString() === selectedEventId.toString());
            setEventData(found || null);
        } else {
            setEventData(null);
        }
    }, [selectedEventId, events]);

    const handleSelectChange = (e) => {
        const id = e.target.value;
        setSelectedEventId(id);
        navigate(id ? `/organizer/track/${id}` : '/organizer/track');
    };

    const approvalSteps = [
        { level: 1, key: 'security', title: 'Security Manager', desc: 'Initial safety & crowd control sweep' },
        { level: 2, key: 'medical', title: 'Medical / Doctor', desc: 'Health & first aid clearance' },
        { level: 3, key: 'community', title: 'Community Officer', desc: 'Societal & environmental approval' },
        { level: 4, key: 'dean', title: 'Campus Dean', desc: 'Final executable sign-off' },
    ];

    return (
        <div className="track-event-page animation-fade-in">
            <div className="track-header">
                <h1 className="page-title">Track Event Approval</h1>
                <p className="page-subtitle">Monitor the real-time approval status of your submitted events across campus departments.</p>
            </div>

            <div className="glass-panel tracking-selector">
                <label className="selector-label">Select Event to Track:</label>
                <select className="styled-input select-event" value={selectedEventId} onChange={handleSelectChange}>
                    <option value="">-- Choose an Event --</option>
                    {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                </select>
            </div>

            {eventData ? (
                <div className="glass-panel tracking-container slide-in">
                    <div className="tracking-info">
                        <h2>{eventData.name}</h2>
                        <span className={`status-pill ${eventData.status.toLowerCase()}`}>{eventData.status}</span>
                    </div>

                    <div className="timeline">
                        {approvalSteps.map((step, idx) => {
                            let stepState = 'pending'; // pending, approved, current, rejected
                            let isLastNode = idx === approvalSteps.length - 1;
                            const approvals = eventData.approvals || {};

                            if (eventData.status === 'Rejected' && eventData.rejectedAt === step.title) {
                                stepState = 'rejected';
                            } else if (eventData.status === 'Approved' || approvals[step.key]) {
                                stepState = 'approved';
                            } else {
                                // Show 'current' for the first uncompleted step
                                const prevKey = approvalSteps[idx - 1]?.key;
                                const prevApproved = idx === 0 || approvals[prevKey];
                                if (prevApproved && eventData.status !== 'Rejected') {
                                    stepState = 'current';
                                }
                            }

                            return (
                                <div key={step.level} className={`timeline-step ${stepState}`}>
                                    <div className="timeline-node">
                                        <div className="node-icon">
                                            {stepState === 'approved' && '✓'}
                                            {stepState === 'rejected' && '✕'}
                                            {stepState === 'current' && '⏳'}
                                            {stepState === 'pending' && step.level}
                                        </div>
                                        {!isLastNode && <div className="node-line"></div>}
                                    </div>
                                    <div className="timeline-content">
                                        <h3>{step.title}</h3>
                                        <p>{step.desc}</p>

                                        {stepState === 'rejected' && (
                                            <div className="rejection-box">
                                                <strong>Reason:</strong> {eventData.reason}
                                            </div>
                                        )}
                                        {stepState === 'approved' && (
                                            <span className="approval-badge">Cleared</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="glass-panel no-selection">
                    <div className="empty-state-icon">📄</div>
                    <h3>No Event Selected</h3>
                    <p>Please select an event from the dropdown above to view its tracking timeline.</p>
                </div>
            )}
        </div>
    );
};

export default TrackEvent;
