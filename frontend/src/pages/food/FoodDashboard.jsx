import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import Topbar from '../../components/layout/Topbar';
import '../../components/layout/OrganizerLayout.css';
import '../user/UserDashboard.css';
import './FoodDashboard.css';

const ELECTRICITY_PRICE = 3000;
const WATER_PRICE = 2000;
//fix
const FoodDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
  const [editingBookingId, setEditingBookingId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getToken = () => JSON.parse(localStorage.getItem('user'))?.token;
  const formatStatus = (status) => status || 'Pending';
  const normalizedInputStall = stallLocation.trim().toLowerCase();
  const isDuplicateStallLocation = Boolean(
    selectedEvent &&
    normalizedInputStall &&
    (selectedEvent.bookedStalls || []).some((stall) => {
      const same =
        String(stall.stallLocation || '').trim().toLowerCase() === normalizedInputStall;
      if (!same) return false;
      if (editingBookingId && String(stall._id) === String(editingBookingId)) return false;
      return true;
    })
  );

  const stallOptions = selectedEvent?.stallPricing || [];
  const hasStallOptions = stallOptions.length > 0;

  const selectedStallRow = useMemo(() => {
    if (!stallOptions.length || !stallLocation.trim()) return null;
    const key = stallLocation.trim().toLowerCase();
    return stallOptions.find(
      (s) => String(s.stall || '').trim().toLowerCase() === key
    );
  }, [stallOptions, stallLocation]);

  const baseStallAmount = selectedStallRow != null ? Number(selectedStallRow.price) : null;

  const totalPrice = useMemo(() => {
    const base = baseStallAmount != null && !Number.isNaN(baseStallAmount) ? baseStallAmount : 0;
    return base + (needsElectricity ? ELECTRICITY_PRICE : 0) + (needsWater ? WATER_PRICE : 0);
  }, [baseStallAmount, needsElectricity, needsWater]);

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
  }, [apiUrl]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetForm = () => {
    setStallName('');
    setStallLocation('');
    setDescription('');
    setFoodType('Fast Food');
    setNeedsElectricity(false);
    setNeedsWater(false);
    setPaymentReceipt(null);
    setEditingBookingId(null);
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

    const swalValidation = (text) =>
      Swal.fire({
        icon: 'warning',
        title: 'Cannot submit',
        text,
        confirmButtonColor: '#2563eb'
      });

    if (!stallName.trim()) {
      await swalValidation('Stall name is required.');
      return;
    }
    if (stallName.trim().length < 5) {
      await swalValidation('Stall name must have at least 5 letters.');
      return;
    }
    if (!hasStallOptions) {
      await swalValidation('This event has no stalls configured yet. Please contact the organizer.');
      return;
    }
    if (!stallLocation.trim()) {
      await swalValidation('Please select a stall location.');
      return;
    }
    if (!selectedStallRow) {
      await swalValidation('Selected stall is not valid for this event.');
      return;
    }

    if (isDuplicateStallLocation) {
      await swalValidation(
        `Stall "${stallLocation.trim()}" is already in use. Please choose another stall.`
      );
      return;
    }

    if (!editingBookingId && !paymentReceipt) {
      await swalValidation('Payment receipt is required.');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (editingBookingId) {
        res = await axios.patch(
          `${apiUrl}/api/events/${selectedEvent._id}/stall-booking/${editingBookingId}`,
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
        await Swal.fire({
          icon: 'success',
          title: 'Application updated',
          text: 'Your stall application was updated successfully.',
          confirmButtonColor: '#2563eb'
        });
      } else {
        res = await axios.post(
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
        await Swal.fire({
          icon: 'success',
          title: 'Application submitted',
          text: 'Your application was received. Status stays Pending until an admin approves it.',
          confirmButtonColor: '#2563eb'
        });
      }

      setSelectedEvent(res.data);
      setEvents((prev) => prev.map((event) => (event._id === res.data._id ? res.data : event)));
      resetForm();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to process booking. Please try again.';
      await Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: msg,
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (booking) => {
    // Find the event ID for this booking
    const event = events.find(e => (e.bookedStalls || []).some(s => s._id === booking._id));
    if (!event) return;

    setSelectedEvent(event);
    setStallName(booking.stallName || '');
    setStallLocation(booking.stallLocation || '');
    setDescription(booking.description || '');
    setFoodType(booking.foodType || 'Fast Food');
    setNeedsElectricity(!!booking.needsElectricity);
    setNeedsWater(!!booking.needsWater);
    // Note: we don't pre-fill paymentReceipt (file input can't be set programmatically)
    // The backend update should ignore it if null

    setEditingBookingId(booking._id);
    setActiveTab('application');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (booking) => {
    // Find event ID
    const event = events.find(e => (e.bookedStalls || []).some(s => s._id === booking._id));
    if (!event) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to delete this stall application. This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/api/events/${event._id}/stall-booking/${booking._id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setEvents(prev => prev.map(e => e._id === event._id ? { 
          ...e, 
          bookedStalls: (e.bookedStalls || []).filter(s => s._id !== booking._id) 
        } : e));
        Swal.fire('Deleted!', 'Your application has been removed.', 'success');
      } catch (error) {
        setErrorMessage('Failed to delete application.');
      }
    }
  };

  if (loading) {
    return (
      <div className="food-loading food-loading-screen">
        <div className="food-loading-spinner" aria-hidden />
        <p>Loading vendor dashboard…</p>
      </div>
    );
  }

  return (
    <div className="organizer-layout food-vendor-layout">
      <aside className="food-sidebar">
        <div className="food-sidebar-brand">
          <div className="food-sidebar-header-row">
            <div className="food-logo-icon" aria-hidden />
            <div className="food-sidebar-brand-text">
              <h2 className="food-sidebar-product-title">Eventio</h2>
              <span className="food-vendor-role-badge">Vendor portal</span>
              <p className="food-sidebar-tagline">Food stall workspace</p>
            </div>
          </div>
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
          {/* <p>{user?.name || 'Vendor'}</p> */}
          {/* <span>{user?.email || 'Signed in'}</span> */}
          <button type="button" className="food-sidebar-logout" onClick={handleLogout}>
            <svg className="food-sidebar-logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      <div className="main-wrapper admin-app-shell">
        <Topbar />
        <main className="content-area food-main">
          <div className="food-vendor-dashboard animation-fade-in">
            <div className="page-header-block">
              <h1 className="page-main-title">FOOD STALL VENDOR PORTAL</h1>
              <p className="page-main-subtitle">
                Plan your stall, upload your receipt, and track approval in one place.
              </p>
            </div>

            {!!errorMessage && <div className="food-alert food-alert-error">{errorMessage}</div>}
            {!!successMessage && <div className="food-alert food-alert-success">{successMessage}</div>}

            {activeTab === 'payments' ? (
              <section className="food-payment-cards">
                <div className="food-section-intro glass-panel">
                  <h2>Payment Details by Event</h2>
                  <p>These bank details are entered by admins. Use them to complete your transfer before submitting applications.</p>
                </div>
                <div className="food-payment-grid">
                  {eventsWithBankDetails.map((event) => (
                    <article key={event._id} className="glass-panel food-payment-card">
                      <div className="card-img-wrapper food-payment-card-img" style={{ height: '160px' }}>
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.name} />
                        ) : (
                          <div className="placeholder-img">
                            <span>{event.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="food-payment-card-body">
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
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : !selectedEvent ? (
              <>
                <section className="food-stats-grid">
                  <article className="glass-panel food-stat-card">
                    <p>Mapped Events</p>
                    <h3>{events.length}</h3>
                  </article>
                  <article className="glass-panel food-stat-card">
                    <p>MY APPLICATIONS</p>
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
              <section className="events-grid food-vendor-events-grid">
                {events.map((event) => {
                  const dateObj = new Date(event.date);
                  const month = dateObj.toLocaleString('default', { month: 'short' });
                  const day = dateObj.getDate();
                  return (
                    <article
                      key={event._id}
                      className="event-card glass-panel food-vendor-event-card animation-fade-in"
                      onClick={() => openEvent(event)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openEvent(event);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-img-wrapper" style={{ height: '160px' }}>
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.name} />
                        ) : (
                          <div className="placeholder-img">
                            <span>{event.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="card-content">
                        <h3 style={{ marginBottom: '0.35rem' }}>{event.name}</h3>
                        <div className="card-details">
                          <div className="detail-item">
                            <span>📅</span> {month} {day}, {event.time}
                          </div>
                        </div>
                        <div className="food-event-footer">
                          <small className="food-event-footer-meta">
                            {event.bookedStalls?.length || 0} stalls already booked
                          </small>
                          <span className="food-open-booking-btn">Open Booking</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {formatStatus(booking.status) === 'Pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleDeleteClick(booking)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
                              title="Delete Application"
                            >
                              <Icon icon="mdi:trash-can" width="20" height="20" />
                            </button>
                          </div>
                        )}
                        <span className={`food-status-pill food-status-${formatStatus(booking.status).toLowerCase()}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </div>
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
            </div>

            <div className="glass-panel food-form-panel">
                <h3>Submit Stall Application</h3>
                {/* Bank Details (Provided by Admin) */}
                {/* {(selectedEvent.bankDetails?.accountName ||
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
              )} */}
              <form onSubmit={handleBookStall} className="food-form">
                <label>
                  Stall Location *
                  {!hasStallOptions ? (
                    <p className="food-inline-error" style={{ marginTop: '0.35rem' }}>
                      No stalls are available for this event yet. The organizer must add stalls and pricing on the map
                      upload screen.
                    </p>
                  ) : (
                    <select
                      value={stallLocation}
                      onChange={(e) => setStallLocation(e.target.value)}
                      required
                    >
                      <option value="">Select a stall…</option>
                      {stallOptions.map((row) => (
                        <option key={String(row.stall)} value={String(row.stall)}>
                          {String(row.stall)} — Rs {Number(row.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
                {hasStallOptions && stallLocation.trim() && isDuplicateStallLocation && (
                  <p className="food-inline-error">
                    This stall is already taken. Please choose another stall.
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
                  <p>
                    <span>Base Price</span>
                    <strong>
                      {baseStallAmount != null && !Number.isNaN(baseStallAmount)
                        ? `Rs ${baseStallAmount.toLocaleString()}`
                        : '—'}
                    </strong>
                  </p>
                  {needsElectricity && <p><span>Electricity</span><strong>Rs {ELECTRICITY_PRICE.toLocaleString()}</strong></p>}
                  {needsWater && <p><span>Water</span><strong>Rs {WATER_PRICE.toLocaleString()}</strong></p>}
                  <p className="total"><span>Total</span><strong>Rs {totalPrice.toLocaleString()}</strong></p>
                </div>

                <label>
                  Payment Receipt {editingBookingId ? '(optional — upload only if replacing)' : '*'}
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingBookingId}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setPaymentReceipt(reader.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                <button
                  type="submit"
                  className="food-submit-btn"
                  disabled={submitting || !hasStallOptions || isDuplicateStallLocation}
                >
                  {submitting ? 'Processing...' : (editingBookingId ? 'Update Application' : 'Submit Application')}
                </button>

                <p className="food-form-note">
                  After submission your status remains <strong>Pending</strong> until admin approves.
                </p>
              </form>
            </div>
          </section>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

  export default FoodDashboard;
