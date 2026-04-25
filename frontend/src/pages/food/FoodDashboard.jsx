import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import FoodStallLayout from '../../components/layout/FoodStallLayout';
import './FoodDashboard.css';

const ELECTRICITY_PRICE = 3000;
const WATER_PRICE = 2000;

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

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';

    const getToken = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr)?.token : null;
    };

    const formatStatus = (status) => status || 'Pending';
    
    const normalizedInputStall = stallLocation.trim().toLowerCase();
    
    const isDuplicateStallLocation = useMemo(() => {
        if (!selectedEvent || !normalizedInputStall) return false;
        return (selectedEvent.bookedStalls || []).some((stall) => {
            const same = String(stall.stallLocation || '').trim().toLowerCase() === normalizedInputStall;
            if (!same) return false;
            if (editingBookingId && String(stall._id) === String(editingBookingId)) return false;
            return true;
        });
    }, [selectedEvent, normalizedInputStall, editingBookingId]);

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
                    eventDate: event.date,
                    eventId: event._id
                }))
        );
    }, [events, user?._id]);

    const pendingCount = useMemo(
        () => allMyBookings.filter((booking) => formatStatus(booking.status) === 'Pending').length,
        [allMyBookings]
    );

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = getToken();
                const res = await axios.get(`${apiUrl}/api/events/mapped`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(res.data);
            } catch (error) {
                console.error('Fetch events error:', error);
                setErrorMessage('Failed to load events.');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchEvents();
    }, [apiUrl, user]);

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
        
        if (!stallName.trim()) return Swal.fire('Error', 'Stall name is required.', 'warning');
        if (stallName.trim().length < 3) return Swal.fire('Error', 'Stall name too short.', 'warning');
        if (!stallLocation.trim()) return Swal.fire('Error', 'Please select a stall location.', 'warning');
        if (isDuplicateStallLocation) return Swal.fire('Error', 'Stall already taken.', 'warning');
        if (!editingBookingId && !paymentReceipt) return Swal.fire('Error', 'Payment receipt is required.', 'warning');

        setSubmitting(true);
        try {
            const token = getToken();
            const payload = {
                stallLocation,
                stallName,
                description,
                foodType,
                needsElectricity,
                needsWater,
                paymentReceipt
            };

            let res;
            if (editingBookingId) {
                res = await axios.patch(
                    `${apiUrl}/api/events/${selectedEvent._id}/stall-booking/${editingBookingId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Swal.fire('Success', 'Application updated.', 'success');
            } else {
                res = await axios.post(
                    `${apiUrl}/api/events/${selectedEvent._id}/book-stall`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Swal.fire('Success', 'Application submitted.', 'success');
            }

            // Update local state
            setEvents(prev => prev.map(ev => ev._id === res.data._id ? res.data : ev));
            setSelectedEvent(res.data);
            resetForm();
            setActiveTab('dashboard');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to process application.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (booking) => {
        const event = events.find(e => e._id === booking.eventId);
        if (!event) return;
        setSelectedEvent(event);
        setStallName(booking.stallName || '');
        setStallLocation(booking.stallLocation || '');
        setDescription(booking.description || '');
        setFoodType(booking.foodType || 'Fast Food');
        setNeedsElectricity(!!booking.needsElectricity);
        setNeedsWater(!!booking.needsWater);
        setEditingBookingId(booking._id);
        setActiveTab('application');
    };

    const handleDeleteClick = async (booking) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will delete your stall application.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = getToken();
                await axios.delete(
                    `${apiUrl}/api/events/${booking.eventId}/stall-booking/${booking._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                setEvents(prev => prev.map(e => {
                    if (e._id === booking.eventId) {
                        return { ...e, bookedStalls: (e.bookedStalls || []).filter(s => s._id !== booking._id) };
                    }
                    return e;
                }));
                
                Swal.fire('Deleted!', 'Application removed.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete application.', 'error');
            }
        }
    };

    if (loading) return <div className="food-loading">Loading Vendor Portal...</div>;

    return (
        <FoodStallLayout>
            <div className="food-vendor-dashboard">

      <div className="food-stats-grid">
        <div className="glass-panel food-stat-card">
          <p>Available Events</p>
          <h3>{events.length}</h3>
        </div>
        <div className="glass-panel food-stat-card">
          <p>My Applications</p>
          <h3>{allMyBookings.length}</h3>
        </div>
        <div className="glass-panel food-stat-card">
          <p>Pending Review</p>
          <h3>{pendingCount}</h3>
        </div>
      </div>

      <div className="tab-navigation">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSelectedEvent(null); }}>
          <Icon icon="mdi:view-dashboard" /> Events
        </button>
        <button className={`tab-btn ${activeTab === 'my-bookings' ? 'active' : ''}`} onClick={() => { setActiveTab('my-bookings'); setSelectedEvent(null); }}>
          <Icon icon="mdi:clipboard-list" /> My Bookings
        </button>
      </div>

      <div className="dashboard-main-content">
        {activeTab === 'dashboard' && !selectedEvent && (
          <div className="events-grid">
            {events.map(event => (
              <div key={event._id} className="event-card glass-panel" onClick={() => openEvent(event)}>
                <div className="card-img-wrapper">
                  {event.imageUrl ? <img src={event.imageUrl} alt={event.name} /> : <div className="placeholder-img"><span>{event.name.charAt(0)}</span></div>}
                </div>
                <div className="card-content">
                  <h3>{event.name}</h3>
                  <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
                  <button className="food-primary-btn">Book Stall</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-bookings' && (
          <div className="glass-panel my-bookings-section">
            <h2>My Stall Applications</h2>
            {allMyBookings.length === 0 ? (
              <p>No applications found.</p>
            ) : (
              <div className="booking-list">
                {allMyBookings.map(booking => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-info">
                      <h4>{booking.stallName} ({booking.stallLocation})</h4>
                      <p>{booking.eventName}</p>
                    </div>
                    <div className="booking-actions">
                      <span className={`status-pill ${formatStatus(booking.status).toLowerCase()}`}>
                        {formatStatus(booking.status)}
                      </span>
                      {formatStatus(booking.status) === 'Pending' && (
                        <div className="action-btns">
                          <button onClick={() => handleEditClick(booking)} className="edit-icon-btn"><Icon icon="mdi:pencil" /></button>
                          <button onClick={() => handleDeleteClick(booking)} className="delete-icon-btn"><Icon icon="mdi:trash-can" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'application' && selectedEvent && (
          <div className="booking-layout">
            <div className="map-panel glass-panel">
              <button className="back-btn" onClick={() => { setSelectedEvent(null); setActiveTab('dashboard'); }}>← Back to Events</button>
              <h2>{selectedEvent.name} - Stall Map</h2>
              <div className="map-container">
                {selectedEvent.stallMapUrl ? (
                  <img src={selectedEvent.stallMapUrl} alt="Stall Map" className="map-image" />
                ) : (
                  <p className="no-map-msg">No map available for this event.</p>
                )}
              </div>
            </div>

            <div className="form-panel glass-panel">
              <h3>{editingBookingId ? 'Edit Application' : 'New Stall Application'}</h3>
              <form onSubmit={handleBookStall} className="stall-form">
                <label>
                  Stall Location *
                  <select value={stallLocation} onChange={(e) => setStallLocation(e.target.value)} required>
                    <option value="">Select a stall...</option>
                    {stallOptions.map(opt => (
                      <option key={opt.stall} value={opt.stall}>{opt.stall} - Rs {Number(opt.price).toLocaleString()}</option>
                    ))}
                  </select>
                </label>

                {isDuplicateStallLocation && <p className="error-text">This stall is already reserved.</p>}

                <label>
                  Stall Name *
                  <input type="text" value={stallName} onChange={(e) => setStallName(e.target.value)} placeholder="e.g. Tasty Treats" required />
                </label>

                <label>
                  Food Type *
                  <select value={foodType} onChange={(e) => setFoodType(e.target.value)} required>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe what you sell..." rows="3" />
                </label>

                <div className="checkbox-row">
                  <label><input type="checkbox" checked={needsElectricity} onChange={e => setNeedsElectricity(e.target.checked)} /> Electricity (+Rs 3,000)</label>
                  <label><input type="checkbox" checked={needsWater} onChange={e => setNeedsWater(e.target.checked)} /> Water (+Rs 2,000)</label>
                </div>

                <div className="price-summary">
                  <p>Total: <strong>Rs {totalPrice.toLocaleString()}</strong></p>
                </div>

                <label>
                  Payment Receipt {editingBookingId ? '(Optional)' : '*'}
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPaymentReceipt(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} required={!editingBookingId} />
                </label>

                <button type="submit" className="submit-btn" disabled={submitting || isDuplicateStallLocation}>
                  {submitting ? 'Processing...' : (editingBookingId ? 'Update Application' : 'Submit Application')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  </FoodStallLayout>
  );
};

export default FoodDashboard;
