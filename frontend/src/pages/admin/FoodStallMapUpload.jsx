import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './UpcomingEvents.css';
import '../user/UserDashboard.css';

const FoodStallMapUpload = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapModal, setMapModal] = useState(null);
    const [mapModalSaving, setMapModalSaving] = useState(false);

    const getAuth = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return { token: user?.token, apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5002' };
    };

    const fetchEvents = async () => {
        try {
            const { token, apiUrl } = getAuth();
            // Fetch all events, including pending (upcoming) ones
            const res = await axios.get(`${apiUrl}/api/events/admin/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Show approved and pending events
            setAllEvents(res.data.filter(e => e.status === 'Approved' || e.status === 'Pending'));
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    useEffect(() => {
        if (!mapModal) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mapModal]);

    const handleBankFieldChange = (eventId, field, value) => {
        setBankForms(prev => ({
            ...prev,
            [eventId]: {
                ...prev[eventId],
                [field]: value
            }
        }));
    };
    
    const toggleEdit = (eventId) => {
        setEditingEvents(prev => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    const openStallMapModal = (ev) => {
        const rows =
            ev.stallPricing && ev.stallPricing.length > 0
                ? ev.stallPricing.map((r) => ({
                      stall: String(r.stall ?? ''),
                      price: r.price != null && r.price !== '' ? String(r.price) : ''
                  }))
                : [{ stall: '', price: '' }];
        setMapModal({
            eventId: ev._id,
            eventName: ev.name,
            rows,
            pendingMapUrl: null,
            pendingFileName: null,
            existingMapUrl: ev.stallMapUrl || null
        });
    };

    const closeStallMapModal = () => {
        if (mapModalSaving) return;
        setMapModal(null);
    };

    const updateMapModalRow = (index, field, value) => {
        setMapModal((m) => {
            if (!m) return m;
            const rows = m.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
            return { ...m, rows };
        });
    };

    const addMapModalRow = () => {
        setMapModal((m) => (m ? { ...m, rows: [...m.rows, { stall: '', price: '' }] } : m));
    };

    const onModalMapFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setMapModal((m) =>
                m
                    ? {
                          ...m,
                          pendingMapUrl: reader.result,
                          pendingFileName: file.name
                      }
                    : m
            );
        };
        reader.readAsDataURL(file);
    };

    const handleSaveStallMapModal = async () => {
        if (!mapModal) return;
        const { eventId, rows, pendingMapUrl, existingMapUrl } = mapModal;
        const stallPricing = [];
        const seen = new Set();
        for (const r of rows) {
            const stall = String(r.stall || '').trim();
            const priceRaw = r.price;
            if (!stall && (priceRaw === '' || priceRaw === undefined || priceRaw === null)) continue;
            if (!stall) {
                await Swal.fire({
                    title: 'Invalid row',
                    text: 'Enter a stall name for every row that has a price.',
                    icon: 'warning',
                    confirmButtonColor: '#3b82f6'
                });
                return;
            }
            const price = Number(priceRaw);
            if (Number.isNaN(price) || price < 0) {
                await Swal.fire({
                    title: 'Invalid price',
                    text: `Price for "${stall}" must be a number zero or greater.`,
                    icon: 'warning',
                    confirmButtonColor: '#3b82f6'
                });
                return;
            }
            const key = stall.toLowerCase();
            if (seen.has(key)) {
                await Swal.fire({
                    title: 'Duplicate stall',
                    text: `Stall "${stall}" appears more than once.`,
                    icon: 'warning',
                    confirmButtonColor: '#3b82f6'
                });
                return;
            }
            seen.add(key);
            stallPricing.push({ stall, price });
        }
        if (stallPricing.length === 0) {
            await Swal.fire({
                title: 'Stall table',
                text: 'Add at least one stall with a price.',
                icon: 'warning',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }
        const mapToUse = pendingMapUrl || existingMapUrl;
        if (!mapToUse) {
            await Swal.fire({
                title: 'Map required',
                text: 'Upload a blueprint map image before saving.',
                icon: 'warning',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        const body = { stallPricing };
        if (pendingMapUrl) body.stallMapUrl = pendingMapUrl;

        try {
            setMapModalSaving(true);
            const { token, apiUrl } = getAuth();
            const res = await axios.patch(`${apiUrl}/api/events/admin/${eventId}/stall-map`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllEvents((prev) => prev.map((ev) => (ev._id === eventId ? res.data : ev)));
            setMapModal(null);
            await Swal.fire({
                title: 'Saved',
                text: 'Stall map and pricing have been saved. You can open this dialog again anytime to edit.',
                icon: 'success',
                confirmButtonColor: '#3b82f6'
            });
        } catch (error) {
            console.error('Failed to save stall map', error);
            await Swal.fire({
                title: 'Save failed',
                text: error.response?.data?.message || 'Could not save. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setMapModalSaving(false);
        }
    };

    const handleSaveBankDetails = async (eventId) => {
        try {
            const { token, apiUrl } = getAuth();
            const details = bankForms[eventId] || {};
            const res = await axios.patch(`${apiUrl}/api/events/admin/${eventId}/bank-details`, details, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllEvents(prev => prev.map(ev => ev._id === eventId ? res.data : ev));
            setEditingEvents(prev => ({ ...prev, [eventId]: false }));
            setBankForms(prev => ({
                ...prev,
                [eventId]: {
                    accountName: res.data.bankDetails?.accountName || '',
                    bankName: res.data.bankDetails?.bankName || '',
                    accountNumber: res.data.bankDetails?.accountNumber || '',
                    branch: res.data.bankDetails?.branch || '',
                    instructions: res.data.bankDetails?.instructions || ''
                }
            }));

            await Swal.fire({
                title: "Update Successful",
                text: "The vendor bank details have been updated successfully.",
                icon: "success",
                confirmButtonColor: "#3b82f6",
            });
        } catch (error) {
            console.error('Failed to save bank details', error);
            await Swal.fire({
                title: "Update Failed",
                text: "There was an error updating the bank details. Please try again.",
                icon: "error",
                confirmButtonColor: "#ef4444",
            });
        }
    };

    const handleDeleteBankDetails = async (eventId) => {
        try {
            const { token, apiUrl } = getAuth();
            const res = await axios.delete(`${apiUrl}/api/events/admin/${eventId}/bank-details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllEvents(prev => prev.map(ev => ev._id === eventId ? res.data : ev));
            setBankForms(prev => ({
                ...prev,
                [eventId]: {
                    accountName: '',
                    bankName: '',
                    accountNumber: '',
                    branch: '',
                    instructions: ''
                }
            }));

            await Swal.fire({
                title: "Deleted",
                text: "Bank details have been removed.",
                icon: "info",
                confirmButtonColor: "#ef4444",
            });
        } catch (error) {
            console.error('Failed to delete bank details', error);
            await Swal.fire({
                title: "Delete Failed",
                text: "Could not delete bank details.",
                icon: "error",
                confirmButtonColor: "#ef4444",
            });
        }
    };

    return (
        <div className="upcoming-page food-stall-map-page animation-fade-in">
            <div className="page-header-block food-stall-map-page-header">
                <h1 className="page-main-title food-stall-map-page-title">FOOD STALL MAP UPLOAD</h1>
                <p className="page-main-subtitle">Upload spatial blueprints for upcoming events.</p>
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
            ) : allEvents.length === 0 ? (
                <div className="glass-panel empty-state">
                    <div className="empty-big-icon">🎉</div>
                    <h3>No Active Events</h3>
                    <p>There are currently no upcoming approved or pending events to upload maps for.</p>
                </div>
            ) : (
                <div className="events-grid">
                    {allEvents.map(ev => {
                        const dateObj = new Date(ev.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate();

                        return (
                            <div key={ev._id} className="event-card glass-panel food-stall-map-event-card animation-fade-in">
                                <div className="card-img-wrapper" style={{ height: '160px' }}>
                                    {ev.imageUrl ? (
                                        <img src={ev.imageUrl} alt={ev.name} />
                                    ) : (
                                        <div className="placeholder-img">
                                            <span>{ev.name.charAt(0)}</span>
                                        </div>
                                    )}
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
                                        <div className="detail-item" style={{ marginBottom: '1rem' }}>
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
                                        {ev.stallMapUrl ? (
                                            <div className="food-stall-map-map-status food-stall-map-map-status--ok">
                                                ✓ Map uploaded
                                            </div>
                                        ) : (
                                            <div className="food-stall-map-map-status food-stall-map-map-status--missing">
                                                Map not uploaded yet
                                            </div>
                                        )}
                                        <div className="detail-item food-stall-map-pricing-hint">
                                            {(ev.stallPricing || []).length > 0
                                                ? `${ev.stallPricing.length} stall(s) with pricing`
                                                : 'No stall prices configured'}
                                        </div>
                                    </div>

                                    <div className="card-actions food-stall-map-card-actions">
                                        <button
                                            type="button"
                                            className={`food-stall-map-upload-btn ${ev.stallMapUrl ? 'food-stall-map-upload-btn--outline' : ''}`}
                                            onClick={() => openStallMapModal(ev)}
                                        >
                                            {ev.stallMapUrl ? 'Update Blueprint Map' : 'Upload Blueprint Map'}
                                        </button>
                                    </div>

                                    <div className="food-stall-map-bank">
                                        <h4 className="food-stall-map-bank-title">Bank details for vendors</h4>
                                        <div className="food-stall-map-bank-grid">
                                            <input
                                                type="text"
                                                placeholder="Account Name"
                                                value={bankForms[ev._id]?.accountName || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'accountName', e.target.value)}
                                                className={`food-stall-map-input ${!editingEvents[ev._id] ? 'food-stall-map-input--readonly' : ''}`}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Bank Name"
                                                value={bankForms[ev._id]?.bankName || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'bankName', e.target.value)}
                                                className={`food-stall-map-input ${!editingEvents[ev._id] ? 'food-stall-map-input--readonly' : ''}`}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Account Number"
                                                value={bankForms[ev._id]?.accountNumber || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'accountNumber', e.target.value)}
                                                className={`food-stall-map-input ${!editingEvents[ev._id] ? 'food-stall-map-input--readonly' : ''}`}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Branch"
                                                value={bankForms[ev._id]?.branch || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'branch', e.target.value)}
                                                className={`food-stall-map-input ${!editingEvents[ev._id] ? 'food-stall-map-input--readonly' : ''}`}
                                            />
                                            <textarea
                                                placeholder="Instructions (optional)"
                                                value={bankForms[ev._id]?.instructions || ''}
                                                readOnly={!editingEvents[ev._id]}
                                                onChange={(e) => handleBankFieldChange(ev._id, 'instructions', e.target.value)}
                                                rows={2}
                                                className={`food-stall-map-input food-stall-map-input--textarea ${!editingEvents[ev._id] ? 'food-stall-map-input--readonly' : ''}`}
                                            />
                                            <div className="food-stall-map-bank-actions">
                                            {!editingEvents[ev._id] ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="food-stall-map-bank-btn food-stall-map-bank-btn--primary"
                                                        onClick={() => toggleEdit(ev._id)}
                                                    >
                                                        Edit details
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="food-stall-map-bank-btn food-stall-map-bank-btn--danger"
                                                        onClick={() => handleDeleteBankDetails(ev._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="food-stall-map-bank-btn food-stall-map-bank-btn--primary"
                                                        onClick={() => handleSaveBankDetails(ev._id)}
                                                    >
                                                        Save changes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="food-stall-map-bank-btn food-stall-map-bank-btn--muted"
                                                        onClick={() => toggleEdit(ev._id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {mapModal &&
                createPortal(
                    <div
                        className="stall-map-modal-overlay"
                        role="presentation"
                        onClick={(e) => e.target === e.currentTarget && closeStallMapModal()}
                    >
                        <div
                            className="stall-map-modal-shell"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="stall-map-modal-title"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="stall-map-modal-glow" aria-hidden />
                            <header className="stall-map-modal-header">
                                <div className="stall-map-modal-header-text">
                                    <span className="stall-map-modal-kicker">Food stall setup</span>
                                    <h2 id="stall-map-modal-title" className="stall-map-modal-title">
                                        Blueprint map &amp; stall pricing
                                    </h2>
                                    <p className="stall-map-modal-event">{mapModal.eventName}</p>
                                </div>
                                <button
                                    type="button"
                                    className="stall-map-modal-close"
                                    aria-label="Close"
                                    onClick={closeStallMapModal}
                                    disabled={mapModalSaving}
                                >
                                    <span aria-hidden>×</span>
                                </button>
                            </header>

                            <section className="stall-map-modal-section">
                                <h3 className="stall-map-modal-section-title">Stalls &amp; prices</h3>
                                <p className="stall-map-modal-hint">Vendors will pick from this list. Prices set the base stall fee.</p>
                                <div className="stall-map-modal-table-wrap">
                                    <table className="stall-map-modal-table">
                                        <thead>
                                            <tr>
                                                <th>Stall</th>
                                                <th>Price (Rs)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mapModal.rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="stall-map-modal-cell-input"
                                                            placeholder="e.g. A1"
                                                            value={row.stall}
                                                            onChange={(e) => updateMapModalRow(index, 'stall', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="stall-map-modal-cell-input"
                                                            placeholder="0"
                                                            min={0}
                                                            step="1"
                                                            value={row.price}
                                                            onChange={(e) => updateMapModalRow(index, 'price', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button type="button" className="stall-map-modal-add-row" onClick={addMapModalRow}>
                                    + Add row
                                </button>
                            </section>

                            <section className="stall-map-modal-section">
                                <h3 className="stall-map-modal-section-title">Layout image</h3>
                                <div className="stall-map-modal-upload-block">
                                    <label className="stall-map-modal-file-label">
                                        Upload blueprint
                                        <input type="file" accept="image/*" onChange={onModalMapFile} />
                                    </label>
                                    {mapModal.pendingFileName && (
                                        <span className="stall-map-modal-file-name">New file: {mapModal.pendingFileName}</span>
                                    )}
                                    {!mapModal.pendingFileName && mapModal.existingMapUrl && (
                                        <span className="stall-map-modal-file-name">Using saved map — choose a file to replace</span>
                                    )}
                                </div>
                                {(mapModal.pendingMapUrl || mapModal.existingMapUrl) && (
                                    <div className="stall-map-modal-preview">
                                        <img
                                            src={mapModal.pendingMapUrl || mapModal.existingMapUrl}
                                            alt="Map preview"
                                        />
                                    </div>
                                )}
                            </section>

                            <footer className="stall-map-modal-footer">
                                <button
                                    type="button"
                                    className="stall-map-modal-btn stall-map-modal-btn-ghost"
                                    onClick={closeStallMapModal}
                                    disabled={mapModalSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="stall-map-modal-btn stall-map-modal-btn-primary"
                                    onClick={handleSaveStallMapModal}
                                    disabled={mapModalSaving}
                                >
                                    {mapModalSaving ? 'Saving…' : 'Save changes'}
                                </button>
                            </footer>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default FoodStallMapUpload;
