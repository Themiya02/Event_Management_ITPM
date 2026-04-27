import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateEvent.css'; // Reusing existing modular styles completely
import { useNavigate, useParams } from 'react-router-dom';

const EditEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        // Step 1
        organizerName: 'Admin', // Dummy fallback as these aren't currently DB-bound explicitly
        organizerEmail: 'admin@eventio.com',
        organizerPhone: '0712345678',
        organizingBody: 'Staff',
        // Step 2 & 3
        eventTitle: '',
        eventDescription: '',
        eventDate: '',
        eventTime: '',
        venueType: 'Indoor',
        venueName: '',
        seatLimit: '',
        isRegistrationRequired: 'Yes',
        ticketType: 'Free',
        ticketPrice: '',
    });

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                const response = await axios.get(`${apiUrl}/api/events/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const dbEvent = response.data;

                // Hydrate frontend form with backend database object mappings
                setFormData(prev => ({
                    ...prev,
                    eventTitle: dbEvent.name || '',
                    eventDescription: dbEvent.description || '',
                    eventDate: dbEvent.date ? dbEvent.date.split('T')[0] : '',
                    eventTime: dbEvent.time || '',
                    venueType: dbEvent.campusType === 'indoor' ? 'Indoor' : 'Outdoor',
                    venueName: dbEvent.location || '',
                    seatLimit: dbEvent.seatLimit ? String(dbEvent.seatLimit) : '',
                    isRegistrationRequired: dbEvent.isOpenRegistration ? 'No' : 'Yes',
                    ticketType: dbEvent.isPaid ? 'Paid' : 'Free',
                    ticketPrice: dbEvent.price ? String(dbEvent.price) : '',
                }));
                setLoading(false);
            } catch (err) {
                console.error('Failed to load event data:', err);
                alert('Event not found or unauthorized connection block.');
                navigate('/organizer/events');
            }
        };
        fetchEventDetails();
    }, [eventId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.organizerName.trim()) newErrors.organizerName = "Organizer Name is required";
            if (!formData.organizingBody.trim()) newErrors.organizingBody = "Organizing Club/Body is required";
            if (!formData.organizerEmail.includes('@')) newErrors.organizerEmail = "Email must include an '@' symbol";
            if (!/^\d{10}$/.test(formData.organizerPhone.trim())) newErrors.organizerPhone = "Phone number must be exactly 10 digits";
        } else if (step === 2) {
            if (!formData.eventTitle.trim()) newErrors.eventTitle = "Event Title is required";
            if (!formData.eventDescription.trim()) newErrors.eventDescription = "Event Description is required";
            if (!formData.eventDate) newErrors.eventDate = "Date is required";
            if (!formData.eventTime) newErrors.eventTime = "Time is required";
        } else if (step === 3) {
            if (!formData.venueName.trim()) newErrors.venueName = "Venue Name is required";
            if (formData.venueType === 'Indoor' && (!formData.seatLimit || parseInt(formData.seatLimit, 10) <= 0)) {
                newErrors.seatLimit = "Seat Limit is required for indoor events max capacity";
            }
            if (formData.ticketType === 'Paid' && (!formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0)) {
                newErrors.ticketPrice = "Please enter a valid ticket price greater than 0";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateStep(3)) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                const payload = {
                    name: formData.eventTitle,
                    description: formData.eventDescription,
                    date: formData.eventDate,
                    time: formData.eventTime,
                    location: formData.venueName,
                    campusType: formData.venueType.toLowerCase(),
                    seatLimit: formData.venueType === 'Indoor' ? formData.seatLimit : null,
                    isPaid: formData.ticketType === 'Paid',
                    price: formData.ticketType === 'Paid' ? formData.ticketPrice : 0,
                    isOpenRegistration: formData.isRegistrationRequired === 'No'
                };

                const response = await axios.put(`${apiUrl}/api/events/${eventId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Event Overwritten in DB:', response.data);
                alert('Event Updated Successfully!');
                navigate('/organizer/events');
            } catch (error) {
                console.error('Error updating event:', error);
                const errorMsg = error.response?.data?.message || error.message;
                alert('Update Error: ' + errorMsg);
            }
        }
    };

    if (loading) return <div className="create-event-page"><h3 style={{ textAlign: 'center', marginTop: '5rem' }}>Loading Event Constraints...</h3></div>;

    const ticketPriceNum = parseFloat(formData.ticketPrice) || 0;
    const campusFee = formData.ticketType === 'Paid' ? (ticketPriceNum * 0.05).toFixed(2) : 0;
    const finalPrice = formData.ticketType === 'Paid' ? (ticketPriceNum + parseFloat(campusFee)).toFixed(2) : 0;

    return (
        <div className="create-event-page animation-fade-in">
            <div className="create-event-header">
                <h1 className="page-title">Edit Event: {formData.eventTitle}</h1>
                <p className="page-subtitle">Revise any parameters below and securely overwrite your public event details.</p>
            </div>

            <div className="stepper-container glass-panel">
                <div className="stepper">
                    {['Organizer', 'Details', 'Venue & Ticketing'].map((step, idx) => (
                        <div key={idx} className={`step ${currentStep > idx + 1 ? 'completed' : currentStep === idx + 1 ? 'active' : ''}`}>
                            <div className="step-circle">{currentStep > idx + 1 ? '✓' : idx + 1}</div>
                            <span className="step-label">{step}</span>
                            {idx < 2 && <div className="step-line"></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-container glass-panel">
                <form onSubmit={handleSubmit} noValidate>

                    {/* STEP 1: ORGANIZER DETAILS */}
                    {currentStep === 1 && (
                        <div className="form-step slide-in">
                            <h2>Step 1: Organizer Details</h2>
                            <p className="step-desc">Modify contact information for attendees</p>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Organizer Name</label>
                                    <input type="text" name="organizerName" value={formData.organizerName} onChange={handleChange} className={errors.organizerName ? 'input-error' : ''} />
                                    {errors.organizerName && <span className="error-text">{errors.organizerName}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Organizing Body/Club</label>
                                    <input type="text" name="organizingBody" value={formData.organizingBody} onChange={handleChange} className={errors.organizingBody ? 'input-error' : ''} />
                                    {errors.organizingBody && <span className="error-text">{errors.organizingBody}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Contact Email</label>
                                    <input type="email" name="organizerEmail" value={formData.organizerEmail} onChange={handleChange} className={errors.organizerEmail ? 'input-error' : ''} />
                                    {errors.organizerEmail && <span className="error-text">{errors.organizerEmail}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="organizerPhone" value={formData.organizerPhone} onChange={handleChange} className={errors.organizerPhone ? 'input-error' : ''} />
                                    {errors.organizerPhone && <span className="error-text">{errors.organizerPhone}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: EVENT DETAILS */}
                    {currentStep === 2 && (
                        <div className="form-step slide-in">
                            <h2>Step 2: Core Event Information</h2>
                            <p className="step-desc">Refine public titles and times.</p>
                            <div className="form-group">
                                <label>Event Title</label>
                                <input type="text" name="eventTitle" value={formData.eventTitle} onChange={handleChange} className={errors.eventTitle ? 'input-error' : ''} />
                                {errors.eventTitle && <span className="error-text">{errors.eventTitle}</span>}
                            </div>
                            <div className="form-group">
                                <label>Event Description</label>
                                <textarea name="eventDescription" value={formData.eventDescription} onChange={handleChange} rows={4} className={errors.eventDescription ? 'input-error' : ''}></textarea>
                                {errors.eventDescription && <span className="error-text">{errors.eventDescription}</span>}
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className={errors.eventDate ? 'input-error' : ''} />
                                    {errors.eventDate && <span className="error-text">{errors.eventDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} className={errors.eventTime ? 'input-error' : ''} />
                                    {errors.eventTime && <span className="error-text">{errors.eventTime}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: VENUE & TICKETING */}
                    {currentStep === 3 && (
                        <div className="form-step slide-in">
                            <h2>Step 3: Venue & Constraints</h2>
                            <p className="step-desc">Tweak logistics or pricing requirements</p>

                            <div className="form-group">
                                <label>Campus Venue Type</label>
                                <div className="radio-group">
                                    <label className={`radio-card ${formData.venueType === 'Indoor' ? 'selected' : ''}`}>
                                        <input type="radio" name="venueType" value="Indoor" checked={formData.venueType === 'Indoor'} onChange={handleChange} />
                                        <span className="radio-icon">🏛️</span>
                                        <span className="radio-text">Indoor</span>
                                    </label>
                                    <label className={`radio-card ${formData.venueType === 'Outdoor' ? 'selected' : ''}`}>
                                        <input type="radio" name="venueType" value="Outdoor" checked={formData.venueType === 'Outdoor'} onChange={handleChange} />
                                        <span className="radio-icon">🌳</span>
                                        <span className="radio-text">Outdoor</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Venue Name / Address</label>
                                    <input type="text" name="venueName" value={formData.venueName} onChange={handleChange} className={errors.venueName ? 'input-error' : ''} />
                                    {errors.venueName && <span className="error-text">{errors.venueName}</span>}
                                </div>
                                {formData.venueType === 'Indoor' && (
                                    <div className="form-group animation-fade-in">
                                        <label>Seat Limit / Capacity</label>
                                        <input type="number" name="seatLimit" value={formData.seatLimit} onChange={handleChange} min="1" className={errors.seatLimit ? 'input-error' : ''} />
                                        {errors.seatLimit && <span className="error-text">{errors.seatLimit}</span>}
                                    </div>
                                )}
                            </div>

                            <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0', opacity: 0.5 }} />

                            <div className="form-group">
                                <label>Registration Requirement</label>
                                <div className="radio-group vertical-radio">
                                    <label className={`radio-card ${formData.isRegistrationRequired === 'Yes' ? 'selected' : ''}`}>
                                        <input type="radio" name="isRegistrationRequired" value="Yes" checked={formData.isRegistrationRequired === 'Yes'} onChange={handleChange} />
                                        <div className="radio-content">
                                            <span className="radio-title">📝 Must Register Student</span>
                                        </div>
                                    </label>
                                    <label className={`radio-card ${formData.isRegistrationRequired === 'No' ? 'selected' : ''}`}>
                                        <input type="radio" name="isRegistrationRequired" value="No" checked={formData.isRegistrationRequired === 'No'} onChange={handleChange} />
                                        <div className="radio-content">
                                            <span className="radio-title">🚪 Open Event (Walk-in)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group space-top">
                                <label>Ticket Pricing</label>
                                <div className="radio-group">
                                    <label className={`radio-card ${formData.ticketType === 'Free' ? 'selected' : ''}`}>
                                        <input type="radio" name="ticketType" value="Free" checked={formData.ticketType === 'Free'} onChange={handleChange} />
                                        <span className="radio-icon">🎟️</span>
                                        <span className="radio-text">Free Ticket</span>
                                    </label>
                                    <label className={`radio-card ${formData.ticketType === 'Paid' ? 'selected' : ''}`}>
                                        <input type="radio" name="ticketType" value="Paid" checked={formData.ticketType === 'Paid'} onChange={handleChange} />
                                        <span className="radio-icon">💳</span>
                                        <span className="radio-text">Paid Ticket</span>
                                    </label>
                                </div>
                            </div>

                            {formData.ticketType === 'Paid' && (
                                <div className="price-calculator glass-panel-inner">
                                    <div className="form-group">
                                        <label>Base Ticket Price (Rs)</label>
                                        <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} min="1" step="0.01" className={errors.ticketPrice ? 'input-error' : ''} />
                                        {errors.ticketPrice && <span className="error-text">{errors.ticketPrice}</span>}
                                    </div>

                                    <div className="fee-breakdown">
                                        <div className="fee-row total">
                                            <span>Total Price to Attendee:</span>
                                            <span>Rs {finalPrice}</span>
                                        </div>
                                        <p className="fee-note">* Recalculated including the mandatory 5% campus facility fee.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FORM ACTIONS */}
                    <div className="form-actions">
                        {currentStep > 1 && (
                            <button type="button" className="btn btn-secondary" onClick={prevStep}>
                                Back
                            </button>
                        )}
                        <span className="spacer"></span>
                        {currentStep < 3 ? (
                            <button type="button" className="btn btn-primary" onClick={nextStep}>
                                Continue Editing
                            </button>
                        ) : (
                            <button type="submit" className="btn btn-secondary btn-submit">
                                Update Event 💾
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEvent;
