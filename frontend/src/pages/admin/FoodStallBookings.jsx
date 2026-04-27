import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { createPortal } from 'react-dom';
import './UpcomingEvents.css';
import '../user/UserDashboard.css';

const FoodStallBookings = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const getBookingStatus = (status) => status || 'Pending';

    const fetchEvents = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const res = await axios.get(`${apiUrl}/api/events/admin/all?summary=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const mappedEvents = res.data.filter((e) => e.stallMapUrl);
            setEvents(mappedEvents);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = async (ev) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // Fetch the full event details including bookedStalls
            const res = await axios.get(`${apiUrl}/api/events/${ev._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedEvent(res.data);
        } catch (err) {
            console.error('Error fetching event details:', err);
            alert('Could not load full event details.');
        }
    };

    const updateStatus = async (eventId, bookingId, status) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const res = await axios.patch(
                `${apiUrl}/api/events/admin/stall-booking/${eventId}/${bookingId}/status`,
                { status },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSelectedEvent(res.data);
            setEvents((prev) => prev.map((e) => (e._id === eventId ? res.data : e)));
            alert(`Booking successfully ${status.toLowerCase()}!`);
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update booking status.');
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const statusRowClass = (stall) => {
        const s = getBookingStatus(stall.status);
        if (s === 'Approved') return 'food-stall-bookings-status food-stall-bookings-status--approved';
        if (s === 'Rejected') return 'food-stall-bookings-status food-stall-bookings-status--rejected';
        return 'food-stall-bookings-status food-stall-bookings-status--pending';
    };

    return (
        <div className="upcoming-page food-stall-bookings-page animation-fade-in">
            <div className="page-header-block">
                <h1 className="page-main-title food-stall-bookings-page-title">FOOD STALL BOOKINGS TRACKER</h1>
                <p className="page-main-subtitle">
                    Monitor interactive vendor map placements.
                </p>
            </div>

            {loading ? (
                <div
                    className="events-grid food-stall-map-skeleton-grid"
                    aria-busy="true"
                    aria-live="polite"
                    aria-label="Loading events"
                >
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="food-stall-map-skeleton-card">
                            <div className="food-stall-map-skeleton food-stall-map-skeleton--hero" />
                            <div className="food-stall-map-skeleton-card-body">
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--title" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--pill" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--line" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--line food-stall-map-skeleton--line-short" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--line food-stall-map-skeleton--line-mid" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--btn" />
                                <div className="food-stall-map-skeleton-divider" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--bank-title" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--input" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--input" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--input" />
                                <div className="food-stall-map-skeleton food-stall-map-skeleton--bank-actions">
                                    <div className="food-stall-map-skeleton food-stall-map-skeleton--action" />
                                    <div className="food-stall-map-skeleton food-stall-map-skeleton--action" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !selectedEvent ? (
                <>
                    {events.length === 0 ? (
                        <div className="glass-panel empty-state">
                            <div className="empty-big-icon">🍔</div>
                            <h3>No mapped events</h3>
                            <p>You haven&apos;t uploaded a stall map to any upcoming events yet.</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {events.map((ev) => {
                                const dateObj = new Date(ev.date);
                                const month = dateObj.toLocaleString('default', { month: 'short' });
                                const day = dateObj.getDate();

                                return (
                                    <div
                                        key={ev._id}
                                        role="button"
                                        tabIndex={0}
                                        className="event-card glass-panel food-stall-map-event-card animation-fade-in"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSelectEvent(ev)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSelectEvent(ev);
                                            }
                                        }}
                                    >
                                        <div
                                            className="card-img-wrapper food-stall-bookings-card-map"
                                            style={{ height: '160px' }}
                                        >
                                            <img src={ev.stallMapUrl} alt={`${ev.name} map`} />
                                        </div>

                                        <div className="card-content">
                                            <h3 style={{ marginBottom: '0.2rem' }}>{ev.name}</h3>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <span className="food-stall-map-status-pill">{ev.status}</span>
                                            </div>

                                            <div className="card-details">
                                                <div className="detail-item">
                                                    <span>📅</span> {month} {day}, {ev.time}
                                                </div>
                                                <div className="detail-item">
                                                    <span className="food-stall-loc-pin-wrap" aria-hidden>
                                                        <Icon
                                                            icon="mdi:map-marker"
                                                            className="food-stall-loc-pin-icon"
                                                            width={22}
                                                            height={22}
                                                        />
                                                    </span>
                                                    {ev.location}
                                                </div>
                                                <div className="food-stall-bookings-card-stat">
                                                    <span className="food-stall-bookings-card-stat-meta">
                                                        {ev.bookedStalls?.length || 0} booked stalls
                                                    </span>
                                                    <span className="food-stall-bookings-view-details-btn">
                                                        View details →
                                                    </span>
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
                <div className="food-stall-bookings-detail animation-slide-up">
                    <button
                        type="button"
                        className="food-stall-bookings-back-btn"
                        onClick={() => setSelectedEvent(null)}
                    >
                        ← Back to event list
                    </button>

                    <div className="glass-panel food-stall-bookings-panel">
                        <h2 className="food-stall-bookings-map-heading">{selectedEvent.name} — stall placements</h2>
                        <p className="food-stall-bookings-map-lead">
                            Visual overview of all locked-in container coordinates for this blueprint.
                        </p>

                        <div className="food-stall-bookings-map-frame">
                            <img src={selectedEvent.stallMapUrl} alt="Event stall map" />

                            {selectedEvent.bookedStalls?.map((stall, idx) =>
                                stall.x != null && stall.y != null ? (
                                    <div
                                        key={stall._id || idx}
                                        className="food-stall-bookings-map-marker"
                                        style={{
                                            left: `${stall.x}%`,
                                            top: `${stall.y}%`
                                        }}
                                        title={`${stall.stallName} by ${stall.vendorName}`}
                                    >
                                        {idx + 1}
                                    </div>
                                ) : null
                            )}
                        </div>
                    </div>

                    <div className="glass-panel food-stall-bookings-panel food-stall-bookings-panel--vendors">
                        <h2 className="food-stall-bookings-section-title">Registered vendors</h2>
                        {selectedEvent.bookedStalls?.length === 0 ? (
                            <p className="food-stall-bookings-empty-note">
                                No stalls have been booked for this event yet.
                            </p>
                        ) : (
                            <div className="food-stall-bookings-list">
                                {selectedEvent.bookedStalls?.map((stall, idx) => (
                                    <div key={stall._id || idx} className="food-stall-bookings-vendor-row">
                                        <div className="food-stall-bookings-vendor-main">
                                            <p className="food-stall-bookings-vendor-name-row">
                                                <span className="food-stall-bookings-vendor-index">{idx + 1}</span>
                                                {stall.stallName}
                                            </p>
                                            <p className="food-stall-bookings-vendor-meta">
                                                Vendor: <strong>{stall.vendorName}</strong>
                                                <br />
                                                <span className="food-stall-bookings-food-type">
                                                    {stall.foodType || 'Food'}
                                                </span>{' '}
                                                | <strong>Stall: {stall.stallLocation || 'N/A'}</strong>
                                                <br />
                                                Description: {stall.description || 'No description provided.'}
                                                <br />
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Utilities:{' '}
                                                    {stall.needsElectricity ? '⚡ Electricity' : ''}{' '}
                                                    {stall.needsElectricity && stall.needsWater ? '|' : ''}{' '}
                                                    {stall.needsWater ? '💧 Water' : ''}
                                                    {!stall.needsElectricity && !stall.needsWater && 'None'}
                                                </span>
                                                {stall.paymentReceipt && (
                                                    <>
                                                        <br />
                                                        <button
                                                            type="button"
                                                            className="food-stall-bookings-receipt-link"
                                                            onClick={() => setViewingImage(stall.paymentReceipt)}
                                                        >
                                                            View payment receipt
                                                        </button>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <div className="food-stall-bookings-vendor-side">
                                            <p className="food-stall-bookings-price">
                                                Rs {stall.totalPrice?.toLocaleString() ?? '—'}
                                            </p>
                                            <p className="food-stall-bookings-coords">
                                                {stall.x != null && stall.y != null
                                                    ? `X: ${stall.x.toFixed(1)}% | Y: ${stall.y.toFixed(1)}%`
                                                    : 'Position: not assigned'}
                                            </p>
                                            <div>
                                                <span className={statusRowClass(stall)}>
                                                    {getBookingStatus(stall.status)}
                                                </span>
                                            </div>
                                            <p className="food-stall-bookings-booked-at">
                                                Booked: {new Date(stall.bookedAt).toLocaleDateString()}
                                            </p>
                                            {getBookingStatus(stall.status) === 'Pending' && (
                                                <div className="food-stall-bookings-actions">
                                                    <button
                                                        type="button"
                                                        className="food-stall-bookings-btn-approve"
                                                        onClick={() =>
                                                            updateStatus(selectedEvent._id, stall._id, 'Approved')
                                                        }
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="food-stall-bookings-btn-reject"
                                                        onClick={() =>
                                                            updateStatus(selectedEvent._id, stall._id, 'Rejected')
                                                        }
                                                    >
                                                        Reject
                                                    </button>
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

            {viewingImage &&
                createPortal(
                    <div
                        className="food-stall-bookings-receipt-overlay"
                        role="presentation"
                        onClick={() => setViewingImage(null)}
                    >
                        <div
                            className="food-stall-bookings-receipt-inner"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Payment receipt"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="food-stall-bookings-receipt-close"
                                onClick={() => setViewingImage(null)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <img
                                className="food-stall-bookings-receipt-img"
                                src={viewingImage}
                                alt="Payment receipt"
                            />
                            <p className="food-stall-bookings-receipt-caption">Payment receipt</p>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};
//fix
export default FoodStallBookings;
