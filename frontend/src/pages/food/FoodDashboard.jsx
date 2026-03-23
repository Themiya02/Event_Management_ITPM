import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './FoodDashboard.css';

const BASE_STALL_PRICE = 10000;
const ELECTRICITY_PRICE = 3000;
const WATER_PRICE = 2000;

const FoodDashboard = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [stallName, setStallName] = useState('');
  const [stallLocation, setStallLocation] = useState('');
  const [description, setDescription] = useState('');
  const [foodType, setFoodType] = useState('Fast Food');
  const [needsElectricity, setNeedsElectricity] = useState(false);
  const [needsWater, setNeedsWater] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getToken = () => JSON.parse(localStorage.getItem('user'))?.token;
  const formatStatus = (status) => status || 'Pending';
  const normalizedInputStall = stallLocation.trim().toLowerCase();
  const isDuplicateStallLocation = Boolean(
    selectedEvent &&
    normalizedInputStall &&
    (selectedEvent.bookedStalls || []).some(
      (stall) => String(stall.stallLocation || '').trim().toLowerCase() === normalizedInputStall
    )
  );

  const totalPrice = useMemo(() => {
    return BASE_STALL_PRICE + (needsElectricity ? ELECTRICITY_PRICE : 0) + (needsWater ? WATER_PRICE : 0);
  }, [needsElectricity, needsWater]);

  const allMyBookings = useMemo(() => {
    return events.flatMap((event) =>
      (event.bookedStalls || [])
        .filter((stall) => String(stall.vendorId) === String(user?._id))
        .map((stall) => ({
          ...stall,
          eventName: event.name,
          eventDate: event.date
        }))
    );
  }, [events, user?._id]);

  const pendingCount = useMemo(
    () => allMyBookings.filter((booking) => formatStatus(booking.status) === 'Pending').length,
    [allMyBookings]
  );
  const eventsWithBankDetails = useMemo(
    () =>
      events.filter((event) => {
        const details = event.bankDetails || {};
        return Boolean(
          details.accountName ||
          details.bankName ||
          details.accountNumber ||
          details.branch ||
          details.instructions
        );
      }),
    [events]
  );

  useEffect(() => {
    document.body.classList.add('food-modern-bg');

    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/events/mapped`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setEvents(res.data);
      } catch (error) {
        setErrorMessage('Failed to load events. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      document.body.classList.remove('food-modern-bg');
    };
  }, [apiUrl]);

  const resetForm = () => {
    setStallName('');
    setStallLocation('');
    setDescription('');
    setFoodType('Fast Food');
    setNeedsElectricity(false);
    setNeedsWater(false);
    setPaymentReceipt(null);
  };

  const openEvent = (event) => {
    setSelectedEvent(event);
    setActiveTab('application');
    setErrorMessage('');
    setSuccessMessage('');
    resetForm();
  };

  const handleBookStall = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!stallName.trim()) {
      setErrorMessage('Stall name is required.');
      return;
    }
    if (!stallLocation.trim()) {
      setErrorMessage('Stall location is required.');
      return;
    }
    if (isDuplicateStallLocation) {
      setErrorMessage(`Stall "${stallLocation.trim()}" is already in use. Please enter a different stall.`);
      return;
    }
    if (!paymentReceipt) {
      setErrorMessage('Payment receipt is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${apiUrl}/api/events/${selectedEvent._id}/book-stall`,
        {
          stallLocation,
          stallName,
          description,
          foodType,
          needsElectricity,
          needsWater,
          paymentReceipt
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );

      setSelectedEvent(res.data);
      setEvents((prev) => prev.map((event) => (event._id === res.data._id ? res.data : event)));
      setSuccessMessage('Application submitted. Status is Pending until admin approval.');
      resetForm();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="food-loading">Loading vendor dashboard...</div>;
  }

  return (
    <div className="food-shell">
      <aside className="food-sidebar">
        <div className="food-sidebar-brand">
          <h2>Vendor Portal</h2>
          <p>Food Stall Workspace</p>
        </div>
        <nav className="food-sidebar-nav">
          <button
            type="button"
            className={`food-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedEvent(null);
            }}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`food-nav-item ${activeTab === 'application' ? 'active' : ''}`}
            onClick={() => setActiveTab('application')}
          >
            Stall Application
          </button>
          <button
            type="button"
            className={`food-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('payments');
              setSelectedEvent(null);
            }}
          >
            Payment Details
          </button>
          {/* <button type="button" className="food-nav-item muted">
            Allocation Table
          </button> */}
        </nav>
        <div className="food-sidebar-footer">
          <p>{user?.name || 'Vendor'}</p>
          <span>{user?.email || 'Signed in'}</span>
        </div>
      </aside>

      <main className="food-main">
        <header className="food-topbar">
          <div>
            <h1 className="text-gradient">Food Stall Vendor Portal</h1>
            <p>Plan your stall, upload receipt, and track approval status in one place.</p>
          </div>
          <button onClick={logout} className="food-btn-outline">Logout</button>
        </header>

        {!!errorMessage && <div className="food-alert food-alert-error">{errorMessage}</div>}
        {!!successMessage && <div className="food-alert food-alert-success">{successMessage}</div>}

        {activeTab === 'payments' ? (
          <section className="food-payment-cards">
            <div className="food-section-intro glass-panel">
              <h2>Payment Details by Event</h2>
              <p>These bank details are entered by admins. Use them to complete your transfer before submitting applications.</p>
            </div>
            {eventsWithBankDetails.length === 0 ? (
              <div className="glass-panel food-empty-state">
                <h2>No bank details available yet</h2>
                <p>Ask admin to add bank details for events so they appear here.</p>
              </div>
            ) : (
              <div className="food-payment-grid">
                {eventsWithBankDetails.map((event) => (
                  <article key={event._id} className="glass-panel food-payment-card">
                    <div className="food-payment-card-head">
                      <h3>{event.name}</h3>
                      <button type="button" className="food-link-btn" onClick={() => openEvent(event)}>
                        Open Event
                      </button>
                    </div>
                    <p className="food-payment-meta">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                    <div className="food-payment-details">
                      <p><span>Account Name</span><strong>{event.bankDetails?.accountName || '-'}</strong></p>
                      <p><span>Bank Name</span><strong>{event.bankDetails?.bankName || '-'}</strong></p>
                      <p><span>Account Number</span><strong>{event.bankDetails?.accountNumber || '-'}</strong></p>
                      <p><span>Branch</span><strong>{event.bankDetails?.branch || '-'}</strong></p>
                    </div>
                    {event.bankDetails?.instructions && (
                      <p className="food-payment-instructions">
                        <span>Instructions:</span> {event.bankDetails.instructions}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : !selectedEvent ? (
          <>
            <section className="food-stats-grid">
              <article className="glass-panel food-stat-card">
                <p>Mapped Events</p>
                <h3>{events.length}</h3>
              </article>
              <article className="glass-panel food-stat-card">
                <p>My Applications</p>
                <h3>{allMyBookings.length}</h3>
              </article>
              <article className="glass-panel food-stat-card">
                <p>Pending Reviews</p>
                <h3>{pendingCount}</h3>
              </article>
            </section>

            {events.length === 0 ? (
              <div className="glass-panel food-empty-state">
                <h2>No events available for stall booking</h2>
                <p>Admins have not uploaded stall maps yet. Check back later.</p>
              </div>
            ) : (
              <section className="food-events-grid">
                {events.map((event) => (
                  <article
                    key={event._id}
                    className="glass-panel food-event-card"
                    onClick={() => openEvent(event)}
                  >
                    <div className="food-event-meta">
                      <h3>{event.name}</h3>
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="food-event-footer">
                      <small>{event.bookedStalls?.length || 0} stalls already booked</small>
                      <strong>Open Booking</strong>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {allMyBookings.length > 0 && (
              <section className="glass-panel food-my-applications">
                <h2>My Applications</h2>
                <div className="food-application-list">
                  {allMyBookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="food-application-item">
                      <div>
                        <h4>{booking.stallName}</h4>
                        <p>{booking.eventName} - {new Date(booking.eventDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`food-status-pill food-status-${formatStatus(booking.status).toLowerCase()}`}>
                        {formatStatus(booking.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="food-booking-layout">
            <div className="food-map-panel glass-panel">
              <div className="food-section-header">
                <button className="food-back-btn" onClick={() => setSelectedEvent(null)}>← Back</button>
                <div>
                  <h2>{selectedEvent.name}</h2>
                  <p>Map preview of the event stall layout.</p>
                </div>
              </div>

              <div className="food-map-wrapper">
                <img src={selectedEvent.stallMapUrl} alt={`${selectedEvent.name} stall map`} />

                {(selectedEvent.bookedStalls || [])
                  .filter((stall) => stall.x !== undefined && stall.y !== undefined)
                  .map((stall) => {
                  const isMine = String(stall.vendorId) === String(user?._id);
                  const status = formatStatus(stall.status);
                  return (
                    <button
                      key={stall._id}
                      type="button"
                      className={`food-map-marker ${isMine ? 'mine' : ''} ${status.toLowerCase()}`}
                      style={{ left: `${stall.x}%`, top: `${stall.y}%` }}
                      title={`${stall.stallName} - ${status}`}
                    />
                  );
                })}
              </div>

              {/* <div className="food-map-help">
                <span><i className="dot mine" /> My stalls</span>
                <span><i className="dot pending" /> Pending</span>
                <span><i className="dot approved" /> Approved</span>
                <span><i className="dot rejected" /> Rejected</span>
              </div> */}

              <div className="food-stall-table-wrap">
                <h4>Stall Allocation Table</h4>
                {(selectedEvent.bookedStalls || []).filter(
                  (stall) => formatStatus(stall.status) === 'Approved'
                ).length === 0 ? (
                  <p className="food-stall-table-empty">No approved stall allocations yet for this event.</p>
                ) : (
                  <table className="food-stall-table">
                    <thead>
                      <tr>
                        <th>Stall</th>
                        <th>Owner Name</th>
                        <th>Stall Name</th>
                        <th>Food Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedEvent.bookedStalls || [])
                        .filter((stall) => formatStatus(stall.status) === 'Approved')
                        .map((stall) => (
                        <tr key={stall._id}>
                          <td>{stall.stallLocation || '-'}</td>
                          <td>{stall.vendorName || '-'}</td>
                          <td>{stall.stallName || '-'}</td>
                          <td>{stall.foodType || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="glass-panel food-form-panel">
              <h3>Submit Stall Application</h3>
              {(selectedEvent.bankDetails?.accountName ||
                selectedEvent.bankDetails?.bankName ||
                selectedEvent.bankDetails?.accountNumber ||
                selectedEvent.bankDetails?.branch ||
                selectedEvent.bankDetails?.instructions) && (
                <div className="food-bank-details-card">
                  <h4>Bank Details (Provided by Admin)</h4>
                  <div className="food-bank-grid">
                    <p><span>Account Name</span><strong>{selectedEvent.bankDetails?.accountName || '-'}</strong></p>
                    <p><span>Bank Name</span><strong>{selectedEvent.bankDetails?.bankName || '-'}</strong></p>
                    <p><span>Account Number</span><strong>{selectedEvent.bankDetails?.accountNumber || '-'}</strong></p>
                    <p><span>Branch</span><strong>{selectedEvent.bankDetails?.branch || '-'}</strong></p>
                  </div>
                  {selectedEvent.bankDetails?.instructions && (
                    <p className="food-bank-instructions">
                      <span>Instructions:</span> {selectedEvent.bankDetails.instructions}
                    </p>
                  )}
                </div>
              )}
              <form onSubmit={handleBookStall} className="food-form">
                <label>
                  Stall Location *
                  <input
                    type="text"
                    value={stallLocation}
                    onChange={(e) => setStallLocation(e.target.value)}
                    placeholder="Example: A-01"
                    required
                  />
                </label>
                {stallLocation.trim() && isDuplicateStallLocation && (
                  <p className="food-inline-error">
                    This stall is already taken. Please choose another stall letter/code.
                  </p>
                )}

                <label>
                  Stall Name *
                  <input
                    type="text"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    placeholder="Example: Chill Bites"
                    required
                  />
                </label>

                <label>
                  Food Type
                  <select value={foodType} onChange={(e) => setFoodType(e.target.value)} required>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Traditional Food">Traditional Food</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Description
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will you sell?"
                    rows="3"
                  />
                </label>

                <div className="food-form-checks">
                  <label><input type="checkbox" checked={needsElectricity} onChange={(e) => setNeedsElectricity(e.target.checked)} /> Electricity (+Rs 3,000)</label>
                  <label><input type="checkbox" checked={needsWater} onChange={(e) => setNeedsWater(e.target.checked)} /> Water (+Rs 2,000)</label>
                </div>

                <div className="food-price-box">
                  <p><span>Base Price</span><strong>Rs {BASE_STALL_PRICE.toLocaleString()}</strong></p>
                  {needsElectricity && <p><span>Electricity</span><strong>Rs {ELECTRICITY_PRICE.toLocaleString()}</strong></p>}
                  {needsWater && <p><span>Water</span><strong>Rs {WATER_PRICE.toLocaleString()}</strong></p>}
                  <p className="total"><span>Total</span><strong>Rs {totalPrice.toLocaleString()}</strong></p>
                </div>

                <label>
                  Payment Receipt *
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setPaymentReceipt(reader.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                <button type="submit" className="food-submit-btn" disabled={submitting || isDuplicateStallLocation}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>

                <p className="food-form-note">
                  After submission your status remains <strong>Pending</strong> until admin approves.
                </p>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default FoodDashboard;
